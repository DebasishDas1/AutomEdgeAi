# workflows/plumbing/nodes.py
# Optimized to match HVAC pattern:
#   - All helpers imported from workflows.base
#   - llm.invoke() throughout
#   - rule_score_lead() replaces URGENCY_CLASSIFY_SYSTEM + LEAD_SCORING_SYSTEM
#   - SUMMARY_COMBINED_SYSTEM: 1 call → JSON {client, internal}
#   - Emergency path preserved: node_emergency_sms still fires before score_lead
import json
import logging
from datetime import datetime

from langchain_core.messages import SystemMessage, HumanMessage

from llm import llm
from core.config import settings
from workflows.base import (
    field_missing,
    merge_extracted,
    parse_json,
    build_lc_messages,
    last_user_msg,
    full_transcript,
    get_appt_slots,
    rule_score_lead,
)
from workflows.plumbing.prompts import (
    PLUMBING_EXPERT_SYSTEM,
    FIELD_COLLECTION_GUIDE,
    EXTRACT_FIELDS_SYSTEM,
    APPOINTMENT_CONFIRM_SYSTEM,
    SUMMARY_COMBINED_SYSTEM,
    SMS_EMERGENCY_DISPATCH,
)
from tools.email import email_tool
from tools.sheets import sheets_tool
from tools.sms import sms_tool

logger = logging.getLogger(__name__)

_REQUIRED = ["name", "email", "issue"]
_SOFT     = ["phone", "location", "issue_type", "has_water_damage", "is_homeowner"]

_FIELD_PRIORITY = [
    "issue",
    "issue_type",
    "problem_area",
    "location",
    "has_water_damage",
    "is_homeowner",
    "name",
    "phone",
    "email",
]

_CONFIRM_SIGNALS = {
    "option", "number", "slot", "works", "perfect", "great", "sure",
    "yes", "sounds good", "lets do", "that one", "morning", "afternoon",
    "pm", "am", "monday", "tuesday", "wednesday", "thursday",
    "friday", "saturday", "sunday", "tomorrow",
}

_GOODBYE_SIGNALS = {
    "bye", "goodbye", "thanks", "thank you", "done",
    "never mind", "all good",
}

_EMERGENCY_KEYWORDS = {
    "burst", "flooding", "flood", "sewage", "backup",
    "overflow", "gushing", "pouring", "water everywhere",
}


def _is_emergency(state: dict) -> bool:
    """True when urgency or issue_type already flagged as emergency."""
    if state.get("urgency") == "emergency" or state.get("issue_type") == "emergency":
        return True
    issue = (state.get("issue") or "").lower()
    return any(kw in issue for kw in _EMERGENCY_KEYWORDS)


def _looks_like_confirmation(text: str) -> bool:
    lower = text.lower()
    return any(sig in lower for sig in _CONFIRM_SIGNALS)


# ══════════════════════════════════════════════════════════════════════════════
# CHAT GRAPH NODES
# ══════════════════════════════════════════════════════════════════════════════

def node_extract_fields(state: dict) -> dict:
    msg = last_user_msg(state)
    if not msg:
        return state

    try:
        resp = llm.invoke(
            [
                SystemMessage(content=EXTRACT_FIELDS_SYSTEM),
                HumanMessage(content=msg),
            ],
            max_tokens=180,
            temperature=0,
        )
        extracted = parse_json(resp.content)
        if extracted:
            # Auto-flag emergency from extracted issue_type
            if extracted.get("issue_type") == "emergency":
                state["urgency"] = "emergency"
            merge_extracted(state, extracted)
    except Exception as exc:
        logger.error(f"field extraction failed [plumbing]: {exc}")

    # Appointment confirmation (skip for emergencies — dispatch handles it)
    if (
        not _is_emergency(state)
        and state.get("appt_slots")
        and not state.get("appt_booked")
        and _looks_like_confirmation(msg)
    ):
        try:
            slots = "\n".join(f"{i+1}. {s}" for i, s in enumerate(state["appt_slots"]))
            resp  = llm.invoke(
                [
                    SystemMessage(content=APPOINTMENT_CONFIRM_SYSTEM),
                    HumanMessage(content=f"{slots}\n\nUser: {msg}"),
                ],
                max_tokens=50,
                temperature=0,
            )
            confirm = parse_json(resp.content)
            if confirm and confirm.get("confirmed"):
                idx = max(0, min(int(confirm.get("slot_index", 0)), len(state["appt_slots"]) - 1))
                state["appt_booked"]    = True
                state["appt_confirmed"] = state["appt_slots"][idx]
                logger.info(f"appointment booked [plumbing]: {state['appt_confirmed']}")
        except Exception as exc:
            logger.error(f"appointment confirm failed [plumbing]: {exc}")

    return state


def node_check_complete(state: dict) -> dict:
    if state.get("is_complete"):
        return state

    # Emergency: only phone + location needed — dispatch immediately
    if _is_emergency(state):
        if not field_missing(state, "phone") and not field_missing(state, "location"):
            logger.info("Complete: emergency — phone + location collected [plumbing]")
            state["is_complete"] = True
            state["appt_booked"] = True  # emergency = immediate dispatch
        return state

    has_required = all(not field_missing(state, f) for f in _REQUIRED)

    if has_required and state.get("appt_booked"):
        state["is_complete"] = True
        return state

    if has_required and not field_missing(state, "name") and state.get("turn_count", 0) >= 3:
        state["is_complete"] = True
        return state

    msg = last_user_msg(state)
    if msg and any(sig in msg.lower() for sig in _GOODBYE_SIGNALS):
        state["is_complete"] = True

    return state


def node_chat_reply(state: dict) -> dict:
    try:
        if not state.get("appt_slots"):
            state["appt_slots"] = get_appt_slots()

        slots = state["appt_slots"]

        sys_msg = (
            PLUMBING_EXPERT_SYSTEM
            .replace("{slot_1}", slots[0])
            .replace("{slot_2}", slots[1])
            .replace("{slot_3}", slots[2])
        )

        all_fields = _REQUIRED + _SOFT
        collected  = {k: state.get(k) for k in all_fields}
        have       = {k: v for k, v in collected.items() if v is not None}
        missing    = {k for k, v in collected.items() if v is None}
        next_field = next((f for f in _FIELD_PRIORITY if f in missing), "none")

        has_required = all(not field_missing(state, f) for f in _REQUIRED)
        phase = (
            "CONFIRM"  if state.get("appt_booked")                    else
            "EMERGENCY" if _is_emergency(state)                        else
            "OFFER"    if has_required                                  else
            "DIAGNOSE"
        )

        guide = FIELD_COLLECTION_GUIDE.format(
            phase=phase,
            next_field=next_field,
            appt_confirmed=state.get("appt_confirmed") or "none",
            collected=json.dumps(have),
            collected_count=len(have),
            total_count=len(all_fields),
            issue_type=state.get("issue_type", "unknown"),
        )

        messages = [SystemMessage(content=sys_msg + "\n" + guide)]
        messages += build_lc_messages(state)

        # Emergency: terse reply, faster
        max_tokens = 150 if _is_emergency(state) else 250
        resp  = llm.invoke(messages, max_tokens=max_tokens, temperature=0.6)
        reply = resp.content.strip()

    except Exception as exc:
        logger.error(f"chat reply failed [plumbing]: {exc}")
        reply = "Sorry, something went wrong. Could you repeat that?"

    state.setdefault("messages", []).append({
        "role":    "assistant",
        "content": reply,
        "ts":      datetime.utcnow().isoformat(),
    })
    state["turn_count"] = state.get("turn_count", 0) + 1
    return state


# ══════════════════════════════════════════════════════════════════════════════
# POST-CHAT GRAPH NODES
# ══════════════════════════════════════════════════════════════════════════════

def node_extract_final(state: dict) -> dict:
    missing = [f for f in _REQUIRED if field_missing(state, f)]
    if not missing:
        return state

    try:
        resp = llm.invoke(
            [
                SystemMessage(content=EXTRACT_FIELDS_SYSTEM),
                HumanMessage(content=full_transcript(state)),
            ],
            max_tokens=200,
            temperature=0,
        )
        extracted = parse_json(resp.content)
        if extracted:
            merge_extracted(state, extracted)
    except Exception as exc:
        logger.error(f"final extraction failed [plumbing]: {exc}")

    return state


def node_score_urgency(state: dict) -> dict:
    """
    Rule-based urgency + scoring (zero LLM tokens).
    Replaces URGENCY_CLASSIFY_SYSTEM + LEAD_SCORING_SYSTEM.
    Emergency fast-path: skip if already flagged during chat.
    """
    logger.info("node_score_urgency [plumbing]")

    # Fast path: trust emergency already set during chat
    if _is_emergency(state):
        state["urgency"] = "emergency"
        logger.info("urgency=emergency (fast path) [plumbing]")

    state["vertical"] = "plumbing"
    result = rule_score_lead(state)
    state.update(result)
    logger.info(f"scored [plumbing]: {result['score']} ({result['score_number']}) urgency={result['urgency']}")
    return state


def node_emergency_sms(state: dict) -> dict:
    """Emergency-only: immediate SMS dispatch. Routine leads → email only."""
    logger.info("node_emergency_sms [plumbing]")

    if not state.get("phone"):
        logger.info("no phone for emergency SMS [plumbing]")
        return state

    try:
        msg = SMS_EMERGENCY_DISPATCH.format(
            name=state.get("name", "there"),
            location=state.get("location", "your location"),
            business_phone=settings.BUSINESS_PHONE,
        )
        result = sms_tool.send_sms(to=state["phone"], body=msg)
        state["sms_sent"] = result.get("status") == "sent"
        logger.info(f"emergency SMS sent={state['sms_sent']} [plumbing]")
    except Exception as exc:
        logger.error(f"emergency SMS failed [plumbing]: {exc}")
        state["sms_sent"] = False

    return state


def node_score_lead(state: dict) -> dict:
    """No-op: scoring done in node_score_urgency. Kept for graph wiring."""
    logger.info("node_score_lead [plumbing] — already scored, skipping")
    return state


def node_generate_summary(state: dict) -> dict:
    """Single LLM call → JSON {client, internal}. Matches HVAC pattern."""
    logger.info("node_generate_summary [plumbing]")

    context = {
        "name":            state.get("name"),
        "issue":           state.get("issue"),
        "issue_type":      state.get("issue_type"),
        "problem_area":    state.get("problem_area"),
        "location":        state.get("location"),
        "has_water_damage":state.get("has_water_damage"),
        "urgency":         state.get("urgency"),
        "appt":            state.get("appt_confirmed"),
        "score":           state.get("score"),
    }

    try:
        resp   = llm.invoke(
            [
                SystemMessage(content=SUMMARY_COMBINED_SYSTEM),
                HumanMessage(content=json.dumps(context)),
            ],
            max_tokens=300,
            temperature=0.3,
        )
        result = parse_json(resp.content)
        if result:
            state["summary"]          = result.get("client")
            state["internal_summary"] = result.get("internal")
    except Exception as exc:
        logger.error(f"summary failed [plumbing]: {exc}")
        is_emerg   = _is_emergency(state)
        appt_line  = "A plumber is being dispatched now." if is_emerg else f"Appointment: {state.get('appt_confirmed', 'to be scheduled')}."
        state["summary"] = (
            f"We discussed your {state.get('issue', 'plumbing issue')} "
            f"in {state.get('location', 'your area')}. {appt_line}"
        )
        state["internal_summary"] = (
            f"{'EMERGENCY ' if is_emerg else ''}"
            f"{(state.get('score') or 'warm').upper()} - "
            f"Issue: {state.get('issue')} | {state.get('score_reason')}"
        )

    return state


def node_send_email(state: dict) -> dict:
    if not state.get("email"):
        return state

    try:
        name     = state.get("name", "there")
        is_emerg = _is_emergency(state)

        if is_emerg:
            action_section = f"""
            <div style="background:#fef2f2;border:1px solid #fca5a5;
                        border-radius:8px;padding:16px;margin:16px 0;">
                <h3 style="margin:0 0 8px;color:#991b1b;">Emergency Dispatch Confirmed</h3>
                <p style="margin:4px 0;font-size:15px;font-weight:600;">
                    A plumber is on the way to {state.get("location", "your location")}.
                </p>
                <p style="margin:8px 0;color:#555;">
                    Keep your main water shutoff CLOSED until the plumber arrives.
                    You will receive a call within 15 minutes.
                </p>
                <p style="margin:4px 0;color:#555;">
                    Questions? Call <strong>{settings.BUSINESS_PHONE}</strong>
                </p>
            </div>
            """
        elif state.get("appt_confirmed"):
            action_section = f"""
            <div style="background:#f0fdf4;border:1px solid #86efac;
                        border-radius:8px;padding:16px;margin:16px 0;">
                <h3 style="margin:0 0 8px;color:#166534;">Appointment Confirmed</h3>
                <p style="margin:4px 0;font-size:16px;font-weight:600;">{state["appt_confirmed"]}</p>
                <p style="margin:4px 0;color:#555;">
                    Our plumber calls 20 minutes before arrival.
                    No work begins without your approval and a full quote.
                </p>
            </div>
            """
        else:
            action_section = f"""
            <div style="background:#fefce8;border:1px solid #fde047;
                        border-radius:8px;padding:16px;margin:16px 0;">
                <p style="margin:0;">Reply or call <strong>{settings.BUSINESS_PHONE}</strong> to schedule.</p>
            </div>
            """

        subject = (
            "Emergency plumbing — plumber dispatched"
            if is_emerg
            else "Your plumbing appointment is confirmed"
        )

        html_body = f"""
        <!DOCTYPE html><html>
        <body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;">
            <h2 style="color:#0D1B2A;">
                {"Emergency Plumbing Response" if is_emerg else "Plumbing Appointment Summary"}
            </h2>
            <p>Hi {name},</p>
            <p>{state.get("summary", "Here is a summary of our consultation.")}</p>
            {action_section}
            <hr style="border:none;border-top:1px solid #e5e4e2;margin:24px 0;">
            <p style="color:#666;font-size:13px;">
                Questions? Call <strong>{settings.BUSINESS_PHONE}</strong>.<br>
                automedge Plumbing Team
            </p>
        </body></html>
        """

        result = email_tool.send_email(
            to=state["email"],
            subject=subject,
            html=html_body,
            from_name="automedge Plumbing",
        )
        state["email_sent"] = result.get("status") == "sent"
        logger.info(f"email sent={state['email_sent']} to {state['email']} [plumbing]")

    except Exception as exc:
        logger.error(f"email failed [plumbing]: {exc}")
        state["email_sent"] = False

    return state


def node_save_sheets(state: dict) -> dict:
    try:
        score = state.get("score", "warm")
        row = [
            datetime.utcnow().isoformat(),
            state.get("name") or "",
            state.get("email") or "",
            state.get("phone") or "",
            state.get("location") or "",
            state.get("issue") or "",
            state.get("issue_type") or "",
            state.get("problem_area") or "",
            state.get("duration") or "",
            str(state.get("is_getting_worse") or ""),
            str(state.get("has_water_damage") or ""),
            str(state.get("main_shutoff_off") or ""),
            state.get("property_type") or "",
            str(state.get("is_homeowner") or ""),
            state.get("urgency") or "",
            score.upper(),
            str(state.get("score_number") or ""),
            state.get("score_reason") or "",
            str(state.get("appt_booked", False)),
            state.get("appt_confirmed") or "",
            str(state.get("sms_sent", False)),
            str(state.get("email_sent", False)),
            str(state.get("turn_count", 0)),
            state.get("internal_summary") or "",
            state.get("session_id") or "",
        ]
        row_num = sheets_tool.save_lead_to_sheet(
            score=score,
            row=row,
            sheet_id=settings.PLUMBING_SHEET_ID,
        )
        state["sheet_row"] = row_num
        logger.info(f"sheets saved row={row_num} [plumbing]")
    except Exception as exc:
        logger.error(f"sheets save failed [plumbing]: {exc}")

    return state