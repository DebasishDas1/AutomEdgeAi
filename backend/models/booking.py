# models/booking.py
from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class BookingCreate(BaseModel):
    name:      str  = Field(..., min_length=1, max_length=100)
    email:     str
    business:  str  = Field(..., min_length=1)   # company/business name
    vertical:  str                               # which vertical they are interested in
    team_size: str | None = None                 # "1-5", "6-20", "20+"


class BookingResponse(BaseModel):
    id:         uuid.UUID
    name:       str
    email:      str
    business:   str
    vertical:   str
    team_size:  str | None
    created_at: datetime

    class Config:
        from_attributes = True