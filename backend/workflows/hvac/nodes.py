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

from workflows.hvac.prompts import (
    HVAC_EXPERT_SYSTEM,
    FIELD_COLLECTION_GUIDE,
    EXTRACT_FIELDS_SYSTEM,
    APPOINTMENT_CONFIRM_SYSTEM,
    SUMMARY_COMBINED_SYSTEM,
)

from tools.email import email_tool
from tools.sheets import sheets_tool

logger = logging.getLogger(__name__)

_REQUIRED = ["name", "email", "issue"]
_SOFT = ["phone", "location", "urgency"]

_FIELD_PRIORITY = [
    "issue",
    "location",
    "urgency",
    "name",
    "phone",
    "email",
]

_CONFIRM_SIGNALS = {
    "option","number","slot","works","perfect","great","sure",
    "yes","sounds good","lets do","that one","morning","afternoon",
    "pm","am","monday","tuesday","wednesday","thursday",
    "friday","saturday","sunday","tomorrow",
}

_GOODBYE_SIGNALS = {
    "bye","goodbye","thanks","thank you","done",
    "never mind","all good"
}


def _looks_like_confirmation(text: str) -> bool:
    lower = text.lower()
    return any(sig in lower for sig in _CONFIRM_SIGNALS)


# ═══════════════════════════════════════
# FIELD EXTRACTION (RUN FIRST)
# ═══════════════════════════════════════

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
            max_tokens=120,
            temperature=0,
        )

        extracted = parse_json(resp.content)

        if extracted:
            merge_extracted(state, extracted)

    except Exception as exc:
        logger.error(f"field extraction failed: {exc}")

    # appointment confirmation detection
    if (
        state.get("appt_slots")
        and not state.get("appt_booked")
        and _looks_like_confirmation(msg)
    ):

        try:
            slots = "\n".join(
                f"{i+1}. {s}" for i, s in enumerate(state["appt_slots"])
            )

            resp = llm.invoke(
                [
                    SystemMessage(content=APPOINTMENT_CONFIRM_SYSTEM),
                    HumanMessage(content=f"{slots}\n\nUser: {msg}"),
                ],
                max_tokens=50,
                temperature=0,
            )

            confirm = parse_json(resp.content)

            if confirm and confirm.get("confirmed"):

                idx = int(confirm.get("slot_index", 0))
                idx = max(0, min(idx, len(state["appt_slots"]) - 1))

                state["appt_booked"] = True
                state["appt_confirmed"] = state["appt_slots"][idx]

                logger.info(f"appointment booked: {state['appt_confirmed']}")

        except Exception as exc:
            logger.error(f"appointment confirm failed: {exc}")

    return state


# ═══════════════════════════════════════
# CHECK IF CHAT COMPLETE
# ═══════════════════════════════════════

def node_check_complete(state: dict) -> dict:

    if state.get("is_complete"):
        return state

    has_required = all(not field_missing(state, f) for f in _REQUIRED)

    has_name_email = (
        not field_missing(state, "name")
        and not field_missing(state, "email")
    )

    if has_required and state.get("appt_booked"):
        state["is_complete"] = True
        return state

    if has_required and has_name_email and state.get("turn_count", 0) >= 3:
        state["is_complete"] = True
        return state

    msg = last_user_msg(state)

    if msg and any(sig in msg.lower() for sig in _GOODBYE_SIGNALS):
        state["is_complete"] = True

    return state


# ═══════════════════════════════════════
# LLM CHAT RESPONSE
# ═══════════════════════════════════════

def node_chat_reply(state: dict) -> dict:

    try:

        if not state.get("appt_slots"):
            state["appt_slots"] = get_appt_slots()

        slots = state["appt_slots"]

        sys_msg = (
            HVAC_EXPERT_SYSTEM
            .replace("{slot_1}", slots[0])
            .replace("{slot_2}", slots[1])
            .replace("{slot_3}", slots[2])
        )

        all_fields = _REQUIRED + _SOFT

        collected = {k: state.get(k) for k in all_fields}

        have = {k: v for k, v in collected.items() if v is not None}

        missing = {k for k, v in collected.items() if v is None}

        next_field = next(
            (f for f in _FIELD_PRIORITY if f in missing),
            "none",
        )

        has_required = all(not field_missing(state, f) for f in _REQUIRED)

        if state.get("appt_booked"):
            phase = "CONFIRM"

        elif has_required:
            phase = "OFFER"

        else:
            phase = "DIAGNOSE"

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

        resp = llm.invoke(
            messages,
            max_tokens=250,
            temperature=0.7,
        )

        reply = resp.content.strip()

    except Exception as exc:

        logger.error(f"chat reply failed: {exc}")

        reply = "Sorry, something went wrong. Could you repeat that?"

    state.setdefault("messages", []).append(
        {
            "role": "assistant",
            "content": reply,
            "ts": datetime.utcnow().isoformat(),
        }
    )

    state["turn_count"] = state.get("turn_count", 0) + 1

    return state


# ═══════════════════════════════════════
# FINAL EXTRACTION
# ═══════════════════════════════════════

def node_extract_final(state: dict) -> dict:

    missing = [f for f in _REQUIRED if field_missing(state, f)]

    if not missing:
        return state

    try:

        transcript = full_transcript(state)

        resp = llm.invoke(
            [
                SystemMessage(content=EXTRACT_FIELDS_SYSTEM),
                HumanMessage(content=transcript),
            ],
            max_tokens=150,
            temperature=0,
        )

        extracted = parse_json(resp.content)

        if extracted:
            merge_extracted(state, extracted)

    except Exception as exc:

        logger.error(f"final extraction failed: {exc}")

    return state


# ═══════════════════════════════════════
# LEAD SCORING
# ═══════════════════════════════════════

def node_score_lead(state: dict) -> dict:

    result = rule_score_lead(state)

    state["score"] = result["score"]
    state["score_number"] = result["score_number"]
    state["score_reason"] = result["score_reason"]

    return state


# ═══════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════

def node_generate_summary(state: dict) -> dict:

    context = {
        "name": state.get("name"),
        "issue": state.get("issue"),
        "location": state.get("location"),
        "appt": state.get("appt_confirmed"),
        "score": state.get("score"),
    }

    try:

        resp = llm.invoke(
            [
                SystemMessage(content=SUMMARY_COMBINED_SYSTEM),
                HumanMessage(content=json.dumps(context)),
            ],
            max_tokens=300,
            temperature=0.3,
        )

        result = parse_json(resp.content)

        if result:
            state["summary"] = result.get("client")
            state["internal_summary"] = result.get("internal")

    except Exception as exc:

        logger.error(f"summary failed: {exc}")

    return state


# ═══════════════════════════════════════
# EMAIL
# ═══════════════════════════════════════

def node_send_email(state: dict) -> dict:

    if not state.get("email"):
        return state

    try:

        result = email_tool.send_email(
            to=state["email"],
            subject="Your HVAC consultation summary",
            html=state.get("summary", ""),
            from_name="automedge HVAC",
        )

        state["email_sent"] = result.get("status") == "sent"

    except Exception as exc:

        logger.error(f"email failed: {exc}")

    return state


# ═══════════════════════════════════════
# GOOGLE SHEETS
# ═══════════════════════════════════════

def node_save_sheets(state: dict) -> dict:

    row = [
        datetime.utcnow().isoformat(),
        state.get("name", ""),
        state.get("email", ""),
        state.get("phone", ""),
        state.get("issue", ""),
        state.get("location", ""),
        state.get("vertical", ""),
        state.get("appt_confirmed", ""),
    ]

    try:

        row_num = sheets_tool.save_lead_to_sheet(
            score=state.get("score", "warm"),
            row=row,
            sheet_id=settings.HVAC_SHEET_ID,
        )

        state["sheet_row"] = row_num

    except Exception as exc:

        logger.error(f"sheets save failed: {exc}")

    return state