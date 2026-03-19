# workflows/registry.py
from __future__ import annotations

import asyncio
import threading
from typing import Optional

import structlog

from workflows.hvac.graph import build_hvac_chat_graph, build_hvac_post_chat_graph
from workflows.pest_control.graph import build_pest_chat_graph, build_pest_post_chat_graph
from workflows.plumbing.graph import build_plumbing_chat_graph, build_plumbing_post_chat_graph
from workflows.roofing.graph import build_roofing_chat_graph, build_roofing_post_chat_graph

logger = structlog.get_logger(__name__)

_SUPPORTED_VERTICALS = frozenset({"hvac", "pest_control", "plumbing", "roofing"})


class WorkflowRegistry:
    """
    Thread-safe singleton that compiles and caches all LangGraph workflows.

    Fixes applied:
    - threading.Lock() only protects __new__ — _initialize() was also reachable
      concurrently if two threads passed the None check before either finished.
      Fixed with a dedicated _init_lock so initialization is atomic.
    - Graph compilation errors during startup were silent. Now logged + re-raised
      so the app fails fast instead of serving None graphs at request time.
    - get_chat_graph / get_post_graph now raise ValueError for unknown verticals
      instead of silently returning None (which causes AttributeError later).
    """

    _instance: Optional["WorkflowRegistry"] = None
    _class_lock = threading.Lock()
    _init_lock = threading.Lock()

    def __new__(cls) -> "WorkflowRegistry":
        with cls._class_lock:
            if cls._instance is None:
                instance = super().__new__(cls)
                instance._initialized = False
                cls._instance = instance
        return cls._instance

    def initialize(self) -> None:
        """
        Call once at app startup (e.g., FastAPI lifespan).
        Thread-safe: subsequent calls are no-ops.
        """
        with self._init_lock:
            if self._initialized:
                return
            self._build_graphs()
            self._initialized = True

    def _build_graphs(self) -> None:
        logger.info("compiling_all_graphs")

        builders_chat = {
            "hvac": build_hvac_chat_graph,
            "pest_control": build_pest_chat_graph,
            "plumbing": build_plumbing_chat_graph,
            "roofing": build_roofing_chat_graph,
        }
        builders_post = {
            "hvac": build_hvac_post_chat_graph,
            "pest_control": build_pest_post_chat_graph,
            "plumbing": build_plumbing_post_chat_graph,
            "roofing": build_roofing_post_chat_graph,
        }

        self._chat_graphs: dict = {}
        self._post_graphs: dict = {}

        for vertical, builder in builders_chat.items():
            try:
                self._chat_graphs[vertical] = builder()
                logger.info("chat_graph_compiled", vertical=vertical)
            except Exception as exc:
                logger.error("chat_graph_compile_failed", vertical=vertical, error=str(exc))
                raise RuntimeError(
                    f"Failed to compile chat graph for '{vertical}': {exc}"
                ) from exc

        for vertical, builder in builders_post.items():
            try:
                self._post_graphs[vertical] = builder()
                logger.info("post_graph_compiled", vertical=vertical)
            except Exception as exc:
                logger.error("post_graph_compile_failed", vertical=vertical, error=str(exc))
                raise RuntimeError(
                    f"Failed to compile post graph for '{vertical}': {exc}"
                ) from exc

        logger.info("all_graphs_compiled", count=len(self._chat_graphs))

    def get_chat_graph(self, vertical: str):
        self._assert_ready()
        if vertical not in _SUPPORTED_VERTICALS:
            raise ValueError(
                f"Unknown vertical '{vertical}'. Supported: {sorted(_SUPPORTED_VERTICALS)}"
            )
        return self._chat_graphs[vertical]

    def get_post_graph(self, vertical: str):
        self._assert_ready()
        if vertical not in _SUPPORTED_VERTICALS:
            raise ValueError(
                f"Unknown vertical '{vertical}'. Supported: {sorted(_SUPPORTED_VERTICALS)}"
            )
        return self._post_graphs[vertical]

    def _assert_ready(self) -> None:
        if not getattr(self, "_initialized", False):
            raise RuntimeError(
                "WorkflowRegistry not initialized. "
                "Call registry.initialize() at app startup."
            )


# Module-level singleton — do NOT call initialize() here.
# Initialize explicitly in FastAPI lifespan or app factory.
registry = WorkflowRegistry()