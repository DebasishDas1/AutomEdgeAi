# models/lead.py
# Pydantic v2 models for the leads API.
# A Lead is created either via the chat flow (session_id attached)
# or directly via POST /leads (manual entry from dashboard).
from __future__ import annotations
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, EmailStr, Field

Vertical = Literal["hvac", "pest_control", "plumbing", "roofing"]
Score    = Literal["hot", "warm", "cold"]
Stage    = Literal["new", "contacted", "booked", "won", "lost"]


class LeadCreate(BaseModel):
    vertical:   Vertical
    name:       str              = Field(..., min_length=1, max_length=100)
    email:      EmailStr | None  = None
    phone:      str | None       = Field(None, max_length=20)
    location:   str | None       = None
    issue:      str | None       = None           # hvac/plumbing issue description
    pest_type:  str | None       = None           # pest_control
    damage_type:str | None       = None           # roofing
    source:     str | None       = None           # google_lsa, angi, web_form, chat
    session_id: str | None       = None           # linked chat session if originated from chat
    notes:      str | None       = None


class LeadUpdate(BaseModel):
    # All fields optional — PATCH updates only what is provided
    stage:      Stage  | None = None
    score:      Score  | None = None
    notes:      str    | None = None
    name:       str    | None = None
    email:      EmailStr | None = None
    phone:      str    | None = None
    location:   str    | None = None
    issue:      str    | None = None
    appt_booked: bool  | None = None
    appt_confirmed: str | None = None


class LeadResponse(BaseModel):
    id:             int
    vertical:       Vertical
    name:           str
    email:          str | None
    phone:          str | None
    location:       str | None
    issue:          str | None
    pest_type:      str | None
    damage_type:    str | None
    source:         str | None
    session_id:     str | None
    score:          Score | None
    stage:          Stage
    appt_booked:    bool
    appt_confirmed: str | None
    notes:          str | None
    created_at:     datetime
    updated_at:     datetime


class LeadListResponse(BaseModel):
    total:  int
    leads:  list[LeadResponse]