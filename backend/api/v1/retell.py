# api/v1/retell.py
# Retell AI post-call webhook endpoint.
from __future__ import annotations

import hmac
import hashlib
import structlog

from fastapi import APIRouter, BackgroundTasks, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from core.config import settings
from tools.retell_tools import extract_call_data
from tools.retell_delivery_tools import run_retell_post_call_pipeline

logger = structlog.get_logger(__name__)

router = APIRouter()


class WebCallResponse(BaseModel):
    access_token: str
    call_id: str


@router.post(
    "/create-web-call",
    response_model=WebCallResponse,
    summary="Create a new web call session",
)
async def create_web_call():
    """
    Called by the frontend to get an access token for starting a web call.
    """
    if not settings.RETELL_API_KEY:
        raise HTTPException(status_code=500, detail="RETELL_API_KEY not configured")
    if not settings.RETELL_AGENT_ID:
        raise HTTPException(status_code=500, detail="RETELL_AGENT_ID not configured")

    try:
        # Use the singleton client from app.state
        client = request.app.state.retell
        
        # Create a web call
        web_call_response = client.web_call.create(
            agent_id=settings.RETELL_AGENT_ID,
        )
        
        return {
            "access_token": web_call_response.access_token,
            "call_id": web_call_response.call_id,
        }
    except Exception as exc:
        logger.error("retell_create_web_call_failed", error=str(exc))
        raise HTTPException(status_code=500, detail=str(exc))


@router.post(
    "/post-call",
    operation_id="retell_post_call",   # explicit — prevents Swagger duplicate-ID warning
    summary="Retell AI post-call webhook",
    response_description="Accepted for async processing",
)
async def retell_post_call(
    request: Request,
    background_tasks: BackgroundTasks,
) -> JSONResponse:
    """
    Retell sends a POST here when a call ends and analysis is complete
    (event = "call_analyzed").

    We return 200 immediately so Retell doesn't retry, then process
    in background (DB → email → WhatsApp).

    Configure in Retell dashboard:
      Post-call webhook URL: https://your-domain.com/api/v1/retell/post-call
    """

    # ── 1. HMAC Verification (Security Hardening) ──────────────────────────────
    # Retell sends an 'x-retell-signature' header. We must verify it.
    signature = request.headers.get("x-retell-signature")
    body = await request.body()
    
    if signature and settings.RETELL_WEBHOOK_SECRET:
        expected = hmac.new(
            settings.RETELL_WEBHOOK_SECRET.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected):
            logger.warning("retell_webhook_invalid_signature", signature=signature)
            raise HTTPException(status_code=401, detail="invalid_signature")
    elif not signature and settings.ENVIRONMENT != "dev":
        # Signature is mandatory in production
        raise HTTPException(status_code=401, detail="missing_signature")

    if not body:
        # Empty body — likely a health-check ping or Swagger test
        logger.debug("retell_webhook_empty_body")
        return JSONResponse({"status": "ok", "detail": "empty_body"})

    try:
        import json
        payload = json.loads(body)
    except Exception as exc:
        # Malformed JSON — log and return 200 so Retell doesn't endlessly retry
        logger.warning("retell_webhook_bad_json", error=str(exc))
        return JSONResponse({"status": "error", "detail": "invalid_json"}, status_code=200)

    # ── 2. Route by event type ─────────────────────────────────────────────────
    event = (
        payload.get("event")
        or payload.get("body", {}).get("event")
        or ""
    )
    call_id = (
        (payload.get("call") or {}).get("call_id")
        or payload.get("call_id")
        or "unknown"
    )

    logger.info("retell_webhook_received", event=event, call_id=call_id)

    if event != "call_analyzed":
        # call_started, call_ended, etc. — acknowledge and discard
        logger.debug("retell_webhook_ignored", event=event, call_id=call_id)
        return JSONResponse({"status": "ignored", "event": event})

    # ── 3. Extract (pure Python, no I/O — safe to do before returning) ─────────
    try:
        call_data = extract_call_data(payload)
    except Exception as exc:
        logger.error("retell_extraction_failed", call_id=call_id, error=str(exc))
        # Return 200 — don't let Retell retry on our parsing bug
        return JSONResponse({"status": "extraction_failed", "call_id": call_id})

    logger.info(
        "retell_call_extracted",
        call_id=call_data["call_id"],
        patient_name=call_data["patient_name"],
        patient_phone=call_data["patient_phone"],
        appointment_booked=call_data["appointment_booked"],
        appointment_date=call_data["appointment_date"],
    )

    # ── 4. Fire pipeline in background — Retell gets 200 immediately ───────────
    background_tasks.add_task(_run_pipeline, call_data)

    return JSONResponse({
        "status": "accepted",
        "call_id": call_data["call_id"],
        "appointment_booked": call_data["appointment_booked"],
    })


async def _run_pipeline(call_data: dict) -> None:
    """Background task — all errors caught so nothing propagates to the event loop."""
    try:
        results = await run_retell_post_call_pipeline(call_data)
        logger.info(
            "retell_pipeline_done",
            call_id=call_data["call_id"],
            booked=call_data["appointment_booked"],
            db_ok=results.get("db_call_log"),
            email_patient=results.get("email_patient"),
            email_clinic=results.get("email_clinic"),
            wa_clinic=results.get("wa_clinic"),
        )
    except Exception as exc:
        logger.error(
            "retell_pipeline_error",
            call_id=call_data.get("call_id"),
            error=str(exc),
        )