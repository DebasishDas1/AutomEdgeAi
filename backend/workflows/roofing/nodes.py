# workflows/roofing/nodes.py
# Optimized to match HVAC pattern:
#   - All helpers imported from workflows.base
#   - llm.invoke() throughout
#   - rule_score_lead() replaces URGENCY_CLASSIFY_SYSTEM + LEAD_SCORING_SYSTEM
#   - SUMMARY_COMBINED_SYSTEM: 1 call → JSON {client, internal}
#   - Insurance SMS + commercial signals preserved
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
from workflows.roofing.prompts import (
    ROOFING_EXPERT_SYSTEM,
    FIELD_COLLECTION_GUIDE,
    EXTRACT_FIELDS_SYSTEM,
    APPOINTMENT_CONFIRM_SYSTEM,
    SUMMARY_COMBINED_SYSTEM,
    SMS_INSPECTION_CONFIRM,
    SMS_INSURANCE_REMINDER,
)
from tools.email import email_tool
from tools.sheets import sheets_tool
from tools.sms import sms_tool

logger = logging.getLogger(__name__)

_REQUIRED = ["name", "email", "issue"]
_SOFT     = ["phone", "location", "damage_type", "has_interior_leak", "is_homeowner"]

_FIELD_PRIORITY = [
    "issue",
    "damage_type",
    "has_interior_leak",
    "storm_date",
    "has_insurance",
    "location",
    "roof_age",
    "property_type",
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


def _is_storm_insurance_lead(state: dict) -> bool:
    return (
        state.get("damage_type") == "storm"
        and state.get("has_insurance") is True
    )


def _is_commercial(state: dict) -> bool:
    return (state.get("property_type") or "").lower() in {"commercial", "multi-unit", "apartment"}


def _looks_like_confirmation(text: str) -> bool:
    return any(sig in text.lower() for sig in _CONFIRM_SIGNALS)


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
            # Map damage_type → issue for base state compatibility
            if extracted.get("damage_type") and field_missing(state, "issue"):
                extracted["issue"] = extracted["damage_type"]
            merge_extracted(state, extracted)
    except Exception as exc:
        logger.error(f"field extraction failed [roofing]: {exc}")

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
                logger.info(f"appointment booked [roofing]: {state['appt_confirmed']}")
        except Exception as exc:
            logger.error(f"appointment confirm failed [roofing]: {exc}")

    return state


def node_check_complete(state: dict) -> dict:
    if state.get("is_complete"):
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
            ROOFING_EXPERT_SYSTEM
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
            "CONFIRM"  if state.get("appt_booked") else
            "OFFER"    if has_required              else
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
        logger.error(f"chat reply failed [roofing]: {exc}")
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
            if extracted.get("damage_type") and field_missing(state, "issue"):
                extracted["issue"] = extracted["damage_type"]
            merge_extracted(state, extracted)
    except Exception as exc:
        logger.error(f"final extraction failed [roofing]: {exc}")

    return state


def node_score_urgency(state: dict) -> dict:
    """
    Rule-based urgency + scoring (zero LLM tokens).
    Replaces URGENCY_CLASSIFY_SYSTEM + LEAD_SCORING_SYSTEM.
    Storm fast-path: if already flagged during chat, skip to scoring.
    """
    logger.info("node_score_urgency [roofing]")

    # Fast path: storm already confirmed during chat
    if state.get("damage_type") == "storm" and not state.get("urgency"):
        state["urgency"] = "storm_damage"
        logger.info("urgency=storm_damage (fast path) [roofing]")

    state["vertical"] = "roofing"
    result = rule_score_lead(state)
    state.update(result)
    logger.info(f"scored [roofing]: {result['score']} ({result['score_number']}) urgency={result['urgency']}")
    return state


def node_insurance_sms(state: dict) -> dict:
    """
    Storm + insurance leads only.
    Pre-inspection SMS: reminds homeowner to have policy number ready.
    Improves show rate — homeowner is prepared and feels more committed.
    Unique to roofing; no other vertical has this touchpoint.
    """
    logger.info("node_insurance_sms [roofing]")

    if not state.get("phone"):
        logger.info("no phone for insurance SMS [roofing]")
        return state

    if not _is_storm_insurance_lead(state):
        logger.info("not a storm+insurance lead — skipping [roofing]")
        return state

    try:
        msg = SMS_INSURANCE_REMINDER.format(
            name=state.get("name", "there"),
            appt_datetime=state.get("appt_confirmed", "your upcoming inspection"),
            business_phone=settings.BUSINESS_PHONE,
        )
        result = sms_tool.send_sms(to=state["phone"], body=msg)
        state["sms_sent"] = result.get("status") == "sent"
        logger.info(f"insurance SMS sent={state['sms_sent']} [roofing]")
    except Exception as exc:
        logger.error(f"insurance SMS failed [roofing]: {exc}")
        state["sms_sent"] = False

    return state


def node_score_lead(state: dict) -> dict:
    """No-op: scoring done in node_score_urgency. Kept for graph wiring."""
    logger.info("node_score_lead [roofing] — already scored, skipping")
    return state


def node_generate_summary(state: dict) -> dict:
    """Single LLM call → JSON {client, internal}. Matches HVAC pattern."""
    logger.info("node_generate_summary [roofing]")

    is_storm_ins = _is_storm_insurance_lead(state)
    is_comm      = _is_commercial(state)

    context = {
        "name":                state.get("name"),
        "damage_type":         state.get("damage_type"),
        "damage_detail":       state.get("damage_detail"),
        "storm_date":          state.get("storm_date"),
        "location":            state.get("location"),
        "has_insurance":       state.get("has_insurance"),
        "has_interior_leak":   state.get("has_interior_leak"),
        "property_type":       state.get("property_type"),
        "appt":                state.get("appt_confirmed"),
        "score":               state.get("score"),
        "is_storm_insurance":  is_storm_ins,
        "is_commercial":       is_comm,
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
        logger.error(f"summary failed [roofing]: {exc}")
        ins_tag  = "INSURANCE " if is_storm_ins else ""
        comm_tag = "COMMERCIAL " if is_comm else ""
        state["summary"] = (
            f"We discussed your {state.get('damage_type', 'roof')} issue "
            f"in {state.get('location', 'your area')}. "
            f"Inspection: {state.get('appt_confirmed', 'to be scheduled')}."
        )
        state["internal_summary"] = (
            f"{(state.get('score') or 'warm').upper()} {ins_tag}{comm_tag}- "
            f"{state.get('damage_type')} | {state.get('score_reason')}"
        ).strip()

    return state


def node_send_email(state: dict) -> dict:
    if not state.get("email"):
        return state

    try:
        name         = state.get("name", "there")
        is_storm_ins = _is_storm_insurance_lead(state)
        is_comm      = _is_commercial(state)

        appt_section = (
            f"""
            <div style="background:#f0fdf4;border:1px solid #86efac;
                        border-radius:8px;padding:16px;margin:16px 0;">
                <h3 style="margin:0 0 8px;color:#166534;">Inspection Confirmed</h3>
                <p style="margin:4px 0;font-size:16px;font-weight:600;">{state["appt_confirmed"]}</p>
                <p style="margin:4px 0;color:#555;">Free roof inspection with full photo documentation.</p>
                <p style="margin:4px 0;color:#555;">Our inspector calls 30 minutes before arrival. No work begins without your approval.</p>
            </div>
            """
            if state.get("appt_confirmed") else
            f"""
            <div style="background:#fefce8;border:1px solid #fde047;
                        border-radius:8px;padding:16px;margin:16px 0;">
                <p style="margin:0;">Reply or call <strong>{settings.BUSINESS_PHONE}</strong> to schedule your free inspection.</p>
            </div>
            """
        )

        insurance_section = ""
        if is_storm_ins:
            insurance_section = """
            <div style="background:#eff6ff;border:1px solid #93c5fd;
                        border-radius:8px;padding:16px;margin:16px 0;">
                <h3 style="margin:0 0 8px;color:#1e40af;">About Your Insurance Claim</h3>
                <p style="margin:4px 0;color:#555;">
                    Our inspector will document all storm damage with photos and measurements —
                    exactly what your adjuster needs. We work directly with insurance adjusters
                    and can guide you through every step of the claims process.
                </p>
                <p style="margin:8px 0 0;color:#555;">
                    If you have your policy number handy, bring it to the inspection.
                </p>
            </div>
            """

        commercial_section = ""
        if is_comm:
            commercial_section = """
            <div style="background:#f5f3ff;border:1px solid #c4b5fd;
                        border-radius:8px;padding:16px;margin:16px 0;">
                <p style="margin:0;color:#555;">
                    For commercial properties, our inspector will assess all roofing sections
                    and provide a comprehensive scope report before any quote is generated.
                </p>
            </div>
            """

        subject = (
            "Your roof inspection + insurance claim guidance"
            if is_storm_ins
            else "Your roof inspection is confirmed"
        )

        html_body = f"""
        <!DOCTYPE html><html>
        <body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;">
            <h2 style="color:#0D1B2A;">Your Roof Inspection Summary</h2>
            <p>Hi {name},</p>
            <p>{state.get("summary", "Here is a summary of your roof inspection details.")}</p>
            {appt_section}
            {insurance_section}
            {commercial_section}
            <hr style="border:none;border-top:1px solid #e5e4e2;margin:24px 0;">
            <p style="color:#666;font-size:13px;">
                Questions? Call <strong>{settings.BUSINESS_PHONE}</strong>.<br>
                automedge Roofing Team
            </p>
        </body></html>
        """

        result = email_tool.send_email(
            to=state["email"],
            subject=subject,
            html=html_body,
            from_name="automedge Roofing",
        )
        state["email_sent"] = result.get("status") == "sent"
        logger.info(f"email sent={state['email_sent']} to {state['email']} [roofing]")

    except Exception as exc:
        logger.error(f"email failed [roofing]: {exc}")
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
            state.get("damage_type") or "",
            state.get("damage_detail") or "",
            state.get("storm_date") or "",
            state.get("roof_age") or "",
            str(state.get("has_insurance") or ""),
            str(state.get("insurance_contacted") or ""),
            str(state.get("adjuster_involved") or ""),
            str(state.get("has_interior_leak") or ""),
            str(state.get("is_homeowner") or ""),
            state.get("property_type") or "",
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
            sheet_id=settings.ROOFING_SHEET_ID,
        )
        state["sheet_row"] = row_num
        logger.info(f"sheets saved row={row_num} [roofing]")
    except Exception as exc:
        logger.error(f"sheets save failed [roofing]: {exc}")

    return state