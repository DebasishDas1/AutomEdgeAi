from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.router import router
from core.config import settings
from core.database import init_db, engine
from core.firebase import init_firebase
from core.exceptions import AutomedgeException, automedge_exception_handler, generic_exception_handler
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="automedge API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting automedge API...")

    try:
        await init_db()
        logger.info("Database initialized.")
    except Exception as e:
        logger.warning(f"Database initialization failed: {e}")

    try:
        init_firebase()
        logger.info("Firebase initialized.")
    except Exception as e:
        logger.error(f"Firebase failed: {e}")



@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down automedge API...")
    await engine.dispose()

# Exception Handlers
app.add_exception_handler(AutomedgeException, automedge_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)


app.include_router(router, prefix="/api/v1")