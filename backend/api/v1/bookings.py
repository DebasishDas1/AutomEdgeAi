# api/v1/bookings.py
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from models.booking import BookingCreate, BookingResponse
from services import booking_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/", response_model=BookingResponse, status_code=201)
async def create_booking(body: BookingCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await booking_service.create_booking(db, body)
    except Exception as e:
        logger.error(f"create_booking: {e}")
        raise HTTPException(status_code=500, detail="Failed to save booking.")