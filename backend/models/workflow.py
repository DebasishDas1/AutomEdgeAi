# models/workflow.py
from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


class WorkflowStartRequest(BaseModel):
    lead_id: uuid.UUID
    vertical: str
    force:   bool = Field(False, description="Re-run even if events already exist")


class WorkflowStartResponse(BaseModel):
    lead_id:  uuid.UUID
    vertical: str
    status:   str = "started"


class WorkflowEventResponse(BaseModel):
    id:            uuid.UUID
    lead_id:       uuid.UUID
    step:          int
    label:         str
    status:        str           # active|done|error
    timestamp_str: str | None
    created_at:    datetime

    class Config:
        from_attributes = True



class HVACChatState(BaseModel):
    session_id: str
    messages: list = Field(default_factory=list)
    collected_fields: Dict[str, Any] = Field(default_factory=dict)
    is_complete: bool = False
    appt_booked: bool = False
    turn: int = 0