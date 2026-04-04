# workflows/plumbing/nodes.py
from __future__ import annotations

import asyncio
import time

import structlog
from langchain_core.messages import HumanMessage, SystemMessage

from core.database import Lead, get_db_context
from llm import llm
from tools.ai_tools import ai_tools
from workflows.shared import build_check_completion_node, build_chat_reply_node
from workflows.base import field_missing, get_appt_slots, full_transcript
from workflows.hvac.schema import LeadEnrichment, LeadScore
from workflows.plumbing.prompts import PLUMBING_EXPERT_SYSTEM
from workflows.plumbing.state import PlumbingState

logger = structlog.get_logger(__name__)

_MAX_TURNS = 10

_COLLECTED_FIELDS = (
    "issue", "issue_type", "problem_area", "has_water_damage",
    "is_getting_worse", "main_shutoff_off", "is_homeowner",
    "property_type", "address", "urgency", "name", "phone", "email",
    "wants_appointment", "appt_confirmed", "description",
)

_REQUIRED_FIELDS = ("issue", "address")

_EMERGENCY_KEYWORDS = {
    "burst", "flooding", "flood", "sewage", "spraying",
    "overflow", "no water", "water everywhere", "water damage",
}

# Map service-intent phrases to a clean issue label when extraction returns null.
_SERVICE_INTENT_PHRASES = (
    "priority service", "urgent service", "plumbing help", "need a plumber",
    "emergency plumbing", "plumber", "plumbing", "pipe", "drain", "leak",
    "water", "toilet", "faucet", "sink", "shower", "boiler", "service",
)


def _elapsed(start: float) -> int:
    return int((time.perf_counter() - start) * 1000)




def _is_emergency(state: PlumbingState) -> bool:
    issue = (state.get("issue") or "").lower()
    issue_type = state.get("issue_type", "")
    urgency = state.get("urgency") or state.get("ai_urgency", "")
    return (
        issue_type == "emergency"
        or urgency == "emergency"
        or any(kw in issue for kw in _EMERGENCY_KEYWORDS)
        or bool(state.get("has_water_damage") and state.get("is_getting_worse"))
    )


def _normalize_phone(phone: str) -> str:
    return phone if phone.startswith("+") else f"+{phone}"


def _issue_fallback(msg: str) -> str | None:
    """
    Return the raw message as the issue label if it looks like a service request.
    Prevents session stall when LLM extraction returns issue=null for phrases
    like "Priority Service" or "Need a plumber".
    """
    msg_lower = msg.strip().lower()
    if any(phrase in msg_lower for phrase in _SERVICE_INTENT_PHRASES):
        return msg.strip()[:80]
    return None


# ── 1. Validate ───────────────────────────────────────────────────────────────

async def node_validate_input(state: PlumbingState) -> PlumbingState:
    start = time.perf_counter()
    state["last_node"] = "validate_input"
    state["error"] = None

    msgs = state.get("messages", [])
    if not msgs:
        state["error"] = "empty_input"
        state["duration_ms"] = _elapsed(start)
        return state

    last = msgs[-1]
    if last.get("role") != "user" or not (last.get("content") or "").strip():
        state["error"] = "empty_input"
        state["duration_ms"] = _elapsed(start)
        return state

    if int(state.get("turn_count", 0)) >= _MAX_TURNS:
        state["is_complete"] = True
        logger.warning("session_max_turns_reached", session_id=state.get("session_id"))

    state["duration_ms"] = _elapsed(start)
    return state


# ── 2. Enrich ─────────────────────────────────────────────────────────────────

async def node_enrich_lead(state: PlumbingState) -> PlumbingState:
    """
    Extract fields + classify full history in parallel.
    Falls back to raw message as issue if extraction returns null for a
    clear service-intent phrase — prevents session stall on _REQUIRED_FIELDS.
    Appointment intent is detected every turn (not just post-completion).
    """
    start = time.perf_counter()
    state["last_node"] = "enrich_lead"

    messages = state.get("messages", [])
    last_user = next(
        (m["content"] for m in reversed(messages) if m.get("role") == "user"), None
    )

    async def _noop():
        return None

    extraction, classification = await asyncio.gather(
        ai_tools.extract_plumbing_fields(last_user) if last_user else _noop(),
        ai_tools.classify_conversation(messages),
        return_exceptions=True,
    )

    # A. Merge extraction: Overwrite old fields if they contain new non-null values.
    # This prevents session stall and ensures corrections update the state.
    if isinstance(extraction, Exception):
        logger.warning("plumbing_extraction_failed", error=str(extraction),
                       session_id=state.get("session_id"))
        extraction = None

    if extraction:
        # Robust update: latest extracted values always overwrite if not null.
        for field, value in extraction.items():
            if value is None:
                continue

            # Handle common LLM extraction variations
            if field == "location" and not extraction.get("address"):
                state["address"] = value
            elif field in _COLLECTED_FIELDS or field == "description":
                state[field] = value

        # Explicitly handle appointment confirmation state transitions
        if extraction.get("appt_confirmed"):
            state["appt_booked"] = True

    # B. Fallback: issue still null but message is clearly a service request
    if field_missing(state, "issue") and last_user:
        fallback = _issue_fallback(last_user)
        if fallback:
            state["issue"] = fallback
            logger.debug("issue_fallback_applied", value=fallback,
                         session_id=state.get("session_id"))

    # C. Classification
    if isinstance(classification, Exception):
        logger.warning("classification_failed", error=str(classification),
                       session_id=state.get("session_id"))
        state.setdefault("is_spam", False)
        state.setdefault("intent", "service_request")
    elif classification:
        state["intent"]     = classification.get("intent", "service_request")
        state["is_spam"]    = classification.get("is_spam", False)
        state["ai_summary"] = classification.get("summary")
        state["ai_urgency"] = classification.get("urgency", "normal")
        # Explicitly update urgency from AI if bot has had enough turns to form an opinion
        # and extraction didn't already set it this turn.
        if int(state.get("turn_count", 0)) >= 2:
            state["urgency"] = state["ai_urgency"]

    # D. Emergency fast-path
    if field_missing(state, "issue_type") and _is_emergency(state):
        state["issue_type"] = "emergency"

    # E. Appointment intent — every turn, not gated on is_complete
    if last_user and not state.get("wants_appointment"):
        msg_lower = last_user.lower()
        appt_keywords = {
            "book", "schedule", "appointment", "appt", "slot", "available",
            "when can", "set up", "come out", "send someone", "visit",
            "monday", "tuesday", "wednesday", "thursday", "friday",
            "tomorrow", "next week", "morning", "afternoon",
        }
        if any(kw in msg_lower for kw in appt_keywords):
            state["wants_appointment"] = True

    logger.info("plumbing_enriched",
        session_id=state.get("session_id"),
        collected={f: state.get(f) for f in _REQUIRED_FIELDS},
        issue_type=state.get("issue_type"),
        is_emergency=_is_emergency(state),
        wants_appointment=state.get("wants_appointment"),
    )
    state["duration_ms"] = _elapsed(start)
    return state


# ── 3. Check completion ───────────────────────────────────────────────────────

node_check_completion = build_check_completion_node(_REQUIRED_FIELDS)


# ── 4. Chat reply ─────────────────────────────────────────────────────────────

node_chat_reply = build_chat_reply_node(PLUMBING_EXPERT_SYSTEM, _COLLECTED_FIELDS)


# ── 5. Score ──────────────────────────────────────────────────────────────────

async def node_score_lead(state: PlumbingState) -> PlumbingState:
    start = time.perf_counter()
    state["last_node"] = "score_lead"

    if _is_emergency(state):
        state["score"]        = "hot"
        state["score_reason"] = "Emergency plumbing — immediate dispatch."
        state["next_step"]    = "immediate_dispatch"
        state["duration_ms"]  = _elapsed(start)
        return state

    urgency = state.get("urgency") or state.get("ai_urgency", "normal")
    urgency_map = {
        "emergency": "emergency", "urgent": "high",
        "routine": "normal", "normal": "normal",
    }

    snapshot = LeadEnrichment(
        name=state.get("name"),
        email=state.get("email"),
        phone=state.get("phone"),
        issue=state.get("issue"),
        urgency=urgency_map.get(urgency, "normal"),
        intent=state.get("intent", "service_request"),
        is_spam=state.get("is_spam", False),
        summary=state.get("ai_summary") or "Plumbing lead",
    )

    try:
        score_data: LeadScore = await ai_tools.score_lead(snapshot)
        state["score"]        = score_data.score
        state["score_reason"] = score_data.score_reason
        state["next_step"]    = score_data.next_step
    except Exception as exc:
        logger.error("plumbing_score_failed", error=str(exc),
                     session_id=state.get("session_id"))
        state["score"]        = "warm"
        state["score_reason"] = "Scoring failed — defaulted to warm."
        state["next_step"]    = "schedule_callback"

    state["duration_ms"] = _elapsed(start)
    return state


# ── 6. Deliver ────────────────────────────────────────────────────────────────

async def node_finalize_and_deliver(state: PlumbingState) -> PlumbingState:
    """
    DB → Sheets + Email + WhatsApp + HubSpot → optional emergency SMS.
    Each step isolated — failure never blocks the rest.
    """
    start = time.perf_counter()
    state["last_node"] = "delivery"

    if state.get("is_spam") or state.get("next_step") == "drop":
        logger.info("plumbing_delivery_skipped", reason="spam_or_drop",
                    session_id=state.get("session_id"))
        state["duration_ms"] = _elapsed(start)
        return state

    # Step 1: DB
    try:
        async with get_db_context() as db:
            lead = Lead(
                name=state.get("name"),
                email=state.get("email"),
                phone=state.get("phone"),
                issue=state.get("issue"),
                address=state.get("address"),
                vertical="plumbing",
                session_id=state.get("session_id"),
                score=state.get("score"),
                summary=state.get("ai_summary"),
            )
            db.add(lead)
            await db.commit()
            logger.info("plumbing_lead_persisted", session_id=state.get("session_id"))
    except Exception as exc:
        logger.error("plumbing_db_failed", error=str(exc),
                     session_id=state.get("session_id"))

    # Step 2: Sheets + Email + WhatsApp + HubSpot
    try:
        from tools.delivery_tools import run_delivery_pipeline
        pipeline_results = await run_delivery_pipeline(state)
        logger.info("plumbing_pipeline_complete",
                    session_id=state.get("session_id"),
                    **{k: v for k, v in pipeline_results.items() if k != "hubspot"})
    except Exception as exc:
        logger.error("plumbing_pipeline_failed", error=str(exc),
                     session_id=state.get("session_id"))
        await _send_fallback_sms(state)

    # Step 3: Emergency SMS
    if _is_emergency(state) and state.get("phone"):
        await _send_emergency_sms(state)

    state["duration_ms"] = _elapsed(start)
    return state


async def _send_emergency_sms(state: PlumbingState) -> None:
    from tools.whatsapp_tools import whatsapp_tools
    await whatsapp_tools.send_emergency_alert(state, state.get("_app_state"))


async def _send_fallback_sms(state: PlumbingState) -> None:
    from tools.whatsapp_tools import whatsapp_tools
    await whatsapp_tools.send_fallback_sms(state, state.get("_app_state"))
    return

    try:
        from tools.whatsapp_tools import WhatsAppTools
        client = WhatsAppTools._client(state.get("_app_state"))
        if not client:
            logger.warning("fallback_sms_skip_no_client")
            return
        from core.config import settings
        await asyncio.to_thread(
            client.messages.create,
            from_=settings.TWILIO_FROM_NUMBER,
            to=_normalize_phone(phone),
            body=(
                "Sorry, we're having trouble processing your request. "
                f"Please call us directly at {settings.BUSINESS_PHONE}."
            ),
        )
        logger.info("fallback_sms_sent", session_id=state.get("session_id"))
    except Exception as exc:
        logger.error("fallback_sms_failed", error=str(exc),
                     session_id=state.get("session_id"))