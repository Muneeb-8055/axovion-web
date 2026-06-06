"""DB helpers + serialization for MongoDB."""
import os
from datetime import datetime, timezone
from typing import Any, Dict
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
import certifi
_client = AsyncIOMotorClient(mongo_url, tls=True, tlsCAFile=certifi.where())
db = _client[os.environ["DB_NAME"]]


def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Recursively convert datetimes to ISO strings for JSON-safe MongoDB storage."""
    if doc is None:
        return None
    if isinstance(doc, dict):
        out = {}
        for k, v in doc.items():
            if k == "_id":
                continue
            out[k] = serialize_doc(v)
        return out
    if isinstance(doc, list):
        return [serialize_doc(x) for x in doc]
    if isinstance(doc, datetime):
        return doc.isoformat()
    return doc


def deserialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert ISO date strings back to datetime objects where keys look date-like."""
    if doc is None:
        return None
    if isinstance(doc, dict):
        out = {}
        for k, v in doc.items():
            if k == "_id":
                continue
            if isinstance(v, str) and k.lower().endswith("at") and len(v) >= 19:
                try:
                    out[k] = datetime.fromisoformat(v)
                    continue
                except Exception:
                    pass
            out[k] = deserialize_doc(v)
        return out
    if isinstance(doc, list):
        return [deserialize_doc(x) for x in doc]
    return doc


async def init_db():
    """Create indexes + seed defaults."""
    await db.audits.create_index("id", unique=True)
    await db.chats.create_index("sessionId")
    await db.tasks.create_index("id", unique=True)
    await db.email_logs.create_index("sentAt")
    await db.call_logs.create_index("id", unique=True)
    await db.bookings.create_index("id", unique=True)
    await db.users.create_index("email", unique=True)

    # Seed default admin user (idempotent)
    from services.auth_service import hash_password
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@axovion.io")
    admin_password = os.environ.get("ADMIN_PASSWORD", "AxovionAdmin2025!")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        import uuid as _uuid
        await db.users.insert_one({
            "id": str(_uuid.uuid4()),
            "email": admin_email,
            "name": "Axovion Admin",
            "role": "admin",
            "passwordHash": hash_password(admin_password),
            "createdAt": datetime.now(timezone.utc).isoformat(),
        })

    # Seed settings
    existing_settings = await db.settings.find_one({"id": "global"})
    if not existing_settings:
        await db.settings.insert_one({
            "id": "global",
            "businessName": "Axovion.io",
            "contactEmail": "hello@axovion.io",
            "whatsapp": "",
            "calendlyLink": "https://calendly.com/axovion/30min",
            "emailFromName": os.environ.get("RESEND_FROM_NAME", "Axovion AI"),
            "emailFromAddress": os.environ.get("RESEND_FROM_EMAIL", "onboarding@resend.dev"),
            "highValueRevenueUsd": int(os.environ.get("HIGH_VALUE_REVENUE_USD", 50000)),
            "highValueBudgetUsd": int(os.environ.get("HIGH_VALUE_BUDGET_USD", 5000)),
            "autoCallEnabled": False,
            "autoEmailEnabled": True,
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        })
