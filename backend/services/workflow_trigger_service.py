# services/workflow_trigger_service.py
# Triggers post-chat workflow for an existing lead (dashboard use).
# Uses WorkflowEvent ORM model — columns: lead_id, step, label, status, timestamp_str
import json
import logging
import uuid
import asyncio
from uuid import UUID

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import Lead, WorkflowEvent, ChatSession, get_db_context
from models.workflow import WorkflowStartRequest, WorkflowStartResponse
from services import workflow_service

logger = logging.getLogger(__name__)


async def start_workflow(
    db:   AsyncSession,
    data: WorkflowStartRequest,
) -> WorkflowStartResponse:
    # Load lead
    result = await db.execute(select(Lead).where(Lead.id == data.lead_id))
    lead   = result.scalar_one_or_none()
    if not lead:
        raise ValueError(f"Lead not found: {data.lead_id}")

    vertical = data.vertical or lead.vertical

    # Check for existing events unless force=True
    if not data.force:
        existing = await db.execute(
            select(WorkflowEvent).where(WorkflowEvent.lead_id == data.lead_id).limit(1)
        )
        if existing.scalar_one_or_none():
            raise ValueError(
                f"Workflow events already exist for lead {data.lead_id}. Use force=true to re-run."
            )

    # Clear old events if force=True
    if data.force:
        await db.execute(delete(WorkflowEvent).where(WorkflowEvent.lead_id == data.lead_id))
        await db.commit()

    # Build state from lead — try to load full chat state if session exists
    state: dict = {
        "session_id":  str(lead.session_id or uuid.uuid4()),
        "vertical":    vertical,
        "name":        lead.name,
        "email":       lead.email,
        "phone":       lead.phone,
        "city":        lead.city,
        "issue":       lead.issue,
        "urgency":     lead.urgency,
        "score":       lead.score,
        "appt_booked": bool(lead.booked_at),
        "messages":    [],
        "turn_count":  0,
        "is_complete": True,
    }

    if lead.session_id:
        sess_result = await db.execute(
            select(ChatSession).where(ChatSession.session_id == lead.session_id)
        )
        sess = sess_result.scalar_one_or_none()
        if sess and sess.state:
            state.update(dict(sess.state))

    # Fire background task
    asyncio.create_task(_run_workflow(data.lead_id, vertical, state))

    logger.info(f"Workflow triggered: lead_id={data.lead_id} vertical={vertical}")
    return WorkflowStartResponse(
        lead_id  = data.lead_id,
        vertical = vertical,
        status   = "started",
    )


async def _run_workflow(lead_id: UUID, vertical: str, state: dict) -> None:
    """Runs the post-chat graph and writes WorkflowEvents to DB."""
    steps = [
        "extract_final", "score_urgency", "score_lead",
        "generate_summary", "send_email", "save_sheets",
    ]
    async with get_db_context() as db:
        try:
            # Write "active" event for first step
            await _write_event(db, lead_id, 1, steps[0], "active", "0s")

            result = workflow_service._POST_CHAT_GRAPHS[vertical].invoke(state)

            # Write done events for all steps
            for i, label in enumerate(steps, start=1):
                await _write_event(db, lead_id, i, label, "done", f"{i * 3}s")

            # Update lead with score from post-chat
            lead_result = await db.execute(select(Lead).where(Lead.id == lead_id))  # type: ignore[call-overload]
            lead = lead_result.scalar_one_or_none()  # type: ignore[assignment]
            if lead:
                lead.score       = result.get("score")
                lead.score_reason= result.get("score_reason")
                lead.sheet_row   = result.get("sheet_row")
                await db.commit()

        except Exception as e:
            logger.error(f"Workflow failed: lead_id={lead_id} error={e}")
            await _write_event(db, lead_id, 1, "error", "error", str(e)[:50])


async def _write_event(
    db:            AsyncSession,
    lead_id:       UUID,
    step:          int,
    label:         str,
    status:        str,
    timestamp_str: str,
) -> None:
    event = WorkflowEvent(
        lead_id       = lead_id,
        step          = step,
        label         = label,
        status        = status,
        timestamp_str = timestamp_str,
    )
    db.add(event)
    await db.commit()


async def stream_events(db: AsyncSession, lead_id: UUID):
    """
    Async generator for SSE stream of WorkflowEvent rows.
    Polls every second until all steps done or error appears.
    """
    seen_ids: set = set()
    max_wait = 120
    waited   = 0

    while waited < max_wait:
        result = await db.execute(
            select(WorkflowEvent)
            .where(WorkflowEvent.lead_id == lead_id)
            .order_by(WorkflowEvent.step)
        )
        events = result.scalars().all()

        for ev in events:
            if ev.id not in seen_ids:
                seen_ids.add(ev.id)
                yield {
                    "step":          ev.step,
                    "label":         ev.label,
                    "status":        ev.status,
                    "timestamp_str": ev.timestamp_str,
                }

        # Stop if last event is done or error
        if events:
            last = events[-1]
            if last.status in ("done", "error") and last.step >= 6:
                break

        await asyncio.sleep(1)
        waited += 1