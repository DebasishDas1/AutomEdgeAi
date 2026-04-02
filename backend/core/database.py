import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey,
    Integer, String, Text, select, text
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.ext.asyncio import (
    AsyncSession, async_sessionmaker, create_async_engine,
)
from sqlalchemy.orm import declarative_base

from core.config import settings

# ── Engine ────────────────────────────────────────────────────────────────────

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=3,
    max_overflow=0,
    pool_timeout=30,
    pool_pre_ping=True,
    pool_recycle=1800,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False,
    class_=AsyncSession,
)

Base = declarative_base()


def _now() -> datetime:
    return datetime.now(timezone.utc)


# ── Models ────────────────────────────────────────────────────────────────────

class Lead(Base):
    __tablename__ = "leads"

    id         = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name       = Column(String,  nullable=True)
    email      = Column(String,  nullable=True)
    phone      = Column(String,  nullable=True)
    issue      = Column(Text,    nullable=True)
    address    = Column(String,  nullable=True)
    vertical   = Column(String,  nullable=False)
    score      = Column(String,  nullable=True)   # "hot" | "warm" | "cold"
    summary    = Column(Text,    nullable=True)
    appt_at    = Column(DateTime(timezone=True), nullable=True)
    session_id = Column(String,  nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=_now)


class Job(Base):
    __tablename__ = "jobs"

    id           = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id      = Column(PG_UUID(as_uuid=True), ForeignKey("leads.id"))
    tech_name    = Column(String,  nullable=True)
    tech_phone   = Column(String,  nullable=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    status       = Column(String,  default="pending")
    notes        = Column(Text,    nullable=True)
    created_at   = Column(DateTime(timezone=True), default=_now)


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id          = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id  = Column(String, unique=True, nullable=False, index=True)
    vertical    = Column(String, nullable=False, default="hvac")
    state       = Column(JSONB,  nullable=False, default=dict)
    form_data   = Column(JSONB,  nullable=True,  default=None)
    is_complete = Column(Boolean, default=False)
    created_at  = Column(DateTime(timezone=True), default=_now)
    updated_at  = Column(DateTime(timezone=True), default=_now)


class Booking(Base):
    """Demo / onboarding booking from the marketing site."""
    __tablename__ = "bookings"

    id           = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name         = Column(String, nullable=False)
    email        = Column(String, nullable=False)
    business     = Column(String, nullable=False)
    vertical     = Column(String, nullable=False)
    team_size    = Column(String, nullable=True)
    message      = Column(Text,   nullable=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    created_at   = Column(DateTime(timezone=True), default=_now)


class WorkflowEvent(Base):
    """
    One row per workflow step for a lead.
    Consumed by workflow_trigger_tools SSE stream for the dashboard.
    Matches WorkflowEventResponse in models/workflow.py exactly.
    """
    __tablename__ = "workflow_events"

    id            = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id       = Column(PG_UUID(as_uuid=True), ForeignKey("leads.id"), nullable=False, index=True)
    step          = Column(Integer, nullable=False)
    label         = Column(String,  nullable=False)
    status        = Column(String,  nullable=False, default="active")  # active | done | error
    timestamp_str = Column(String,  nullable=True)
    created_at    = Column(DateTime(timezone=True), default=_now)


class CallLog(Base):
    __tablename__ = "call_logs"
    id                 = Column(Integer, primary_key=True)
    retell_call_id     = Column(String, unique=True, index=True)
    transcript         = Column(Text)
    summary            = Column(Text)
    recording_url      = Column(String)
    patient_phone      = Column(String)
    patient_name       = Column(String)
    patient_email      = Column(String)
    appointment_booked = Column(Boolean, default=False)
    appointment_date   = Column(String)
    appointment_time   = Column(String)
    duration_sec       = Column(Integer)
    disconnect_reason  = Column(String)
    event_type         = Column(String)
    created_at         = Column(DateTime(timezone=True), default=_now)


class Appointment(Base):
    __tablename__ = "appointments"
    id               = Column(Integer, primary_key=True)
    call_log_id      = Column(String) # Link to call_logs.retell_call_id
    patient_name     = Column(String)
    patient_phone    = Column(String)
    patient_email    = Column(String)
    appointment_date = Column(String)
    appointment_time = Column(String)
    status           = Column(String, default="scheduled")
    created_at       = Column(DateTime(timezone=True), default=_now)


class MissedCall(Base):
    __tablename__ = "missed_calls"
    id             = Column(Integer, primary_key=True)
    call_log_id    = Column(String)
    patient_name   = Column(String)
    patient_phone  = Column(String)
    patient_email  = Column(String)
    summary        = Column(Text)
    follow_up_sent = Column(Boolean, default=False)
    created_at     = Column(DateTime(timezone=True), default=_now)


# ── DB helpers ────────────────────────────────────────────────────────────────

async def get_db():
    """FastAPI dependency — yields a session, closes on exit."""
    async with AsyncSessionLocal() as session:
        yield session


@asynccontextmanager
async def get_db_context():
    """Async context manager for use outside FastAPI dependency injection."""
    async with AsyncSessionLocal() as session:
        yield session


async def init_db() -> None:
    """Create all tables that don't exist. Safe to call on every startup."""
    async with engine.begin() as conn:
        # Ensure UUID extension is available
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS pgcrypto"))
        
        # Run standard metadata sync
        await conn.run_sync(Base.metadata.create_all)
        
        # Explicit backup creation for critical bookings table if SQLAlchemy missed it
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS bookings (
                id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name         VARCHAR NOT NULL,
                email        VARCHAR NOT NULL,
                business     VARCHAR NOT NULL,
                vertical     VARCHAR NOT NULL,
                team_size    VARCHAR,
                message      TEXT,
                scheduled_at TIMESTAMPTZ,
                created_at   TIMESTAMPTZ DEFAULT now()
            )
        """))
        
        # Ensure columns exist if table was created in a previous run without them
        await conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS message TEXT"))
        await conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ"))
        
        # Also ensure workflow_events table exists
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS workflow_events (
                id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                lead_id       UUID NOT NULL REFERENCES leads(id),
                step          INTEGER NOT NULL,
                label         VARCHAR NOT NULL,
                status        VARCHAR NOT NULL DEFAULT 'active',
                timestamp_str VARCHAR,
                created_at    TIMESTAMPTZ DEFAULT now()
            )
        """))


__all__ = [
    "engine",
    "Base",
    "Lead",
    "Job",
    "ChatSession",
    "Booking",
    "WorkflowEvent",
    "CallLog",
    "Appointment",
    "MissedCall",
    "get_db",
    "get_db_context",
    "init_db",
    "select",
]
