# services/booking_service.py
# SQLAlchemy AsyncSession — matches Booking ORM model in database.py exactly.
# Columns: name, email, business, vertical, team_size
import logging

from sqlalchemy.ext.asyncio import AsyncSession

from core.database import Booking
from core.config import settings
from models.booking import BookingCreate, BookingResponse
from tools.email import email_tool

logger = logging.getLogger(__name__)


async def create_booking(db: AsyncSession, data: BookingCreate) -> BookingResponse:
    row = Booking(
        name      = data.name,
        email     = data.email,
        business  = data.business,
        vertical  = data.vertical,
        team_size = data.team_size,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)

    try:
        _notify_team(data)
    except Exception as e:
        logger.error(f"booking notification failed: {e}")

    return BookingResponse.model_validate(row)


def _notify_team(data: BookingCreate) -> None:
    html = f"""
    <html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h2 style="color:#0D1B2A;">New Demo Request</h2>
        <table>
            <tr><td style="color:#666;padding:4px 8px 4px 0;">Name</td>
                <td><strong>{data.name}</strong></td></tr>
            <tr><td style="color:#666;padding:4px 8px 4px 0;">Email</td>
                <td>{data.email}</td></tr>
            <tr><td style="color:#666;padding:4px 8px 4px 0;">Business</td>
                <td>{data.business}</td></tr>
            <tr><td style="color:#666;padding:4px 8px 4px 0;">Vertical</td>
                <td>{data.vertical}</td></tr>
            <tr><td style="color:#666;padding:4px 8px 4px 0;">Team Size</td>
                <td>{data.team_size or "—"}</td></tr>
        </table>
    </body></html>
    """
    email_tool.send_email(
        to        = settings.TEAM_EMAIL,
        subject   = f"Demo request — {data.name} ({data.business})",
        html      = html,
        from_name = "automedge bookings",
    )