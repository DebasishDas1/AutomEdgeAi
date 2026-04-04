# api/v1/chat/pest_control.py
from fastapi import APIRouter, Depends, BackgroundTasks, Request
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

_VERTICAL = "pest_control"


@router.post(
    "/start",
    response_model=StartResponse,
    status_code=201,
    summary="Start a pest control chat session"
)
async def start(body: StartRequest, db=Depends(get_db)):
    """Create a new pest control lead capture session."""
    return await handle_start(_VERTICAL, body, db)


@router.post(
    "/message",
    response_model=MessageResponse,
    summary="Send a message in a pest control session"
)
async def message(
    request: Request,
    background_tasks: BackgroundTasks,
    body: MessageRequest,
    db=Depends(get_db),
):
    """Send a user message and receive the AI reply."""
    return await handle_message(body, db, background_tasks, request)


@router.post(
    "/message/stream",
    response_class=StreamingResponse,
    summary="Stream a pest control AI reply via SSE"
)
async def message_stream(
    request: Request,
    background_tasks: BackgroundTasks,
    body: MessageRequest,
    db=Depends(get_db)
):
    """SSE endpoint. data: {chunk} per token, data: [DONE] on finish."""
    return await handle_message_stream(body, db, background_tasks, request)