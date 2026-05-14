"""Booking routes."""
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from typing import List
import uuid

from models.schemas import BookingInput, Booking
from services.db import db
from services.resend_service import send_email, tpl_booking_confirmation
from services.auth_service import require_admin

router = APIRouter(prefix="/booking", tags=["booking"])


@router.post("")
async def create_booking(payload: BookingInput):
    """Public: create a booking/contact request."""
    booking = Booking(**payload.model_dump())
    doc = booking.model_dump()
    doc["createdAt"] = doc["createdAt"].isoformat() if isinstance(doc["createdAt"], datetime) else doc["createdAt"]
    await db.bookings.insert_one(doc)

    # Send confirmation email
    settings = await db.settings.find_one({"id": "global"}, {"_id": 0}) or {}
    if settings.get("autoEmailEnabled", True):
        tpl = tpl_booking_confirmation(name=booking.name)
        res = await send_email(booking.email, tpl["subject"], tpl["html"])
        await db.email_logs.insert_one({
            "id": str(uuid.uuid4()),
            "template": "booking_confirmation",
            "toEmail": booking.email,
            "subject": tpl["subject"],
            "status": "sent" if res["ok"] else "failed",
            "providerEmailId": res.get("id"),
            "error": res.get("error"),
            "sentAt": datetime.now(timezone.utc).isoformat(),
        })

    return {"id": booking.id, "ok": True, "message": "Thanks! We'll be in touch shortly."}


@router.get("s", dependencies=[Depends(require_admin)])
async def list_bookings(limit: int = 200):
    cursor = db.bookings.find({}, {"_id": 0}).sort("createdAt", -1).limit(limit)
    return await cursor.to_list(limit)


@router.put("s/{booking_id}", dependencies=[Depends(require_admin)])
async def update_booking_status(booking_id: str, status: str):
    if status not in ("new", "confirmed", "completed", "cancelled"):
        raise HTTPException(status_code=400, detail="Invalid status")
    res = await db.bookings.update_one({"id": booking_id}, {"$set": {"status": status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"ok": True}


@router.delete("s/{booking_id}", dependencies=[Depends(require_admin)])
async def delete_booking(booking_id: str):
    res = await db.bookings.delete_one({"id": booking_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"ok": True}
