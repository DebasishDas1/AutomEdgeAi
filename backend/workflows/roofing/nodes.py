# workflows/roofing/nodes.py
from __future__ import annotations

import time
from datetime import datetime, timezone

import structlog
from langchain_core.messages import SystemMessage

from core.database import Lead, get_db_context
from llm import llm
from tools.ai_tools import ai_tools
from workflows.shared import build_validate_input_node, build_check_completion_node, build_chat_reply_node
from workflows.base import build_lc_messages, field_missing, get_appt_slots
from workflows.hvac.schema import LeadEnrichment, LeadScore
from workflows.roofing.prompts import ROOFING_EXPERT_SYSTEM
from workflows.roofing.state import RoofingState

logger = structlog.get_logger(__name__)

_MAX_TURNS = 10

_COLLECTED_FIELDS = (
    "damage_type", "damage_detail", "storm_date", "roof_age",
    "has_interior_leak", "has_insurance", "insurance_contacted",
    "adjuster_involved", "is_homeowner", "property_type",
    "address", "urgency", "name", "phone", "email",
    "description",
)

# Minimum required: damage_type tells us storm vs wear (determines entire sales path),
# address allows us to dispatch inspector.
# name/phone/email pre-filled from form.
_REQUIRED_FIELDS = ("damage_type", "address")

# Storm signals for fast-path detection
_STORM_KEYWORDS = {
    "hail", "hailstorm", "storm", "wind damage", "tree fell",
    "missing shingles", "granules", "adjuster", "insurance claim",
    "neighbor filed",
}


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()

def _elapsed(start: float) -> int:
    return int((time.perf_counter() - start) * 1000)


def _is_storm_lead(state: RoofingState) -> bool:
    """Fast-path storm detection — no LLM tokens."""
    damage = (state.get("damage_type") or "").lower()
    detail = (state.get("damage_detail") or "").lower()
    urgency = (state.get("urgency") or state.get("ai_urgency") or "").lower()
    return (
        damage == "storm"
        or urgency == "storm_damage"
        or state.get("adjuster_involved")
        or state.get("insurance_contacted")
        or any(kw in detail for kw in _STORM_KEYWORDS)
    )

def _is_high_value(state: RoofingState) -> bool:
    """Storm + insurance + homeowner = highest value lead."""
    return (
        _is_storm_lead(state)
        and state.get("has_insurance")
        and state.get("is_homeowner") is not False
    )


# ── 1. Validate ───────────────────────────────────────────────────────────────

async def node_validate_input(state: RoofingState) -> RoofingState:
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

async def node_enrich_lead(state: RoofingState) -> RoofingState:
    start = time.perf_counter()
    state["last_node"] = "enrich_lead"

    messages = state.get("messages", [])
    last_user = next(
        (m["content"] for m in reversed(messages) if m.get("role") == "user"), None
    )

    # A. Extract roofing fields from latest message
    if last_user:
        try:
            extraction = await ai_tools.extract_roofing_fields(last_user)
            if extraction:
                # Robust update: latest extracted non-null values always overwrite existing state.
                # This ensures info like insurance status or address correctly updates.
                for field, value in extraction.items():
                    if value is None:
                        continue

                    # Handle common variations
                    if field == "location" and not extraction.get("address"):
                        state["address"] = value
                    elif field in _COLLECTED_FIELDS:
                        state[field] = value
                    elif field == "description":
                        state[field] = value
        except Exception as exc:
            logger.warning("roofing_extraction_failed", error=str(exc),
                           session_id=state.get("session_id"))

    # B. Classify full history
    try:
        classification = await ai_tools.classify_conversation(messages)
        if classification:
            state["intent"]     = classification.get("intent", "service_request")
            state["is_spam"]    = classification.get("is_spam", False)
            state["ai_summary"] = classification.get("summary")
            state["ai_urgency"] = classification.get("urgency", "normal")
            if int(state.get("turn_count", 0)) >= 2:
                state["urgency"] = state["ai_urgency"]
    except Exception as exc:
        logger.warning("classification_failed", error=str(exc),
                       session_id=state.get("session_id"))
        state.setdefault("is_spam", False)
        state.setdefault("intent", "service_request")

    logger.info("roofing_enriched",
        session_id=state.get("session_id"),
        collected={f: state.get(f) for f in _REQUIRED_FIELDS},
        is_storm=_is_storm_lead(state),
        is_high_value=_is_high_value(state),
    )
    state["duration_ms"] = _elapsed(start)
    return state


# ── 3. Check completion ───────────────────────────────────────────────────────

node_check_completion = build_check_completion_node(_REQUIRED_FIELDS)


# ── 4. Chat reply ─────────────────────────────────────────────────────────────

node_chat_reply = build_chat_reply_node(ROOFING_EXPERT_SYSTEM, _COLLECTED_FIELDS)


# ── 5. Score ──────────────────────────────────────────────────────────────────

async def node_score_lead(state: RoofingState) -> RoofingState:
    start = time.perf_counter()
    state["last_node"] = "score_lead"

    # Fast-path: storm + insurance + homeowner = always hot
    if _is_high_value(state):
        bonus = " Adjuster involved." if state.get("adjuster_involved") else ""
        state["score"]        = "hot"
        state["score_reason"] = f"Storm damage + insurance + homeowner.{bonus}"
        state["next_step"]    = "immediate_dispatch"
        state["duration_ms"]  = _elapsed(start)
        return state

    # Fast-path: storm without insurance = warm (still high priority)
    if _is_storm_lead(state) and not state.get("has_insurance"):
        state["score"]        = "warm"
        state["score_reason"] = "Storm damage, insurance status unknown."
        state["next_step"]    = "schedule_callback"
        state["duration_ms"]  = _elapsed(start)
        return state

    # LLM scoring for wear/routine leads
    urgency_map = {
        "storm_damage": "emergency", "leak_active": "high",
        "inspection_needed": "normal", "planning": "low",
    }
    urgency = state.get("urgency") or state.get("ai_urgency", "planning")
    mapped = urgency_map.get(urgency, "normal")

    snapshot = LeadEnrichment(
        name=state.get("name"),
        email=state.get("email"),
        phone=state.get("phone"),
        issue=state.get("damage_type") or "roofing inquiry",
        urgency=mapped,
        intent=state.get("intent", "service_request"),
        is_spam=state.get("is_spam", False),
        summary=state.get("ai_summary") or "Roofing lead",
    )

    try:
        score_data: LeadScore = await ai_tools.score_lead(snapshot)
        state["score"]        = score_data.score
        state["score_reason"] = score_data.score_reason
        state["next_step"]    = score_data.next_step
    except Exception as exc:
        logger.error("roofing_score_failed", error=str(exc),
                     session_id=state.get("session_id"))
        state["score"]        = "warm"
        state["score_reason"] = "Scoring failed — defaulted to warm."
        state["next_step"]    = "schedule_callback"

    state["duration_ms"] = _elapsed(start)
    return state


# ── 6. Deliver ────────────────────────────────────────────────────────────────

async def node_finalize_and_deliver(state: RoofingState) -> RoofingState:
    """DB → Sheets → Email → WhatsApp (+ insurance SMS reminder for storm leads)."""
    start = time.perf_counter()
    state["last_node"] = "delivery"

    if state.get("is_spam") or state.get("next_step") == "drop":
        logger.info("roofing_delivery_skipped", session_id=state.get("session_id"))
        state["duration_ms"] = _elapsed(start)
        return state

    # 1. DB persistence
    try:
        async with get_db_context() as db:
            lead = Lead(
                name=state.get("name"),
                email=state.get("email"),
                phone=state.get("phone"),
                issue=state.get("damage_type") or "roofing inquiry",
                address=state.get("address"),
                vertical="roofing",
                session_id=state.get("session_id"),
                score=state.get("score"),
                summary=state.get("ai_summary"),
            )
            db.add(lead)
            await db.commit()
            logger.info("roofing_lead_persisted", session_id=state.get("session_id"))
    except Exception as exc:
        logger.error("roofing_db_failed", error=str(exc),
                     session_id=state.get("session_id"))

    # 2. Sheets + Email + WhatsApp
    try:
        from tools.delivery_tools import run_delivery_pipeline
        results = await run_delivery_pipeline(state)
        state["delivery_results"] = results
    except Exception as exc:
        logger.error("roofing_delivery_pipeline_failed", error=str(exc),
                     session_id=state.get("session_id"))

    # 3. Insurance reminder SMS — storm leads with insurance confirmed
    if _is_storm_lead(state) and state.get("has_insurance") and state.get("phone"):
        from tools.whatsapp_tools import whatsapp_tools
        await whatsapp_tools.send_insurance_reminder(state, state.get("_app_state"))

    state["duration_ms"] = _elapsed(start)
    return state