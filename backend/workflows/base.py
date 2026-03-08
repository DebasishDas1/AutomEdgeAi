from typing import TypedDict, Literal, Optional
from datetime import datetime
from tools.sheets import sheets_tool
from tools.sms import sms_tool
from tools.review import review_tool
import logging

logger = logging.getLogger(__name__)

# Every vertical's graph uses this same state shape
class LeadState(TypedDict):
    lead_id:      str
    name:         str
    phone:        str
    email:        str
    source:       str          # google|angi|phone|web
    vertical:     str          # hvac|roofing|plumbing|pest
    issue:        str          # "AC not cooling"
    urgency:      str          # emergency|urgent|normal
    city:         str
    stage:        str          # new|contacted|quoted|booked|done
    sms_sent:     bool
    tech_notified:bool
    booked_at:    Optional[datetime]
    review_sent:  bool
    events:       list[dict]   # audit trail streamed to frontend

def add_event(state: LeadState, label: str, status: str = "done") -> None:
    step_num = len(state.get("events", [])) + 1
    state.get("events", []).append({
        "step": step_num,
        "label": label,
        "status": status,
        "timestamp_str": "now" # In real app, calculate from start
    })

# Shared nodes every vertical uses
def capture_lead(state: LeadState) -> LeadState:
    logger.info(f"Node [capture_lead] for {state['name']}")
    
    # Save to Google Sheets
    row = [
        datetime.now().isoformat(),
        state['name'],
        state['phone'],
        state['email'],
        state['source'],
        state['issue'],
        state['city']
    ]
    sheets_tool.append_row(state['vertical'], row)
    
    add_event(state, "Lead Captured & Validated", "done")
    state['stage'] = "contacted"
    return state

def send_sms(state: LeadState) -> LeadState:
    logger.info(f"Node [send_sms] to {state['phone']}")
    
    message = f"Hi {state['name']}, thanks for reaching out to Automedge about your {state['vertical']} issue. A technician will contact you shortly."
    success = sms_tool.send_sms(state['phone'], message)
    
    state['sms_sent'] = success
    add_event(state, "SMS Notification Sent", "done" if success else "error")
    return state

def request_review(state: LeadState) -> LeadState:
    logger.info(f"Node [request_review] for {state['name']}")
    
    success = review_tool.request_review(state['name'], state['email'], state['phone'])
    
    state['review_sent'] = success
    add_event(state, "Review Request Sent", "done" if success else "error")
    return state

# -----------------------------------------------------------------------------
# Common Graph Node Helpers (Shared by Chat Workflows)
# -----------------------------------------------------------------------------

import json
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from datetime import timedelta

_MISSING = object()

def _field_missing(state: dict, key: str) -> bool:
    """Returns True only if field has never been set. False is a valid value."""
    val = state.get(key, _MISSING)
    return val is _MISSING or val is None

def _parse_json_from_llm(content: str) -> dict | None:
    """Safely extract the first JSON object from an LLM response string."""
    start = content.find("{")
    end   = content.rfind("}") + 1
    if start == -1 or end == 0:
        return None
    try:
        return json.loads(content[start:end])
    except json.JSONDecodeError as e:
        logger.warning(f"JSON parse failed: {e} | raw: {content[start:end][:200]}")
        return None

def _merge_extracted(state: dict, extracted: dict) -> dict:
    """
    Merge extracted fields into state.
    Rules:
      - Never overwrite an existing non-None value (first capture wins)
      - Exception: is_homeowner — bool False is a valid value, use _field_missing
    """
    for k, v in extracted.items():
        if v is None:
            continue
        if _field_missing(state, k):
            state[k] = v
            logger.debug(f"Extracted field: {k} = {v}")
    return state

def _build_chat_messages(state: dict) -> list:
    """Convert state messages list to LangChain message objects."""
    result = []
    for m in state.get("messages", []):
        role    = m.get("role")
        content = m.get("content", "")
        if role == "user":
            result.append(HumanMessage(content=content))
        elif role == "assistant":
            result.append(AIMessage(content=content))
    return result

def _last_user_message(state: dict) -> str | None:
    """Returns the content of the most recent user message."""
    messages = state.get("messages", [])
    return next(
        (m["content"] for m in reversed(messages) if m.get("role") == "user"),
        None
    )

def _full_transcript(state: dict) -> str:
    """Returns full conversation as plain text for extraction/summary."""
    return "\n".join(
        f"{m['role'].upper()}: {m['content']}"
        for m in state.get("messages", [])
    )

def get_appointment_slots() -> list[str]:
    today = datetime.now()
    return [
        (today + timedelta(days=1)).strftime("%A, %b %d at 10:00 AM"),
        (today + timedelta(days=2)).strftime("%A, %b %d at 2:00 PM"),
        (today + timedelta(days=3)).strftime("%A, %b %d at 9:00 AM"),
    ]