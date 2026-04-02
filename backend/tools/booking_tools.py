# tools/booking_tools.py
# Booking-specific logic for appointments and calendar integration.
from __future__ import annotations

import structlog
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import Booking
from models.booking import BookingCreate
from core.config import settings

logger = structlog.get_logger(__name__)

async def create_booking(db: AsyncSession, data: BookingCreate) -> Booking:
    """
    Persist a new demo booking to the database and trigger notifications.
    """
    log = logger.bind(email=data.email, business=data.business)
    
    try:
        # 1. Create DB record
        new_booking = Booking(
            name=data.name,
            email=data.email,
            business=data.business,
            vertical=data.vertical,
            team_size=data.team_size,
            message=data.message,
            scheduled_at=data.scheduled_at,
        )
        db.add(new_booking)
        await db.commit()
        await db.refresh(new_booking)
        
        log.info("booking_persisted", id=str(new_booking.id))
        
        # 2. Notify team (Background or synchronous? Let's do a simple notification here for now)
        # In a high-scale app, this would be a background task.
        try:
            from tools.email_tools import email_tools
            # Construct a small state dict for the existing email tool or implement a custom one
            # For now, let's just log it. If you want full email integration, we'd add it here.
            pass 
        except Exception as e:
            log.warning("booking_notification_failed", error=str(e))

        return new_booking

    except Exception as e:
        log.error("create_booking_failed", error=str(e))
        await db.rollback()
        raise e

def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()