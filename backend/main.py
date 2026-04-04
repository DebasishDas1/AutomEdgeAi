# main.py
from fastapi import FastAPI
from api.router import router
from core.config import settings
from core.logging import configure_logging
from core.lifespan import lifespan
from core.middleware import setup_middleware
from core.exceptions import (
    AutomedgeException,
    automedge_exception_handler,
    generic_exception_handler,
)

# 1. Initialize logging singleton before app factory
configure_logging()

# 2. App factory
app = FastAPI(
    title="Automedge AI Backend",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.is_dev else None,
    redoc_url="/redoc" if settings.is_dev else None,
)

# 3. Middleware & Exceptions
setup_middleware(app)
app.add_exception_handler(AutomedgeException, automedge_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# 4. Global Routes
app.include_router(router, prefix="/api")

@app.api_route("/health", methods=["GET", "HEAD"])
async def health():
    """Liveness probe. Returns 200 as long as the process is alive."""
    return {"status": "ok", "service": "automedge-backend"}