# api/deps.py
# get_db is already defined in core/database.py — re-export here for import consistency.
from core.database import get_db

__all__ = ["get_db"]