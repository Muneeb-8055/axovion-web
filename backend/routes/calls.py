"""AI Calling routes (Retell + Vapi)."""
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
import uuid
import os

from models.schemas import CallTriggerInput, CallLog
from services.db import db
from services.call_service import retell_list_agents, retell_create_phone_call, vapi_create_call, health_check
from services.auth_service import require_admin

router = APIRouter(prefix="/calls", tags=["calls"], dependencies=[Depends(require_admin)])


@router.get("")
async def list_call_logs(limit: int = 200):
    cursor = db.call_logs.find({}, {"_id": 0}).sort("scheduledAt", -1).limit(limit)
    return await cursor.to_list(limit)


@router.get("/health")
async def calls_health():
    return await health_check()


@router.get("/agents/retell")
async def list_retell_agents():
    return await retell_list_agents()


@router.post("/trigger")
async def trigger_call(payload: CallTriggerInput):
    """Trigger an outbound call. Creates a CallLog regardless of provider success/failure."""
    audit = await db.audits.find_one({"id": payload.auditId}, {"_id": 0})
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    call_id = str(uuid.uuid4())
    base_log = {
        "id": call_id,
        "auditId": payload.auditId,
        "leadName": audit.get("contactName") or audit.get("businessName", "Lead"),
        "phone": payload.phone,
        "provider": payload.provider,
        "status": "scheduled",
        "outcome": None,
        "recordingUrl": None,
        "transcript": None,
        "providerCallId": None,
        "scheduledAt": datetime.now(timezone.utc).isoformat(),
        "retryCount": 0,
        "error": None,
    }

    # For now: just attempt to authenticate / list agents to confirm provider reachable.
    # Real outbound calling requires a configured agent_id + purchased phone number.
    # We mark as 'scheduled' and store provider response details for the admin to follow up.
    if payload.provider == "retell":
        agents = await retell_list_agents()
        if not agents:
            base_log["status"] = "failed"
            base_log["error"] = "No Retell agents configured. Create one at dashboard.retellai.com first."
        else:
            base_log["error"] = f"Provider reachable. {len(agents)} agent(s) available. To place real calls, complete Retell setup (phone number, agent_id) in /admin/settings."
    elif payload.provider == "vapi":
        h = await health_check()
        if not h.get("vapi"):
            base_log["status"] = "failed"
            base_log["error"] = "Vapi API key invalid or insufficient permissions. Provide a private (server) key in backend .env."

    await db.call_logs.insert_one(base_log)
    return base_log


@router.put("/{call_id}")
async def update_call(call_id: str, status: str, outcome: str = None):
    update = {"status": status}
    if outcome:
        update["outcome"] = outcome
    if status == "completed":
        update["completedAt"] = datetime.now(timezone.utc).isoformat()
    res = await db.call_logs.update_one({"id": call_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Call not found")
    return {"ok": True}


@router.delete("/{call_id}")
async def delete_call(call_id: str):
    res = await db.call_logs.delete_one({"id": call_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Call not found")
    return {"ok": True}
