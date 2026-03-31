# tools/booking_tools.py
# Booking-specific logic for appointments and calendar integration.
from __future__ import annotations

import structlog
from datetime import datetime, timezone
from core.config import settings

logger = structlog.get_logger(__name__)

def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()

# NOTE: The full delivery pipeline is in tools/delivery_tools.py.
# This file is for booking-specific operations (e.g., checking availability).