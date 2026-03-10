# api/v1/bookings.py
# Demo booking endpoint — marketing site "Book a Demo" form.
# NOT the same as service appointments (those are booked inside chat sessions).
#
# POST /bookings/  — save request + notify team via email
import logging

from fastapi import APIRouter, Depends, HTTPException, status

from api.deps import get_db
from models.booking import BookingCreate, BookingResponse
from services import booking_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Book a demo",
    description=(
        "Saves a demo request from the marketing site and notifies the team. "
        "Used by the Book a Demo form on automedge.com."
    ),
)
async def create_booking(
    body: BookingCreate,
    db   = Depends(get_db),
) -> BookingResponse:
    try:
        return await booking_service.create_booking(db, body)
    except Exception as e:
        logger.error(f"create_booking failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save booking request.",
        )