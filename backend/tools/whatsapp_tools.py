# tools/workflow_tools.py
from __future__ import annotations

import asyncio
import uuid
import structlog
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified

from core.database import ChatSession, get_db_context
from workflows.registry import registry

logger = structlog.get_logger(__name__)


async def _save_session(db: AsyncSession, row: ChatSession, state) -> None:
    """Normalize and persist LangGraph state. Caller must commit."""
    if isinstance(state, str):
        state = {"messages": [{"role": "assistant", "content": state}], "is_complete": False}
    elif hasattr(state, "state"):
        state = dict(state.state)
    elif not isinstance(state, dict):
        state = {"messages": [{"role": "assistant", "content": str(state)}], "is_complete": False}

    msgs = state.get("messages", [])
    if not isinstance(msgs, list):
        msgs = [msgs]
    state["messages"] = msgs[-20:]

    row.state = {k: v for k, v in state.items() if not k.startswith("_")}
    flag_modified(row, "state")
    row.is_complete = bool(state.get("is_complete"))
    row.updated_at = datetime.now(timezone.utc)


async def start_session(
    db: AsyncSession,
    vertical: str,
    name: str | None = None,
    email: str | None = None,
    phone: str | None = None,
    source: str | None = None,
) -> dict:
    _SUPPORTED = {"hvac", "plumbing", "roofing", "pest_control"}
    if vertical not in _SUPPORTED:
        raise ValueError(f"Unknown vertical '{vertical}'. Supported: {sorted(_SUPPORTED)}")

    session_id = str(uuid.uuid4())
    initial_state = {
        "session_id":   session_id,
        "vertical":     vertical,
        "messages":     [],
        "turn_count":   0,
        "is_complete":  False,
        "is_spam":      False,
        "intent":       "service_request",
        "name":         name  or None,
        "email":        email or None,
        "phone":        phone or None,
        "issue":        None,
        "description":  None,
        "urgency":      None,
        "address":      None,
        "is_homeowner": None,
        "ai_urgency":   None,
    }

    row = ChatSession(
        session_id=session_id,
        vertical=vertical,
        state=initial_state,
        form_data={"name": name, "email": email, "phone": phone, "source": source},
    )
    db.add(row)
    await db.commit()
    logger.info("session_started", session_id=session_id, vertical=vertical,
                has_name=bool(name), has_email=bool(email), has_phone=bool(phone))
    return {"session_id": session_id, "vertical": vertical, "turn": 0}


async def send_message(db: AsyncSession, session_id: str, user_msg: str) -> dict:
    """
    Append user message, invoke chat graph, persist result.

    FIX: build graph_input as a clean local copy before ainvoke. If ainvoke
    raises, row.state is never touched — session stays consistent.

    FIX: post-chat task uses loop.create_task with a name for debuggability.
    Previously asyncio.create_task was called outside a running-loop guard,
    which silently dropped the task on some FastAPI configurations.
    """
    stmt = select(ChatSession).where(
        ChatSession.session_id == session_id
    ).with_for_update()
    res = await db.execute(stmt)
    row = res.scalar_one_or_none()

    if row is None:
        raise ValueError("session_not_found")
    if row.is_complete:
        raise ValueError("session_already_complete")

    state = dict(row.state)
    graph_input = {
        **state,
        "messages": list(state.get("messages", [])) + [{
            "role": "user",
            "content": user_msg,
            "ts": datetime.now(timezone.utc).isoformat(),
        }],
    }

    graph = registry.get_chat_graph(row.vertical)
    result = await graph.ainvoke(graph_input)

    was_complete = bool(state.get("is_complete"))
    await _save_session(db, row, result)
    await db.commit()

    # Fire post-chat pipeline when session first completes
    if result.get("is_complete") and not was_complete:
        post_state = dict(result)
        vertical = row.vertical
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(
                run_post_chat(post_state, vertical),
                name=f"post_chat_{session_id[:8]}",
            )
            logger.info("post_chat_scheduled", session_id=session_id, vertical=vertical)
        except RuntimeError as exc:
            logger.error("post_chat_schedule_failed", session_id=session_id, error=str(exc))

    last_ai = next(
        (m["content"] for m in reversed(result.get("messages", []))
         if m.get("role") == "assistant"),
        "",
    )
    return {
        "session_id":       session_id,
        "message":          last_ai,
        "turn":             result.get("turn_count", 0),
        "is_complete":      bool(result.get("is_complete")),
        "appt_booked":      bool(result.get("appt_booked")),
        "fields_collected": {
            k: result.get(k)
            for k in ("name", "email", "phone", "issue",
                      "description", "urgency", "address")
            if result.get(k) is not None
        },
    }


async def run_post_chat(state: dict, vertical: str) -> None:
    """
    Run score + deliver post-chat graph in a fresh DB context.
    All errors are caught — must never propagate to the event loop.

    FIX: previously `if not graph: return` silently swallowed a None graph
    without logging. Now logs a warning with the vertical name.
    """
    session_id = state.get("session_id")
    logger.info("post_chat_started", session_id=session_id, vertical=vertical)

    graph = registry.get_post_graph(vertical)
    if graph is None:
        logger.warning("post_chat_no_graph", vertical=vertical, session_id=session_id)
        return

    try:
        async with get_db_context() as db:
            stmt = select(ChatSession).where(
                ChatSession.session_id == session_id
            ).with_for_update()
            res = await db.execute(stmt)
            row = res.scalar_one_or_none()
            if row is None:
                logger.warning("post_chat_session_not_found", session_id=session_id)
                return
            result = await graph.ainvoke(state)
            await _save_session(db, row, result)
            await db.commit()
            logger.info("post_chat_complete", session_id=session_id, vertical=vertical)
    except Exception as exc:
        logger.error("post_chat_failed", session_id=session_id,
                     vertical=vertical, error=str(exc))


async def save_session_by_id(db: AsyncSession, session_id: str, state: dict) -> None:
    res = await db.execute(
        select(ChatSession).where(ChatSession.session_id == session_id)
    )
    row = res.scalar_one_or_none()
    if row is None:
        raise ValueError(f"session_not_found: {session_id}")
    await _save_session(db, row, state)