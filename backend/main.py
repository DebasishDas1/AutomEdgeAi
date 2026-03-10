# main.py
# uvicorn main:app --reload --port 8000
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.database import init_db
from api.router import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title       = "automedge API",
    version     = "0.1.0",
    description = "Lead management + AI chat for HVAC, Pest Control, Plumbing, Roofing",
    lifespan    = lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins     = settings.ALLOWED_ORIGINS,
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

app.include_router(router, prefix="/api/v1")


@app.get("/healthz", tags=["health"])
async def health():
    return {"status": "ok"}