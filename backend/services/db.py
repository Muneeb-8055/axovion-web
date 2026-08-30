import os
import logging
from datetime import datetime, timezone
from typing import Any, Dict
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from dotenv import load_dotenv

import certifi

logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
db_name = os.environ.get("DB_NAME", "axovion")
_is_real_mongo = False


class DatabaseProxy:
    def __init__(self):
        self._target = None

    def set_target(self, target):
        self._target = target

    def __getattr__(self, name):
        if self._target is None:
            raise RuntimeError("Database not initialized yet.")
        return getattr(self._target, name)

    def __getitem__(self, name):
        if self._target is None:
            raise RuntimeError("Database not initialized yet.")
        return self._target[name]


db = DatabaseProxy()


def _create_motor_client(url: str):
    if "mongodb+srv://" in url or "ssl=true" in url.lower() or "tls=true" in url.lower():
        return AsyncIOMotorClient(url, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=4000)
    return AsyncIOMotorClient(url, serverSelectionTimeoutMS=2000)


try:
    _client = _create_motor_client(mongo_url)
    db.set_target(_client[db_name])
except Exception:
    import mongomock_motor
    _client = mongomock_motor.AsyncMongoMockClient()
    db.set_target(_client[db_name])


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


async def get_db_status() -> Dict[str, Any]:
    """Return diagnostic information about the database connection."""
    global _client, _is_real_mongo, mongo_url, db_name
    
    status_info = {
        "connected": False,
        "mode": "in-memory-mock" if not _is_real_mongo else "real-mongodb",
        "database": db_name,
        "url_masked": mongo_url.split("@")[-1] if "@" in mongo_url else ("localhost" if "localhost" in mongo_url else "configured"),
        "collections": {},
    }
    
    try:
        if isinstance(_client, AsyncIOMotorClient):
            await _client.admin.command("ping")
            status_info["connected"] = True
            status_info["mode"] = "real-mongodb"
        else:
            status_info["connected"] = True
            status_info["mode"] = "in-memory-mock"
            
        status_info["collections"]["users"] = await db.users.count_documents({})
        status_info["collections"]["audits"] = await db.audits.count_documents({})
        status_info["collections"]["chats"] = await db.chats.count_documents({})
        status_info["collections"]["bookings"] = await db.bookings.count_documents({})
    except Exception as e:
        status_info["error"] = str(e)
        status_info["connected"] = False
        
    return status_info


async def init_db():
    """Create indexes + seed defaults."""
    global _client, _is_real_mongo, db
    try:
        if isinstance(_client, AsyncIOMotorClient):
            await _client.admin.command("ping")
            _is_real_mongo = True
            logger.info("Successfully connected to MongoDB at %s", mongo_url)
    except Exception as e:
        _is_real_mongo = False
        logger.warning(
            "MongoDB is not reachable (%s). Falling back to in-memory mock MongoDB storage for local development.",
            e,
        )
        import mongomock_motor
        _client = mongomock_motor.AsyncMongoMockClient()
        db.set_target(_client[db_name])

    try:
        await db.audits.create_index("id", unique=True)
        await db.chats.create_index("sessionId")
        await db.tasks.create_index("id", unique=True)
        await db.email_logs.create_index("sentAt")
        await db.call_logs.create_index("id", unique=True)
        await db.bookings.create_index("id", unique=True)
        await db.users.create_index("email", unique=True)
    except Exception as e:
        logger.warning("Index creation note: %s", e)

    # Seed default admin user (idempotent & updates password hash if changed)
    from services.auth_service import hash_password
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@axovion.io").lower()
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
    else:
        # Ensure password matches env var if updated
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"passwordHash": hash_password(admin_password), "role": "admin"}}
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
            "updatedAt": datetime.now(timezone.utc).isoformat(),
        })
