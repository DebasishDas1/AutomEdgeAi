# api/router.py
from fastapi import APIRouter, Depends
from core.auth import verify_firebase_token
from api.v1.chat import router as chat_router
from api.v1.bookings import router as bookings_router
from api.v1.leads import router as leads_router
from api.v1.retell import router as retell_router

router = APIRouter()

# High-performance chat workflow (consolidated strategy)
router.include_router(chat_router, prefix="/v1/chat")
router.include_router(bookings_router, prefix="/v1/bookings", tags=["Bookings"])
router.include_router(leads_router, prefix="/v1/leads", tags=["Leads"], dependencies=[Depends(verify_firebase_token)])
router.include_router(retell_router, prefix="/v1/retell", tags=["Retell"])