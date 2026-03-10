# models/booking.py
# Pydantic v2 models for the bookings API.
# A Booking is a demo request from the marketing site (not a service appointment).
# Service appointments are booked inside chat sessions and stored on the lead.
from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class BookingCreate(BaseModel):
    name:     str      = Field(..., min_length=1, max_length=100)
    email:    EmailStr
    phone:    str | None = Field(None, max_length=20)
    company:  str | None = None
    vertical: str | None = Field(None, description="Which vertical they are interested in")
    message:  str | None = Field(None, max_length=1000)


class BookingResponse(BaseModel):
    id:         int
    name:       str
    email:      str
    phone:      str | None
    company:    str | None
    vertical:   str | None
    message:    str | None
    created_at: datetime