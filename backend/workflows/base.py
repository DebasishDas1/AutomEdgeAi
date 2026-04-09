# workflows/base.py
# Shared helpers used by ALL vertical nodes.
# Import from here — never redefine in individual nodes.py files.
from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timedelta, timezone
from typing import Any

from langchain_core.messages import AIMessage, HumanMessage

logger = logging.getLogger(__name__)
_MISSING = object()


# ── Field helpers ─────────────────────────────────────────────────────────────

def field_missing(state: dict, key: str) -> bool:
    """True only if field was never set or is None. bool False is a valid value."""
    val = state.get(key, _MISSING)
    return val is _MISSING or val is None


def merge_extracted(state: dict, extracted: dict) -> dict:
    """
    Merge extracted fields into state. Latest non-null values overwrite existing values.
    This ensures the state stays updated across multiple turns if information changes.
    """
    for k, v in extracted.items():
        if v is not None:
            # Handle address fallback if 'address' key missing but 'location' present
            if k == "location" and not extracted.get("address"):
                state["address"] = v
            else:
                state[k] = v
    return state


def parse_json(content: str) -> dict | None:
    """
    Extract the first JSON object from an LLM response.

    Fix: original only handled {...} — now also handles arrays [...] and
    strips common LLM markdown fences (```json ... ```) before parsing.
    Returns None on any failure; never raises.
    """
    if not content:
        return None

    # Strip markdown code fences
    cleaned = re.sub(r"```(?:json)?\s*", "", content).strip()
    cleaned = cleaned.replace("```", "")

    # Find first { or [
    start_brace = cleaned.find("{")
    start_bracket = cleaned.find("[")

    if start_brace == -1 and start_bracket == -1:
        return None

    # Pick whichever comes first
    if start_brace == -1:
        start = start_bracket
        end = cleaned.rfind("]") + 1
    elif start_bracket == -1 or start_brace <= start_bracket:
        start = start_brace
        end = cleaned.rfind("}") + 1
    else:
        start = start_bracket
        end = cleaned.rfind("]") + 1

    if end == 0:
        return None

    try:
        return json.loads(cleaned[start:end])
    except json.JSONDecodeError as exc:
        logger.warning(
            "json_parse_failed",
            error=str(exc),
            snippet=cleaned[start : start + 120],
        )
        return None


# ── Message helpers ───────────────────────────────────────────────────────────

def build_lc_messages(state: dict, max_messages: int = 10) -> list:
    """
    Convert state['messages'] → list of LangChain HumanMessage / AIMessage.
    Skips messages with empty content to avoid sending noise to the LLM.
    Only the most recent `max_messages` turns are kept to reduce token usage.
    """
    out: list = []
    for m in state.get("messages", [])[-max_messages:]:
        role = m.get("role")
        content = (m.get("content") or "").strip()
        if not content:
            continue
        if role == "user":
            out.append(HumanMessage(content=content))
        elif role == "assistant":
            out.append(AIMessage(content=content))
    return out


def last_user_msg(state: dict) -> str | None:
    """Content of the most recent user message, or None."""
    return next(
        (
            m["content"]
            for m in reversed(state.get("messages", []))
            if m.get("role") == "user" and m.get("content")
        ),
        None,
    )


def full_transcript(state: dict) -> str:
    """Flat text of entire conversation — used for final extraction pass."""
    return "\n".join(
        f"{m['role'].upper()}: {m['content']}"
        for m in state.get("messages", [])
        if m.get("content")
    )


# ── Appointment slots ─────────────────────────────────────────────────────────

def get_appt_slots() -> list[str]:
    """
    Generate 3 appointment slots starting tomorrow.
    Fix: uses datetime.now(timezone.utc) — datetime.now() without tz is
    ambiguous on servers and breaks if TZ env var changes at runtime.
    """
    today = datetime.now(timezone.utc)
    return [
        (today + timedelta(days=1)).strftime("%A, %b %d at 10:00 AM"),
        (today + timedelta(days=2)).strftime("%A, %b %d at 2:00 PM"),
        (today + timedelta(days=3)).strftime("%A, %b %d at 9:00 AM"),
    ]


# ── Rule-based lead scorer ────────────────────────────────────────────────────
# Zero-token deterministic scoring — replaces 2 LLM calls (~450 tokens) for
# verticals that don't need nuanced AI judgment on simple signals.

_EMERGENCY_HVAC: frozenset[str] = frozenset({
    "no heat", "no ac", "carbon monoxide", "gas smell",
    "smoke", "no hot water", "system down",
})
_EMERGENCY_PLUMBING: frozenset[str] = frozenset({
    "flooding", "water damage", "burst pipe", "burst", "overflow",
    "sewage", "sewer backup", "no water", "water everywhere",
})
_EMERGENCY_PEST: frozenset[str] = frozenset({
    "termites", "bed bugs", "rodents", "cockroaches", "wasps",
    "bees", "hornets", "rat", "rats", "mice",
})
_EMERGENCY_ROOFING: frozenset[str] = frozenset({
    "active leak", "ceiling leak", "water coming in", "interior leak",
    "storm damage", "missing shingles", "collapsed",
})


def rule_score_lead(state: dict) -> dict[str, Any]:
    """
    Score a lead with zero LLM tokens. All 4 verticals supported.

    Returns:
        score:        "hot" | "warm" | "cold"
        score_number: 0–100
        score_reason: human-readable explanation
        urgency:      vertical-specific urgency string
    """
    vertical = (state.get("vertical") or "hvac").lower()
    urgency_raw = (state.get("urgency") or "").lower()
    is_homeowner = state.get("is_homeowner")
    has_email = bool(state.get("email"))
    has_phone = bool(state.get("phone"))
    appt_booked = bool(state.get("appt_booked"))
    turn_count = int(state.get("turn_count") or 0)
    issue = (state.get("issue") or "").lower()
    budget_signal = (state.get("budget_signal") or "").lower()

    score = 50
    notes: list[str] = []
    emergency = False

    # ── Vertical-specific urgency detection ───────────────────────────────────
    if vertical == "hvac":
        emergency = urgency_raw in ("urgent", "emergency") or any(
            kw in issue for kw in _EMERGENCY_HVAC
        )
        urgency_out = "urgent" if emergency else (urgency_raw or "normal")

    elif vertical == "plumbing":
        has_water_damage = bool(state.get("has_water_damage"))
        emergency = urgency_raw == "emergency" or any(
            kw in issue for kw in _EMERGENCY_PLUMBING
        )
        if emergency or has_water_damage:
            urgency_out = "emergency"
            score += 10
        elif urgency_raw == "urgent":
            urgency_out = "urgent"
        else:
            urgency_out = "routine"

    elif vertical == "pest_control":
        pest = (state.get("pest_type") or "").lower()
        has_damage = bool(state.get("has_damage"))
        if pest in _EMERGENCY_PEST or has_damage:
            urgency_out = "high"
            emergency = True
        elif pest in {"ants", "fleas", "mosquitoes"}:
            urgency_out = "medium"
        else:
            urgency_out = "low"

    elif vertical == "roofing":
        damage_type = (state.get("damage_type") or "").lower()
        has_interior_leak = bool(state.get("has_interior_leak"))
        if damage_type == "storm" or has_interior_leak or any(
            kw in issue for kw in _EMERGENCY_ROOFING
        ):
            urgency_out = "storm_damage" if damage_type == "storm" else "leak_active"
            emergency = True
        elif damage_type == "wear":
            urgency_out = "inspection_needed"
        else:
            urgency_out = "planning"

    else:
        emergency = urgency_raw in ("urgent", "emergency")
        urgency_out = urgency_raw or "normal"

    # ── Universal scoring signals ─────────────────────────────────────────────
    if emergency:       score += 25; notes.append("emergency")
    if is_homeowner:    score += 10; notes.append("homeowner")
    if has_email:       score += 5;  notes.append("email")
    if has_phone:       score += 5;  notes.append("phone")
    if appt_booked:     score += 15; notes.append("appt booked")
    if turn_count >= 6: score += 5;  notes.append(f"{turn_count} turns")

    # Vertical bonuses
    if vertical == "pest_control" and state.get("wants_annual"):
        score += 10; notes.append("wants annual plan")
    if vertical == "roofing" and state.get("has_insurance"):
        score += 8; notes.append("has insurance")
    if vertical == "plumbing" and state.get("has_water_damage"):
        score += 10; notes.append("water damage")

    # Negative signals
    if budget_signal == "price shopping": score -= 20; notes.append("price shopping")
    if is_homeowner is False:             score -= 25; notes.append("renter")
    if not has_email and not has_phone:   score -= 15; notes.append("no contact")
    if turn_count < 3:                    score -= 10; notes.append("low engagement")

    score = max(0, min(100, score))

    if score >= 70:     label = "hot"
    elif score >= 35:   label = "warm"
    else:               label = "cold"

    note_str = ", ".join(notes) if notes else "standard lead"
    return {
        "score": label,
        "score_number": score,
        "score_reason": f"{label.upper()}: {note_str}.",
        "urgency": urgency_out,
    }