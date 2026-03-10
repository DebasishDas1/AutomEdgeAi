import logging
from dataclasses import dataclass
from typing import List

from groq import Groq
from langchain_ollama import ChatOllama
from langchain_core.messages import BaseMessage

from core.config import settings

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────
# Response wrapper
# ─────────────────────────────────────────────────────────────

@dataclass
class LLMResponse:
    content: str


# ─────────────────────────────────────────────────────────────
# Convert LangChain → Groq message format
# ─────────────────────────────────────────────────────────────

def _to_openai_messages(messages: List[BaseMessage]) -> List[dict]:
    role_map = {
        "system": "system",
        "human": "user",
        "ai": "assistant",
        "assistant": "assistant",
    }

    result = []

    for m in messages:
        msg_type = m.__class__.__name__.lower().replace("message", "")
        role = role_map.get(msg_type, "user")

        result.append({
            "role": role,
            "content": m.content
        })

    return result


# ─────────────────────────────────────────────────────────────
# Groq (production)
# ─────────────────────────────────────────────────────────────

def _call_groq(messages, max_tokens, temperature) -> LLMResponse:

    client = Groq(api_key=settings.GROQ_API_KEY)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=max_tokens,
        temperature=temperature,
    )

    content = response.choices[0].message.content or ""

    return LLMResponse(content=content)


# ─────────────────────────────────────────────────────────────
# Ollama (local)
# ─────────────────────────────────────────────────────────────

ollama_model = ChatOllama(
    model="qwen3:1.7b",
    temperature=0.7,
)


def _call_ollama(messages: List[BaseMessage]) -> LLMResponse:

    response = ollama_model.invoke(messages)

    content = response.content if response else ""

    logger.debug(f"Ollama response → {len(content)} chars")

    return LLMResponse(content=content)


# ─────────────────────────────────────────────────────────────
# LLM Router
# ─────────────────────────────────────────────────────────────

class LLM:

    def __init__(self):

        # self.use_groq = bool(settings.GROQ_API_KEY)
        self.use_groq = False

        if self.use_groq:
            logger.info("LLM provider: Groq")
        else:
            logger.info("LLM provider: Ollama")

    def invoke(
        self,
        messages: List[BaseMessage],
        max_tokens: int = 500,
        temperature: float = 0.7,
    ) -> LLMResponse:

        if self.use_groq:

            openai_messages = _to_openai_messages(messages)

            return _call_groq(
                openai_messages,
                max_tokens,
                temperature,
            )

        return _call_ollama(messages)


# ─────────────────────────────────────────────────────────────
# Global instance
# ─────────────────────────────────────────────────────────────

llm = LLM()