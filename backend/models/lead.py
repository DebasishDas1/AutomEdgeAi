# models/lead.py
from __future__ import annotations
import uuid
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, EmailStr, Field

Stage   = Literal["new", "contacted", "quoted", "booked", "done"]
Score   = Literal["hot", "warm", "cold"]
Urgency = Literal["emergency", "urgent", "normal"]


class LeadCreate(BaseModel):
    name:     str         = Field(..., min_length=1, max_length=100)
    phone:    str | None  = None
    email:    str | None  = None
    source:   str         = "chat"          # google|angi|phone|web|chat
    vertical: str                           # hvac|roofing|plumbing|pest_control
    issue:    str | None  = None
    city:     str | None  = None
    user_id:  str         = "system"        # Firebase UID — set from auth token
    session_id: str | None = None


class LeadUpdate(BaseModel):
    name:         str | None   = None
    phone:        str | None   = None
    email:        str | None   = None
    issue:        str | None   = None
    city:         str | None   = None
    stage:        Stage | None = None
    urgency:      Urgency | None = None
    score:        Score | None = None
    score_reason: str | None   = None
    booked_at:    datetime | None = None


class LeadResponse(BaseModel):
    id:            uuid.UUID
    name:          str
    phone:         str | None
    email:         str | None
    source:        str
    vertical:      str
    issue:         str | None
    city:          str | None
    stage:         str
    urgency:       str
    score:         str | None
    score_reason:  str | None
    sms_sent:      bool
    tech_notified: bool
    booked_at:     datetime | None
    review_sent:   bool
    sheet_row:     int | None
    session_id:    str | None
    user_id:       str
    created_at:    datetime
    updated_at:    datetime

    class Config:
        from_attributes = True


class LeadListResponse(BaseModel):
    total: int
    leads: list[LeadResponse]