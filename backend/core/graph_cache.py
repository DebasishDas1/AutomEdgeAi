# core/graph_cache.py
"""
Workflow graph caching to avoid registry lookups for every request.
Graphs are immutable, so we can cache them indefinitely per process.
"""

import structlog
from typing import Dict, Optional
from workflows.registry import registry

logger = structlog.get_logger(__name__)

Vertical = str


class GraphCache:
    """Process-level cache for immutable workflow graphs."""
    
    def __init__(self):
        self._graphs: Dict[Vertical, object] = {}
    
    def get(self, vertical: Vertical):
        """Get cached graph or fetch from registry."""
        if vertical not in self._graphs:
            try:
                self._graphs[vertical] = registry.get_chat_graph(vertical)
                logger.debug("graph_cached", vertical=vertical)
            except Exception as exc:
                logger.error("graph_cache_failed", vertical=vertical, error=str(exc))
                raise
        return self._graphs[vertical]
    
    def clear(self):
        """Clear cache (for testing)."""
        self._graphs.clear()


# Global instance
graph_cache = GraphCache()
