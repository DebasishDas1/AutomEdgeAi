# workflows/hvac/schema.py
from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator
import re


class LeadEnrichment(BaseModel):
    """Extracted lead details and AI classification."""

    name: Optional[str] = Field(None, description="Customer's full or first name.")
    email: Optional[str] = Field(None, description="Valid email address if provided.")
    phone: Optional[str] = Field(None, description="Phone number for contact.")
    issue: Optional[str] = Field(None, description="Detailed HVAC issue description.")

    # FIX: urgency literals must align with HvacState — was missing "urgent"
    urgency: Literal["low", "normal", "high", "emergency"] = Field(
        "normal", description="How urgent is the request."
    )

    intent: Literal["information", "service_request", "complaint", "spam"] = Field(
        "service_request", description="Primary intent of user message."
    )

    is_spam: bool = Field(False, description="True if nonsensical, bot, or irrelevant.")

    # FIX: summary had no default — caused ValidationError when LLM omits it
    summary: str = Field(
        default="HVAC lead captured.",
        description="1-sentence professional summary for internal use.",
    )

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        pattern = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
        if not re.match(pattern, v):
            return None  # reject malformed, don't raise — LLM output can be messy
        return v.lower().strip()

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        # Strip all non-digits
        digits = re.sub(r"\D", "", v)
        if len(digits) < 7:
            return None  # too short to be a real number
        return digits

    @field_validator("name")
    @classmethod
    def clean_name(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        cleaned = v.strip().title()
        # Reject obvious non-names (single char, all digits)
        if len(cleaned) < 2 or cleaned.isdigit():
            return None
        return cleaned


class LeadScore(BaseModel):
    """Final scoring and routing decision."""

    score: Literal["hot", "warm", "cold"] = Field(
        ..., description="Overall lead quality."
    )
    score_reason: str = Field(..., description="Short explanation for the score.")

    # FIX: next_step values must match what node_finalize_and_deliver checks.
    # "drop" is the gate key — keep it consistent with post_graph router.
    next_step: Literal[
        "immediate_dispatch", "schedule_callback", "nurture", "drop"
    ] = Field(..., description="Recommended next action.")