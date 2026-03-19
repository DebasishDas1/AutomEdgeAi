#!/bin/bash
# Run from your backend/ directory: bash apply_all_fixes.sh
# Writes all three fixes directly to disk.

BACKEND=$(pwd)
echo "Applying fixes to: $BACKEND"

# ── Fix 1: workflow_service.py ─────────────────────────────────────────────
cat > "$BACKEND/services/workflow_service.py" << 'PYEOF'
from __future__ import annotations
import asyncio, structlog, uuid
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import ChatSession, get_db_context
from workflows.registry import registry

logger = structlog.get_logger(__name__)

async def _save_session(db: AsyncSession, row: ChatSession, state: dict) -> None:
    state["messages"] = state.get("messages", [])[-20:]
    row.state = {k: v for k, v in state.items() if not k.startswith("_")}
    row.is_complete = bool(state.get("is_complete"))
    row.updated_at = datetime.now(timezone.utc)

async def start_session(db: AsyncSession, vertical: str, name: str | None = None,
    email: str | None = None, phone: str | None = None, source: str | None = None) -> dict:
    session_id = str(uuid.uuid4())
    initial_state = {
        "session_id": session_id, "vertical": vertical,
        "messages": [], "turn_count": 0, "is_complete": False,
        "is_spam": False, "urgency": "normal", "intent": "service_request",
        "name": None, "email": None, "phone": None, "issue": None, "is_homeowner": None,
    }
    row = ChatSession(session_id=session_id, vertical=vertical, state=initial_state,
        form_data={"name": name, "email": email, "phone": phone, "source": source})
    db.add(row)
    await db.commit()
    logger.info("session_started", session_id=session_id, vertical=vertical)
    return {"session_id": session_id, "vertical": vertical, "turn": 0}

async def send_message(db: AsyncSession, session_id: str, user_msg: str) -> dict:
    stmt = select(ChatSession).where(ChatSession.session_id == session_id).with_for_update()
    res = await db.execute(stmt)
    row = res.scalar_one_or_none()
    if not row: raise ValueError("session_not_found")
    if row.is_complete: raise ValueError("session_already_complete")
    state = dict(row.state)
    state["messages"] = list(state.get("messages", []))
    state["messages"].append({"role": "user", "content": user_msg,
        "ts": datetime.now(timezone.utc).isoformat()})
    graph = registry.get_chat_graph(row.vertical)
    result = await graph.ainvoke(state)
    await _save_session(db, row, result)
    await db.commit()
    if result.get("is_complete") and not state.get("is_complete"):
        post_state = dict(result)
        if hasattr(row, "form_data") and row.form_data:
            fd = row.form_data
            post_state.setdefault("name", fd.get("name"))
            post_state.setdefault("email", fd.get("email"))
            post_state.setdefault("phone", fd.get("phone"))
        asyncio.create_task(run_post_chat(post_state, row.vertical))
    last_ai = next(
        (m["content"] for m in reversed(result.get("messages", [])) if m.get("role") == "assistant"), "")
    return {"session_id": session_id, "message": last_ai,
        "turn": result.get("turn_count", 0), "is_complete": bool(result.get("is_complete")),
        "appt_booked": bool(result.get("appt_booked")),
        "fields_collected": {k: result.get(k) for k in ("name","email","phone","issue","urgency")
            if result.get(k) is not None}}

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
PYEOF
echo "✓ workflow_service.py"

# ── Fix 2: nodes.py — _REQUIRED_FIELDS ────────────────────────────────────
# Only change the _REQUIRED_FIELDS line, leave rest of file intact
sed -i '' 's/_REQUIRED_FIELDS = ("name", "phone", "issue")/_REQUIRED_FIELDS = ("issue", "urgency")/' \
    "$BACKEND/workflows/hvac/nodes.py"
echo "✓ nodes.py _REQUIRED_FIELDS"

# ── Fix 3: prompts.py — replace HVAC_EXPERT_SYSTEM ────────────────────────
python3 - << 'PYEOF'
import re, pathlib

path = pathlib.Path("workflows/hvac/prompts.py")
content = path.read_text()

new_prompt = '''HVAC_EXPERT_SYSTEM = """\
You are an HVAC intake assistant collecting lead information. You are mid-conversation.

Already collected: {collected}

Missing fields to collect (in order): Issue → Urgency → Name → Phone → Email

YOUR ONLY JOB: Ask for the next ONE missing field.

STRICT RULES:
- Ask exactly one question, under 8 words.
- NEVER say "I understand", "It sounds like", "Got it", or any filler.
- NEVER summarize or repeat what the user just said.
- NEVER re-introduce yourself or greet again.
- If all fields are collected, reply only: "Thanks! We\'ll be in touch shortly."

Examples:
  → "How urgent is this issue?"
  → "What\'s your name?"
  → "Best phone number to reach you?"
"""'''

# Replace from HVAC_EXPERT_SYSTEM = to the closing """
content = re.sub(
    r'HVAC_EXPERT_SYSTEM = """.*?"""',
    new_prompt,
    content,
    flags=re.DOTALL
)
path.write_text(content)
print("✓ prompts.py HVAC_EXPERT_SYSTEM")
PYEOF

echo ""
echo "All fixes applied. Verifying..."
echo ""
grep -n "_REQUIRED_FIELDS" workflows/hvac/nodes.py
grep -n "Already collected" workflows/hvac/prompts.py
grep -n '"name": None' services/workflow_service.py
echo ""
echo "Start the server: uv run uvicorn main:app --reload"