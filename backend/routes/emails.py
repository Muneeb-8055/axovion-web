"""Email logs + manual send (admin)."""
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
import uuid

from models.schemas import EmailSendInput
from services.db import db
from services.resend_service import send_email
from services.auth_service import require_admin

router = APIRouter(prefix="/emails", tags=["emails"], dependencies=[Depends(require_admin)])


@router.get("")
async def list_email_logs(limit: int = 200, audit_id: str = None):
    query = {}
    if audit_id:
        query["auditId"] = audit_id
    cursor = db.email_logs.find(query, {"_id": 0}).sort("sentAt", -1).limit(limit)
    return await cursor.to_list(limit)


@router.post("/send")
async def send_manual_email(payload: EmailSendInput):
    res = await send_email(payload.to, payload.subject, payload.html)
    await db.email_logs.insert_one({
        "id": str(uuid.uuid4()),
        "auditId": payload.auditId,
        "template": payload.template or "manual",
        "toEmail": payload.to,
        "subject": payload.subject,
        "status": "sent" if res["ok"] else "failed",
        "providerEmailId": res.get("id"),
        "error": res.get("error"),
        "sentAt": datetime.now(timezone.utc).isoformat(),
    })
    return {"ok": res["ok"], "id": res.get("id"), "error": res.get("error")}
