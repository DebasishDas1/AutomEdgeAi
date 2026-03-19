# api/v1/chat/hvac.py
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from api.deps import get_db
from api.v1.chat.base import (
    MessageRequest,
    MessageResponse,
    StartRequest,
    StartResponse,
    handle_message,
    handle_message_stream,
    handle_start,
)

router = APIRouter()

_VERTICAL = "hvac"


@router.post(
    "/start",
    response_model=StartResponse,
    status_code=201,
    summary="Start an HVAC chat session",
)
async def start(body: StartRequest, db=Depends(get_db)):
    """
    Create a new HVAC lead capture session.
    Returns a session_id used for all subsequent /message calls.
    """
    return await handle_start(_VERTICAL, body, db)


@router.post(
    "/message",
    response_model=MessageResponse,
    summary="Send a message in an HVAC session",
)
async def message(body: MessageRequest, db=Depends(get_db)):
    """
    Send a user message and receive the AI reply.
    The graph advances one turn per call.
    """
    return await handle_message(body, db)


@router.post(
    "/message/stream",
    response_class=StreamingResponse,
    summary="Stream an HVAC AI reply via SSE",
    # FIX: FastAPI can't infer the response model for StreamingResponse.
    # Explicitly exclude from schema generation to avoid misleading docs.
    include_in_schema=True,
)
async def message_stream(body: MessageRequest, db=Depends(get_db)):
    """
    Server-Sent Events endpoint. Streams AI reply tokens as they are generated.

    Response format:
      data: {"chunk": "<token>"}   — repeated per token
      data: [DONE]                 — signals stream end
      data: {"error": "..."}      — on failure
    """
    return await handle_message_stream(body, db)