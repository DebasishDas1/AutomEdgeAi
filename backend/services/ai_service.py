# services/ai_service.py
from __future__ import annotations

import structlog
from typing import Optional

from langchain_core.messages import HumanMessage, SystemMessage

from llm import llm
from workflows.base import full_transcript, parse_json
from workflows.hvac.schema import LeadEnrichment, LeadScore

logger = structlog.get_logger(__name__)

_EXTRACT_SYSTEM = """\
Extract fields from the HVAC message. Return ONLY JSON, no explanation.

{"name":str|null,"email":str|null,"phone":str|null,"issue":str|null,
 "description":str|null,"address":str|null,"urgency":"emergency"|"high"|"normal"|"low"|null,
 "is_homeowner":bool|null}

issue: the HVAC problem type (e.g. "AC not cooling").
description: specific symptom detail (e.g. "stopped cooling completely", "making loud noise").
address: city, zip, or address if mentioned.
urgency: only if user explicitly states urgency. null otherwise.
phone: digits only. email: lowercase. null if not mentioned.
"""

_CLASSIFY_SYSTEM = """\
Classify HVAC conversation. Return ONLY JSON.

{"urgency":"emergency"|"high"|"normal"|"low",
 "intent":"information"|"service_request"|"complaint"|"spam",
 "is_spam":bool,"summary":str}

urgency: emergency=safety risk/system down, high=not working, normal=degraded, low=planning.
summary: 1 professional sentence for CRM.
"""

_SCORE_SYSTEM = """\
Score HVAC lead. Return ONLY JSON.

{"score":"hot"|"warm"|"cold","score_reason":str,
 "next_step":"immediate_dispatch"|"schedule_callback"|"nurture"|"drop"}

hot=urgent+ready, warm=interested, cold=browsing, drop=spam.
"""


class AIService:

    async def extract_fields(self, last_user_message: str) -> dict | None:
        """Extract fields from a single user message."""
        log = logger.bind(service="extract_fields")
        try:
            resp = await llm.ainvoke([
                SystemMessage(content=_EXTRACT_SYSTEM),
                HumanMessage(content=last_user_message),
            ])
            data = parse_json(resp.content)
            if data:
                log.debug("extract_fields_ok", fields=list(data.keys()))
                return data
            log.warning("extract_fields_empty", raw=resp.content[:120])
            return None
        except Exception as exc:
            log.error("extract_fields_failed", error=str(exc))
            return None

    async def classify_conversation(self, messages: list[dict]) -> dict | None:
        """
        Classify urgency/intent/spam from the FULL conversation history.
        Passes full_history=True to bypass the [-6:] trim in LLMManager —
        classification accuracy depends on seeing the entire conversation.
        """
        log = logger.bind(service="classify_conversation")
        transcript = full_transcript({"messages": messages})
        if not transcript.strip():
            return None
        try:
            resp = await llm.ainvoke(
                [
                    SystemMessage(content=_CLASSIFY_SYSTEM),
                    HumanMessage(content=transcript),
                ],
                full_history=True,   # never trim classification calls
            )
            data = parse_json(resp.content)
            if data:
                log.debug("classify_ok",
                    urgency=data.get("urgency"), is_spam=data.get("is_spam"))
                return data
            log.warning("classify_empty", raw=resp.content[:120])
            return None
        except Exception as exc:
            log.error("classify_failed", error=str(exc))
            return None

    async def score_lead(self, enrichment: LeadEnrichment) -> LeadScore:
        """Score lead. Fast-path for spam/emergency, LLM otherwise."""
        log = logger.bind(service="score_lead")

        if enrichment.is_spam:
            return LeadScore(score="cold",
                score_reason="Spam or bot.", next_step="drop")

        if enrichment.urgency == "emergency":
            return LeadScore(score="hot",
                score_reason="Active emergency.", next_step="immediate_dispatch")

        lead_ctx = (
            f"Issue: {enrichment.issue or 'unknown'}\n"
            f"Urgency: {enrichment.urgency}\n"
            f"Intent: {enrichment.intent}\n"
            f"Has name: {enrichment.name is not None}\n"
            f"Has phone: {enrichment.phone is not None}\n"
            f"Has email: {enrichment.email is not None}"
        )
        try:
            resp = await llm.ainvoke([
                SystemMessage(content=_SCORE_SYSTEM),
                HumanMessage(content=lead_ctx),
            ])
            data = parse_json(resp.content)
            if data:
                log.info("score_ok", score=data.get("score"),
                    next_step=data.get("next_step"))
                return LeadScore(
                    score=data.get("score", "warm"),
                    score_reason=data.get("score_reason", "LLM assessment."),
                    next_step=data.get("next_step", "schedule_callback"),
                )
        except Exception as exc:
            log.error("score_failed", error=str(exc))

        return LeadScore(score="warm",
            score_reason="Defaulted to warm.", next_step="schedule_callback")

    async def enrich_lead(self, messages: list[dict]) -> Optional[LeadEnrichment]:
        """Legacy single-pass for other verticals."""
        log = logger.bind(service="enrich_lead_legacy")
        last_user = next(
            (m["content"] for m in reversed(messages) if m.get("role") == "user"), None)
        if not last_user:
            return None
        fields = await self.extract_fields(last_user)
        classification = await self.classify_conversation(messages)
        if not fields and not classification:
            return None
        merged = {**(fields or {}), **(classification or {})}
        try:
            return LeadEnrichment(**merged)
        except Exception as exc:
            log.error("enrich_model_failed", error=str(exc))
            return None


ai_service = AIService()