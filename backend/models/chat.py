# models/chat.py
# Pydantic v2 models for the chat API.
# Shared across all 4 verticals — vertical is a runtime parameter.
from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, Field
import uuid


Vertical = Literal["hvac", "pest_control", "plumbing", "roofing"]


class ChatStartRequest(BaseModel):
    vertical: Vertical
    # Optional: pre-seed the session with lead source metadata
    source:   str | None = Field(None, description="Lead source e.g. google_lsa, angi, web")
    metadata: dict | None = Field(None, description="Any extra KV pairs to attach to session")


class ChatStartResponse(BaseModel):
    session_id: str
    vertical:   Vertical
    message:    str          # AI opening message
    turn:       int = 0


class ChatMessageRequest(BaseModel):
    session_id: str
    message:    str = Field(..., min_length=1, max_length=2000)


class ChatMessageResponse(BaseModel):
    session_id:       str
    message:          str          # AI reply
    turn:             int
    is_complete:      bool
    appt_booked:      bool
    fields_collected: dict         # non-null fields collected so far


class ChatStatusResponse(BaseModel):
    session_id:   str
    vertical:     Vertical
    is_complete:  bool
    score:        str | None       # hot | warm | cold
    email_sent:   bool
    sms_sent:     bool
    appt_booked:  bool
    sheet_saved:  bool
    summary:      str | None       # client-facing summary