from fastapi import APIRouter
from api.v1 import leads, workflow, bookings
from api.v1.chat import router as chat_router

router = APIRouter()

# router.include_router(health.router,   prefix="/health",   tags=["health"])
router.include_router(leads.router,    prefix="/leads",    tags=["leads"])
router.include_router(workflow.router, prefix="/workflow",  tags=["workflow"])
router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])

router.include_router(chat_router)

# ── Full endpoint map ──────────────────────────────────────────────────────────
#
# HEALTH
#   GET   /api/v1/health/
#
# CHAT — HVAC
#   POST  /api/v1/chat/hvac/start
#   POST  /api/v1/chat/hvac/message
#
# CHAT — PEST CONTROL
#   POST  /api/v1/chat/pest-control/start
#   POST  /api/v1/chat/pest-control/message
#
# CHAT — PLUMBING
#   POST  /api/v1/chat/plumbing/start
#   POST  /api/v1/chat/plumbing/message
#
# CHAT — ROOFING
#   POST  /api/v1/chat/roofing/start
#   POST  /api/v1/chat/roofing/message
#
# LEADS
#   POST  /api/v1/leads/
#   GET   /api/v1/leads/
#   PATCH /api/v1/leads/{id}
#
# WORKFLOW
#   POST  /api/v1/workflow/start
#   GET   /api/v1/workflow/stream/{id}
#
# BOOKINGS
#   POST  /api/v1/bookings/