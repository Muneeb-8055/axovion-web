"""In-app notifications for EMS."""
from fastapi import APIRouter, Depends
from services.db import db
from services.auth_service import require_employee

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
async def list_notifications(user: dict = Depends(require_employee)):
    """List notifications for the current user (employee or admin)."""
    # For employees: their own notifications
    # For admins/super_admin: all notifications
    role = user.get("role", "employee")

    if role in ("admin", "super_admin"):
        query = {}
    else:
        query = {"employeeId": user["sub"]}

    cursor = db.notifications.find(query).sort("createdAt", -1).limit(50)
    records = []
    async for r in cursor:
        records.append({
            "id": r.get("id"),
            "type": r.get("type"),
            "employeeId": r.get("employeeId"),
            "employeeName": r.get("employeeName"),
            "leaveId": r.get("leaveId"),
            "message": r.get("message"),
            "read": r.get("read", False),
            "createdAt": r.get("createdAt"),
        })
    return records


@router.put("/mark-read")
async def mark_all_read(user: dict = Depends(require_employee)):
    """Mark all notifications as read for the current user."""
    role = user.get("role", "employee")
    if role in ("admin", "super_admin"):
        query = {}
    else:
        query = {"employeeId": user["sub"]}

    await db.notifications.update_many(
        query,
        {"$set": {"read": True}}
    )
    return {"ok": True}


@router.put("/{notif_id}/read")
async def mark_one_read(notif_id: str, user: dict = Depends(require_employee)):
    """Mark a single notification as read."""
    await db.notifications.update_one(
        {"id": notif_id},
        {"$set": {"read": True}}
    )
    return {"ok": True}