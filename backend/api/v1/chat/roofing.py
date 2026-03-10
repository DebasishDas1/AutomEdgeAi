# api/v1/chat/roofing.py
# Roofing chat endpoints.
# Agent: Jordan — storm damage, leaking roof, missing shingles
#
# POST /chat/roofing/start    — new session, returns AI greeting
# POST /chat/roofing/message  — user turn, returns AI reply
#
# When is_complete=True: scoring + email + Google Sheets update
# run automatically as a BackgroundTask. No extra endpoint needed.
from fastapi import APIRouter, BackgroundTasks, Depends

from api.deps import get_db
from api.v1.chat.base import (
    StartRequest,
    StartResponse,
    MessageRequest,
    MessageResponse,
    handle_start,
    handle_message,
)

router = APIRouter()

_VERTICAL = "roofing"


@router.post(
    "/start",
    response_model=StartResponse,
    status_code=201,
    summary="Start a Roofing chat session",
    description=(
        "Creates a new chat session with Jordan, our Roofing specialist. "
        "Returns the AI opening message (turn 0). "
        "Pass session_id to every /message call."
    ),
)
async def start(
    body: StartRequest,
    db   = Depends(get_db),
) -> StartResponse:
    return await handle_start(_VERTICAL, body, db)


@router.post(
    "/message",
    response_model=MessageResponse,
    summary="Send a message in a Roofing chat",
    description=(
        "Sends a user message to Jordan and returns the AI reply. "
        "When is_complete=True, post-chat processing fires automatically "
        "in the background: lead scoring, confirmation email, Google Sheets update."
    ),
)
async def message(
    body:             MessageRequest,
    background_tasks: BackgroundTasks,
    db                = Depends(get_db),
) -> MessageResponse:
    return await handle_message(body, background_tasks, db)