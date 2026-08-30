"""Axovion.io main FastAPI app."""
from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# Import db init & routes (after env loaded)
from services.db import init_db  # noqa: E402
from routes.audits import router as audits_router  # noqa: E402
from routes.chats import router as chats_router  # noqa: E402
from routes.bookings import router as bookings_router  # noqa: E402
from routes.tasks import router as tasks_router  # noqa: E402
from routes.emails import router as emails_router  # noqa: E402
from routes.calls import router as calls_router  # noqa: E402
from routes.auth import router as auth_router  # noqa: E402
from routes.analytics import router as analytics_router  # noqa: E402
from routes.misc import router as misc_router  # noqa: E402

app = FastAPI(title="Axovion.io API", version="1.0.0")

# Main API router with /api prefix (per Kubernetes ingress)
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"app": "Axovion.io", "status": "ok", "version": "1.0.0"}


@api_router.get("/health")
async def health():
    return {"status": "healthy"}


# Mount feature routers
api_router.include_router(audits_router)
api_router.include_router(chats_router)
api_router.include_router(bookings_router)
api_router.include_router(tasks_router)
api_router.include_router(emails_router)
api_router.include_router(calls_router)
api_router.include_router(auth_router)
api_router.include_router(analytics_router)
api_router.include_router(misc_router)

# Mount main router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def on_startup():
    try:
        await init_db()
        logger.info("DB initialized successfully")
    except Exception as e:
        logger.exception(f"DB init failed: {e}")


@app.on_event("shutdown")
async def on_shutdown():
    from services.db import _client
    _client.close()
