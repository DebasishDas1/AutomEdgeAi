from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class WorkflowEventBase(BaseModel):
    step: int
    label: str
    status: str
    timestamp_str: Optional[str] = None

class WorkflowEventCreate(WorkflowEventBase):
    lead_id: UUID

class WorkflowEvent(WorkflowEventBase):
    id: UUID
    lead_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class WorkflowStreamEvent(BaseModel):
    type: str # "event" | "error" | "complete"
    data: dict

from typing import TypedDict, List, Optional

class BaseChatState(TypedDict):
    # Session
    session_id: str
    user_id: Optional[str]
    started_at: str

    # Conversation
    messages: List[dict]
    turn_count: int
    is_complete: bool

    # Extracted lead data
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    location: Optional[str]
    issue: Optional[str]
    urgency: Optional[str]
    is_homeowner: Optional[bool]
    
    # HVAC
    system_age: Optional[str]
    budget_signal: Optional[str]
    timeline: Optional[str]
    
    # Pest Control
    pest_type: Optional[str]
    infestation_area: Optional[str]
    duration: Optional[str]
    has_damage: Optional[bool]
    tried_treatment: Optional[bool]
    wants_annual: Optional[bool]
    property_type: Optional[str]

    # Plumbing
    issue_type: Optional[str]
    problem_area: Optional[str]
    is_getting_worse: Optional[bool]
    has_water_damage: Optional[bool]
    main_shutoff_off: Optional[bool]

    # Roofing
    damage_type: Optional[str]
    damage_detail: Optional[str]
    storm_date: Optional[str]
    roof_age: Optional[str]
    has_insurance: Optional[bool]
    insurance_contacted: Optional[bool]
    adjuster_involved: Optional[bool]
    has_interior_leak: Optional[bool]

    # Appointment
    appt_offered: bool
    appt_slots: List[str]
    appt_confirmed: Optional[str]
    appt_booked: bool

    # Post-chat results
    summary: Optional[str]
    internal_summary: Optional[str]
    score: Optional[str]
    score_reason: Optional[str]
    email_sent: bool
    sheet_row: Optional[int]
    sheet_tab: Optional[str]
