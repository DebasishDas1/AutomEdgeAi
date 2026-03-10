# api/v1/chat/__init__.py
# Mounts all 4 vertical routers under a single parent router.
# Imported by api/router.py as: from api.v1 import chat
#
# Final URL structure:
#   POST /api/v1/chat/hvac/start
#   POST /api/v1/chat/hvac/message
#   POST /api/v1/chat/pest-control/start
#   POST /api/v1/chat/pest-control/message
#   POST /api/v1/chat/plumbing/start
#   POST /api/v1/chat/plumbing/message
#   POST /api/v1/chat/roofing/start
#   POST /api/v1/chat/roofing/message
from fastapi import APIRouter

from api.v1.chat import hvac, pest_control, plumbing, roofing

router = APIRouter()

router.include_router(hvac.router,         prefix="/hvac",         tags=["chat • hvac"])
router.include_router(pest_control.router, prefix="/pest-control", tags=["chat • pest-control"])
router.include_router(plumbing.router,     prefix="/plumbing",     tags=["chat • plumbing"])
router.include_router(roofing.router,      prefix="/roofing",      tags=["chat • roofing"])