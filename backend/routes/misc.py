"""Newsletter + settings routes."""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from models.schemas import NewsletterInput
from services.db import db
from services.resend_service import send_email, tpl_newsletter_welcome
from services.auth_service import require_admin

router = APIRouter(tags=["misc"])


@router.post("/newsletter")
async def newsletter_signup(payload: NewsletterInput):
    """Public newsletter signup."""
    existing = await db.newsletter.find_one({"email": payload.email.lower()})
    if existing:
        return {"ok": True, "already_subscribed": True}
    await db.newsletter.insert_one({
        "id": str(uuid.uuid4()),
        "email": payload.email.lower(),
        "source": payload.source,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    })
    tpl = tpl_newsletter_welcome()
    res = await send_email(payload.email, tpl["subject"], tpl["html"])
    await db.email_logs.insert_one({
        "id": str(uuid.uuid4()),
        "template": "newsletter_welcome",
        "toEmail": payload.email,
        "subject": tpl["subject"],
        "status": "sent" if res["ok"] else "failed",
        "providerEmailId": res.get("id"),
        "error": res.get("error"),
        "sentAt": datetime.now(timezone.utc).isoformat(),
    })
    return {"ok": True}


@router.get("/settings")
async def get_settings_public():
    """Public-safe settings (no secrets)."""
    s = await db.settings.find_one({"id": "global"}, {"_id": 0}) or {}
    return {
        "businessName": s.get("businessName", "Axovion.io"),
        "contactEmail": s.get("contactEmail", "hello@axovion.io"),
        "whatsapp": s.get("whatsapp", ""),
        "calendlyLink": s.get("calendlyLink", "https://calendly.com/axovion/30min"),
    }


@router.get("/settings/admin", dependencies=[Depends(require_admin)])
async def get_settings_admin():
    s = await db.settings.find_one({"id": "global"}, {"_id": 0}) or {}
    return s


@router.put("/settings/admin", dependencies=[Depends(require_admin)])
async def update_settings(payload: dict):
    payload["updatedAt"] = datetime.now(timezone.utc).isoformat()
    payload["id"] = "global"
    await db.settings.update_one({"id": "global"}, {"$set": payload}, upsert=True)
    s = await db.settings.find_one({"id": "global"}, {"_id": 0})
    return s


@router.get("/newsletter/list", dependencies=[Depends(require_admin)])
async def list_newsletter(limit: int = 500):
    cursor = db.newsletter.find({}, {"_id": 0}).sort("createdAt", -1).limit(limit)
    return await cursor.to_list(limit)
