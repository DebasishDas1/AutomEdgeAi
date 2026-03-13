# workflows/pest_control/nodes.py
# Optimized to match HVAC pattern:
#   - All helpers imported from workflows.base (no local copies)
#   - llm.invoke() throughout (no invoke_llm)
#   - rule_score_lead() replaces URGENCY_CLASSIFY_SYSTEM + LEAD_SCORING_SYSTEM LLM calls
#   - SUMMARY_COMBINED_SYSTEM: 1 call → JSON {client, internal}
#   - Removed: URGENCY_CLASSIFY_SYSTEM, LEAD_SCORING_SYSTEM, SUMMARY_CLIENT_SYSTEM,
#              SUMMARY_INTERNAL_SYSTEM imports
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
from workflows.pest_control.prompts import (
    PEST_EXPERT_SYSTEM,
    FIELD_COLLECTION_GUIDE,
    EXTRACT_FIELDS_SYSTEM,
    APPOINTMENT_CONFIRM_SYSTEM,
    SUMMARY_COMBINED_SYSTEM,
)
from tools.email import email_tool
from tools.sheets import sheets_tool

logger = logging.getLogger(__name__)

_REQUIRED = ["name", "email", "pest_type"]
_SOFT     = ["phone", "location", "infestation_area", "has_damage", "is_homeowner"]

_FIELD_PRIORITY = [
    "pest_type",
    "infestation_area",
    "location",
    "has_damage",
    "tried_treatment",
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
    "never mind", "all good", "that's all", "no thanks",
}


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
            max_tokens=150,
            temperature=0,
        )
        extracted = parse_json(resp.content)
        if extracted:
            # Mirror pest_type → issue for base state compatibility
            if extracted.get("pest_type") and field_missing(state, "pest_type"):
                extracted["issue"] = extracted["pest_type"]
            merge_extracted(state, extracted)
    except Exception as exc:
        logger.error(f"field extraction failed [pest]: {exc}")

    # Appointment confirmation
    if (
        state.get("appt_slots")
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
                logger.info(f"appointment booked [pest]: {state['appt_confirmed']}")
        except Exception as exc:
            logger.error(f"appointment confirm failed [pest]: {exc}")

    return state


def node_check_complete(state: dict) -> dict:
    if state.get("is_complete"):
        return state

    has_required = all(not field_missing(state, f) for f in _REQUIRED)

    if has_required and state.get("appt_booked"):
        state["is_complete"] = True
        return state

    # Graceful exit: required + name+email + enough turns
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
            PEST_EXPERT_SYSTEM
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
            "CONFIRM"  if state.get("appt_booked")   else
            "OFFER"    if has_required                else
            "DIAGNOSE"
        )

        guide = FIELD_COLLECTION_GUIDE.format(
            phase=phase,
            next_field=next_field,
            appt_confirmed=state.get("appt_confirmed") or "none",
            collected=json.dumps(have),
            collected_count=len(have),
            total_count=len(all_fields),
        )

        messages = [SystemMessage(content=sys_msg + "\n" + guide)]
        messages += build_lc_messages(state)

        resp  = llm.invoke(messages, max_tokens=250, temperature=0.7)
        reply = resp.content.strip()

    except Exception as exc:
        logger.error(f"chat reply failed [pest]: {exc}")
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
            if extracted.get("pest_type") and field_missing(state, "pest_type"):
                extracted["issue"] = extracted["pest_type"]
            merge_extracted(state, extracted)
    except Exception as exc:
        logger.error(f"final extraction failed [pest]: {exc}")

    return state


def node_score_urgency(state: dict) -> dict:
    """
    Rule-based urgency + lead scoring in one call (zero LLM tokens).
    Replaces the old URGENCY_CLASSIFY_SYSTEM + LEAD_SCORING_SYSTEM LLM calls.
    Sets state: urgency, score, score_number, score_reason.
    """
    logger.info("node_score_urgency [pest]")
    state["vertical"] = "pest_control"
    result = rule_score_lead(state)
    state.update(result)
    logger.info(f"scored [pest]: {result['score']} ({result['score_number']}) urgency={result['urgency']}")
    return state


def node_score_lead(state: dict) -> dict:
    """
    No-op: scoring already done in node_score_urgency.
    Kept so graph wiring doesn't change.
    """
    logger.info("node_score_lead [pest] — already scored, skipping")
    return state


def node_generate_summary(state: dict) -> dict:
    """Single LLM call → JSON {client, internal}. Matches HVAC pattern."""
    logger.info("node_generate_summary [pest]")

    context = {
        "name":             state.get("name"),
        "pest_type":        state.get("pest_type"),
        "infestation_area": state.get("infestation_area"),
        "location":         state.get("location"),
        "has_damage":       state.get("has_damage"),
        "urgency":          state.get("urgency"),
        "wants_annual":     state.get("wants_annual"),
        "appt":             state.get("appt_confirmed"),
        "score":            state.get("score"),
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
        logger.error(f"summary failed [pest]: {exc}")
        state["summary"] = (
            f"We discussed your {state.get('pest_type', 'pest')} issue "
            f"in {state.get('location', 'your area')}. "
            f"Appointment: {state.get('appt_confirmed', 'to be scheduled')}."
        )
        state["internal_summary"] = (
            f"{(state.get('score') or 'warm').upper()} - "
            f"Pest: {state.get('pest_type')} | {state.get('score_reason')}"
        )

    return state


def node_send_email(state: dict) -> dict:
    if not state.get("email"):
        return state

    try:
        name = state.get("name", "there")

        appt_section = (
            f"""
            <div style="background:#f0fdf4;border:1px solid #86efac;
                        border-radius:8px;padding:16px;margin:16px 0;">
                <h3 style="margin:0 0 8px;color:#166534;">Inspection Confirmed</h3>
                <p style="margin:4px 0;font-size:16px;font-weight:600;">{state["appt_confirmed"]}</p>
                <p style="margin:4px 0;color:#555;">Free pest inspection — specialist calls 15 minutes before arrival.</p>
            </div>
            """
            if state.get("appt_confirmed") else
            f"""
            <div style="background:#fefce8;border:1px solid #fde047;
                        border-radius:8px;padding:16px;margin:16px 0;">
                <p style="margin:0;">Reply to this email or call <strong>{settings.BUSINESS_PHONE}</strong> to get scheduled.</p>
            </div>
            """
        )

        annual_section = ""
        if state.get("wants_annual"):
            annual_section = """
            <div style="background:#eff6ff;border:1px solid #93c5fd;
                        border-radius:8px;padding:16px;margin:16px 0;">
                <h3 style="margin:0 0 8px;color:#1e40af;">Annual Protection Plan</h3>
                <p style="margin:0;color:#555;">
                    Our specialist will walk you through annual protection plan options during
                    the inspection — quarterly treatments and free re-treatments included.
                </p>
            </div>
            """

        html_body = f"""
        <!DOCTYPE html><html>
        <body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;">
            <h2 style="color:#0D1B2A;">Your Pest Control Inspection Summary</h2>
            <p>Hi {name},</p>
            <p>{state.get("summary", "Here is a summary of our consultation.")}</p>
            {appt_section}
            {annual_section}
            <hr style="border:none;border-top:1px solid #e5e4e2;margin:24px 0;">
            <p style="color:#666;font-size:13px;">
                Questions? Reply or call <strong>{settings.BUSINESS_PHONE}</strong>.<br>
                automedge Pest Control Team
            </p>
        </body></html>
        """

        result = email_tool.send_email(
            to=state["email"],
            subject="Your pest inspection summary + appointment",
            html=html_body,
            from_name="automedge Pest Control",
        )
        state["email_sent"] = result.get("status") == "sent"
        logger.info(f"email sent={state['email_sent']} to {state['email']} [pest]")

    except Exception as exc:
        logger.error(f"email failed [pest]: {exc}")
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
            state.get("pest_type") or "",
            state.get("infestation_area") or "",
            state.get("location") or "",
            state.get("duration") or "",
            str(state.get("has_damage") or ""),
            str(state.get("tried_treatment") or ""),
            state.get("property_type") or "",
            str(state.get("is_homeowner") or ""),
            str(state.get("wants_annual") or ""),
            state.get("urgency") or "",
            score.upper(),
            str(state.get("score_number") or ""),
            state.get("score_reason") or "",
            str(state.get("appt_booked", False)),
            state.get("appt_confirmed") or "",
            str(state.get("email_sent", False)),
            str(state.get("turn_count", 0)),
            state.get("internal_summary") or "",
            state.get("session_id") or "",
        ]
        row_num = sheets_tool.save_lead_to_sheet(
            score=score,
            row=row,
            sheet_id=settings.PEST_SHEET_ID,
        )
        state["sheet_row"] = row_num
        logger.info(f"sheets saved row={row_num} [pest]")
    except Exception as exc:
        logger.error(f"sheets save failed [pest]: {exc}")

    return state