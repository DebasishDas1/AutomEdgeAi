# workflows/state.py
# LangGraph state type for all 4 verticals.
#
# IMPORTANT: All graphs use StateGraph(dict) — plain dict at runtime.
# HVACChatState / PestChatState etc. are TYPE ALIASES for dict.
# They exist only for IDE autocomplete and type checker hints.
# Never pass them to StateGraph() — always use StateGraph(dict).
from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    # Only imported by type checkers (mypy, pyright) — never at runtime.
    # Keeps full field documentation without affecting runtime behaviour.
    from typing import TypedDict, Optional

    class ChatState(TypedDict, total=False):
        # Session
        session_id:   str
        vertical:     str
        messages:     list
        turn_count:   int
        is_complete:  bool
        source:       Optional[str]
        # Contact
        name:         Optional[str]
        email:        Optional[str]
        phone:        Optional[str]
        location:     Optional[str]
        issue:        Optional[str]
        # HVAC
        system_age:   Optional[str]
        urgency:      Optional[str]
        is_homeowner: Optional[bool]
        budget_signal:Optional[str]
        timeline:     Optional[str]
        issue_type:   Optional[str]
        # Pest Control
        pest_type:        Optional[str]
        infestation_area: Optional[str]
        duration:         Optional[str]
        has_damage:       Optional[bool]
        tried_treatment:  Optional[bool]
        wants_annual:     Optional[bool]
        property_type:    Optional[str]
        # Plumbing
        problem_area:     Optional[str]
        is_getting_worse: Optional[bool]
        has_water_damage: Optional[bool]
        main_shutoff_off: Optional[bool]
        # Roofing
        damage_type:          Optional[str]
        damage_detail:        Optional[str]
        storm_date:           Optional[str]
        roof_age:             Optional[str]
        has_insurance:        Optional[bool]
        insurance_contacted:  Optional[bool]
        adjuster_involved:    Optional[bool]
        has_interior_leak:    Optional[bool]
        # Appointment
        appt_slots:     Optional[list]
        appt_booked:    Optional[bool]
        appt_confirmed: Optional[str]
        # Post-chat
        score:            Optional[str]
        score_number:     Optional[int]
        score_reason:     Optional[str]
        summary:          Optional[str]
        internal_summary: Optional[str]
        email_sent:       Optional[bool]
        sms_sent:         Optional[bool]
        sheet_row:        Optional[int]
        sheet_tab:        Optional[str]

# ── Runtime aliases — all are plain dict ─────────────────────────────────────
# Used as type hints in node function signatures:
#   def node_chat_reply(state: HVACChatState) -> HVACChatState:
# At runtime these are just `dict`, so state.get() / state["key"] work normally.
HVACChatState     = dict
PestChatState     = dict
PlumbingChatState = dict
RoofingChatState  = dict
ChatState         = dict