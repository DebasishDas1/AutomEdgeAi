# api/v1/chat/pest_control.py
# Pest Control chat endpoints.
# Agent: Jordan — ants, roaches, rodents, termites, bed bugs
#
# POST /chat/pest-control/start    — new session, returns AI greeting
# POST /chat/pest-control/message  — user turn, returns AI reply
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

_VERTICAL = "pest_control"


@router.post(
    "/start",
    response_model=StartResponse,
    status_code=201,
    summary="Start a Pest Control chat session",
    description=(
        "Creates a new chat session with Jordan, our Pest Control specialist. "
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
    summary="Send a message in a Pest Control chat",
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