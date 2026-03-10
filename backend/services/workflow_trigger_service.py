# services/workflow_trigger_service.py
# Triggers a post-chat workflow for an existing lead (dashboard use).
# The main workflow execution lives in workflow_service.py — this service
# loads the lead, builds a minimal state dict, and hands it off.
import json
import logging
import uuid

import asyncpg

from models.workflow import WorkflowStartRequest, WorkflowStartResponse, WorkflowEvent
from services import workflow_service

logger = logging.getLogger(__name__)


async def start_workflow(
    db:   asyncpg.Connection,
    data: WorkflowStartRequest,
) -> WorkflowStartResponse:
    # Load lead from DB
    row = await db.fetchrow("SELECT * FROM leads WHERE id = $1", data.lead_id)
    if not row:
        raise ValueError(f"Lead not found: {data.lead_id}")

    vertical    = data.vertical or row["vertical"]
    workflow_id = str(uuid.uuid4())

    # Check if workflow already ran (unless force=True)
    if not data.force:
        existing = await db.fetchval(
            "SELECT id FROM workflow_runs WHERE lead_id = $1 AND status = 'complete'",
            data.lead_id,
        )
        if existing:
            raise ValueError(f"Workflow already completed for lead {data.lead_id}. Use force=true to re-run.")

    # Insert workflow_run row
    await db.execute(
        """
        INSERT INTO workflow_runs (workflow_id, lead_id, vertical, status)
        VALUES ($1, $2, $3, 'pending')
        """,
        workflow_id, data.lead_id, vertical,
    )

    # Build state from lead row — enough for post-chat graph to run
    state = {
        "session_id":    row.get("session_id") or workflow_id,
        "vertical":      vertical,
        "name":          row["name"],
        "email":         row["email"],
        "phone":         row["phone"],
        "location":      row["location"],
        "issue":         row["issue"],
        "pest_type":     row["pest_type"],
        "damage_type":   row["damage_type"],
        "score":         row["score"],
        "appt_booked":   row["appt_booked"],
        "appt_confirmed":row["appt_confirmed"],
        "messages":      [],
        "turn_count":    0,
        "is_complete":   True,
    }

    # Load full JSONB state from chat_sessions if session_id exists
    if row.get("session_id"):
        session_row = await db.fetchrow(
            "SELECT state FROM chat_sessions WHERE session_id = $1",
            row["session_id"],
        )
        if session_row:
            full_state = json.loads(session_row["state"]) if isinstance(session_row["state"], str) else dict(session_row["state"])
            state.update(full_state)

    logger.info(f"Workflow triggered: workflow_id={workflow_id} lead_id={data.lead_id} vertical={vertical}")

    # Run post-chat graph in background — import here to avoid circular
    from core.database import get_db_connection
    import asyncio

    async def _run():
        try:
            await db.execute(
                "UPDATE workflow_runs SET status = 'running', started_at = NOW() WHERE workflow_id = $1",
                workflow_id,
            )
            await workflow_service.run_post_chat(state, vertical)
            async with get_db_connection() as conn:
                await conn.execute(
                    "UPDATE workflow_runs SET status = 'complete', finished_at = NOW() WHERE workflow_id = $1",
                    workflow_id,
                )
        except Exception as e:
            logger.error(f"Workflow failed: {workflow_id} error={e}")
            async with get_db_connection() as conn:
                await conn.execute(
                    "UPDATE workflow_runs SET status = 'failed', finished_at = NOW() WHERE workflow_id = $1",
                    workflow_id,
                )

    asyncio.create_task(_run())

    return WorkflowStartResponse(
        workflow_id = workflow_id,
        lead_id     = data.lead_id,
        vertical    = vertical,
        status      = "pending",
    )


async def stream_events(
    db:          asyncpg.Connection,
    workflow_id: str,
):
    """
    Async generator — yields WorkflowEvent dicts for SSE streaming.
    Polls workflow_events table every second until workflow completes.
    Dashboard uses EventSource to display live node progress.
    """
    last_id  = 0
    max_wait = 120   # 2 minute timeout
    waited   = 0

    while waited < max_wait:
        rows = await db.fetch(
            """
            SELECT id, event, status, detail, ts
            FROM workflow_events
            WHERE workflow_id = $1 AND id > $2
            ORDER BY id ASC
            """,
            workflow_id, last_id,
        )

        for row in rows:
            last_id = row["id"]
            yield {
                "workflow_id": workflow_id,
                "event":       row["event"],
                "status":      row["status"],
                "detail":      row["detail"],
                "ts":          row["ts"].isoformat(),
            }

        # Check if workflow finished
        run_status = await db.fetchval(
            "SELECT status FROM workflow_runs WHERE workflow_id = $1",
            workflow_id,
        )
        if run_status in ("complete", "failed"):
            break

        import asyncio
        await asyncio.sleep(1)
        waited += 1