"""DB helpers + serialization for MongoDB."""
import os
import certifi
from datetime import datetime, timezone
from typing import Any, Dict
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
# Use TLS for remote (Atlas) connections; skip for local MongoDB
_use_tls = "localhost" not in mongo_url and "127.0.0.1" not in mongo_url
_client = AsyncIOMotorClient(
    mongo_url,
    tls=_use_tls,
    tlsCAFile=certifi.where() if _use_tls else None,
)
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
    await db.users.create_index("id", unique=True)
    await db.audits.create_index("id", unique=True)
    await db.chats.create_index("sessionId")
    await db.tasks.create_index("id", unique=True)
    await db.email_logs.create_index("sentAt")
    await db.call_logs.create_index("id", unique=True)
    await db.bookings.create_index("id", unique=True)
    await db.users.create_index("email", unique=True)
    # EMS indexes
    await db.attendance.create_index("id", unique=True)
    await db.attendance.create_index("employeeId")
    await db.attendance.create_index("clockIn")
    await db.attendance.create_index([("employeeId", 1), ("clockIn", 1)])
    await db.leaves.create_index("id", unique=True)
    await db.leaves.create_index("employeeId")
    await db.leaves.create_index("date")
    await db.overtime.create_index("id", unique=True)
    await db.overtime.create_index("employeeId")
    await db.overtime.create_index("date")
    await db.notifications.create_index("id", unique=True)
    await db.notifications.create_index("employeeId")
    await db.notifications.create_index([("read", 1), ("createdAt", -1)])
    # Seed default super admin user (idempotent)
    from services.auth_service import hash_password
    import uuid as _uuid
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@axovion.io")
    admin_password = os.environ.get("ADMIN_PASSWORD", "AxovionAdmin2025!")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(_uuid.uuid4()),
            "email": admin_email,
            "name": "Axovion Admin",
            "role": "super_admin",
            "passwordHash": hash_password(admin_password),
            "createdAt": datetime.now(timezone.utc).isoformat(),
        })
    elif existing.get("role") != "super_admin":
        # Upgrade existing admin to super_admin on every deploy
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"role": "super_admin"}}
        )
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
            "monthlyTargetHours": 208.0,
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        })
