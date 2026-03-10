# api/v1/workflow.py
# Workflow trigger + SSE stream endpoints.
# Used by the dashboard to manually trigger or re-run post-chat processing
# for a lead, and to stream live node progress.
#
# POST /workflow/start         — trigger post-chat graph for a lead
# GET  /workflow/stream/{id}   — SSE stream of node events (dashboard live feed)
import json
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from api.deps import get_db
from models.workflow import WorkflowStartRequest, WorkflowStartResponse
from services import workflow_trigger_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/start",
    response_model=WorkflowStartResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Trigger workflow for a lead",
    description=(
        "Manually triggers post-chat processing (scoring, email, sheets) "
        "for an existing lead. Runs in background. "
        "Use force=true to re-run a workflow that already completed."
    ),
)
async def start_workflow(
    body: WorkflowStartRequest,
    db   = Depends(get_db),
) -> WorkflowStartResponse:
    try:
        return await workflow_trigger_service.start_workflow(db, body)
    except ValueError as e:
        msg = str(e)
        if "not found" in msg:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=msg)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=msg)
    except Exception as e:
        logger.error(f"start_workflow failed: lead_id={body.lead_id} {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start workflow.",
        )


@router.get(
    "/stream/{workflow_id}",
    summary="Stream workflow events (SSE)",
    description=(
        "Server-Sent Events stream of workflow node progress. "
        "Dashboard uses EventSource to display live node status. "
        "Stream closes automatically when workflow completes or fails, "
        "or after 2 minutes (timeout)."
    ),
)
async def stream_workflow(
    workflow_id: str,
    db           = Depends(get_db),
):
    async def event_generator():
        try:
            async for event in workflow_trigger_service.stream_events(db, workflow_id):
                # SSE format: data: {...}\n\n
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as e:
            logger.error(f"stream_workflow error: workflow_id={workflow_id} {e}")
            yield f"data: {json.dumps({'event': 'error', 'detail': str(e)})}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control":  "no-cache",
            "X-Accel-Buffering": "no",   # Nginx: disable proxy buffering for SSE
        },
    )