# services/workflow_service.py
from __future__ import annotations

import asyncio, structlog, uuid
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified
from core.database import ChatSession, get_db_context
from workflows.registry import registry

logger = structlog.get_logger(__name__)


async def _save_session(db: AsyncSession, row: ChatSession, state: dict) -> None:
    state["messages"] = state.get("messages", [])[-20:]
    row.state = {k: v for k, v in state.items() if not k.startswith("_")}
    flag_modified(row, "state")
    row.is_complete = bool(state.get("is_complete"))
    row.updated_at = datetime.now(timezone.utc)


async def start_session(
    db: AsyncSession, vertical: str,
    name: str | None = None, email: str | None = None,
    phone: str | None = None, source: str | None = None,
) -> dict:
    session_id = str(uuid.uuid4())
    initial_state = {
        "session_id": session_id,
        "vertical": vertical,
        "messages": [],
        "turn_count": 0,
        "is_complete": False,
        "is_spam": False,
        "intent": "service_request",
        # All contact/collected fields start as None.
        # They are ONLY set when user explicitly provides them.
        # Never pre-filled — prevents premature is_complete.
        "name": None,
        "email": None,
        "phone": None,
        "issue": None,
        "description": None,
        "urgency": None,      # None, not "normal" — prevents classification from satisfying this
        "address": None,
        "is_homeowner": None,
        "ai_urgency": None,   # classification assessment, separate from collected urgency
    }
    row = ChatSession(
        session_id=session_id, vertical=vertical,
        state=initial_state,
        form_data={"name": name, "email": email, "phone": phone, "source": source},
    )
    db.add(row)
    await db.commit()
    logger.info("session_started", session_id=session_id, vertical=vertical)
    return {"session_id": session_id, "vertical": vertical, "turn": 0}


async def send_message(db: AsyncSession, session_id: str, user_msg: str) -> dict:
    stmt = select(ChatSession).where(
        ChatSession.session_id == session_id).with_for_update()
    res = await db.execute(stmt)
    row = res.scalar_one_or_none()

    if not row: raise ValueError("session_not_found")
    if row.is_complete: raise ValueError("session_already_complete")

    state = dict(row.state)
    state["messages"] = list(state.get("messages", []))
    state["messages"].append({
        "role": "user", "content": user_msg,
        "ts": datetime.now(timezone.utc).isoformat(),
    })

    graph = registry.get_chat_graph(row.vertical)
    result = await graph.ainvoke(state)

    await _save_session(db, row, result)
    await db.commit()

    if result.get("is_complete") and not state.get("is_complete"):
        post_state = dict(result)
        if hasattr(row, "form_data") and row.form_data:
            fd = row.form_data
            post_state.setdefault("name",  fd.get("name"))
            post_state.setdefault("email", fd.get("email"))
            post_state.setdefault("phone", fd.get("phone"))
        asyncio.create_task(run_post_chat(post_state, row.vertical))

    last_ai = next(
        (m["content"] for m in reversed(result.get("messages", []))
         if m.get("role") == "assistant"), "")

    return {
        "session_id": session_id,
        "message": last_ai,
        "turn": result.get("turn_count", 0),
        "is_complete": bool(result.get("is_complete")),
        "appt_booked": bool(result.get("appt_booked")),
        "fields_collected": {
            k: result.get(k)
            for k in ("name", "email", "phone", "issue", "description", "urgency", "address")
            if result.get(k) is not None
        },
    }


async def run_post_chat(state: dict, vertical: str) -> None:
    graph = registry.get_post_graph(vertical)
    if not graph: return
    try:
        async with get_db_context() as db:
            stmt = select(ChatSession).where(
                ChatSession.session_id == state["session_id"]).with_for_update()
            res = await db.execute(stmt)
            row = res.scalar_one_or_none()
            if row:
                result = await graph.ainvoke(state)
                await _save_session(db, row, result)
                await db.commit()
                logger.info("post_chat_complete", session_id=state.get("session_id"))
    except Exception as exc:
        logger.error("post_chat_failed", session_id=state.get("session_id"), error=str(exc))