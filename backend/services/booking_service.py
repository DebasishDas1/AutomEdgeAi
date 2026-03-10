# services/booking_service.py
# Demo booking requests from the marketing site.
# Saves to DB and sends internal notification email via Resend.
import logging

import asyncpg

from models.booking import BookingCreate, BookingResponse
from tools.email import email_tool
from core.config import settings

logger = logging.getLogger(__name__)


async def create_booking(db: asyncpg.Connection, data: BookingCreate) -> BookingResponse:
    row = await db.fetchrow(
        """
        INSERT INTO bookings (name, email, phone, company, vertical, message)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        """,
        data.name, data.email, data.phone,
        data.company, data.vertical, data.message,
    )

    # Fire-and-forget internal notification — never let this crash the response
    try:
        await _notify_team(data)
    except Exception as e:
        logger.error(f"booking notification failed: {e}")

    return BookingResponse(
        id         = row["id"],
        name       = row["name"],
        email      = row["email"],
        phone      = row["phone"],
        company    = row["company"],
        vertical   = row["vertical"],
        message    = row["message"],
        created_at = row["created_at"],
    )


async def _notify_team(data: BookingCreate) -> None:
    html = f"""
    <html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h2 style="color:#0D1B2A;">New Demo Request</h2>
        <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#666;">Name</td>
                <td style="padding:6px 0;font-weight:600;">{data.name}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Email</td>
                <td style="padding:6px 0;">{data.email}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Phone</td>
                <td style="padding:6px 0;">{data.phone or "—"}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Company</td>
                <td style="padding:6px 0;">{data.company or "—"}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Vertical</td>
                <td style="padding:6px 0;">{data.vertical or "—"}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Message</td>
                <td style="padding:6px 0;">{data.message or "—"}</td></tr>
        </table>
    </body></html>
    """
    email_tool.send_email(
        to         = settings.TEAM_EMAIL,
        subject    = f"Demo request — {data.name} ({data.company or data.email})",
        html       = html,
        from_name  = "automedge bookings",
    )