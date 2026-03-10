# api/v1/workflow.py
import json
import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.workflow import WorkflowStartRequest, WorkflowStartResponse
from services import workflow_trigger_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/start", response_model=WorkflowStartResponse, status_code=202)
async def start_workflow(body: WorkflowStartRequest, db: AsyncSession = Depends(get_db)):
    try:
        return await workflow_trigger_service.start_workflow(db, body)
    except ValueError as e:
        msg = str(e)
        code = 404 if "not found" in msg else 409
        raise HTTPException(status_code=code, detail=msg)
    except Exception as e:
        logger.error(f"start_workflow: {e}")
        raise HTTPException(status_code=500, detail="Failed to start workflow.")


@router.get("/stream/{lead_id}")
async def stream_workflow(lead_id: UUID, db: AsyncSession = Depends(get_db)):
    async def event_generator():
        try:
            async for event in workflow_trigger_service.stream_events(db, lead_id):
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as e:
            logger.error(f"stream_workflow: lead_id={lead_id} {e}")
            yield f"data: {json.dumps({'status': 'error', 'detail': str(e)})}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )