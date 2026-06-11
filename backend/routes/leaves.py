"""Leave management routes."""
from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime, timezone
import uuid

from models.schemas import LeaveApplyInput, LeaveDecisionInput
from services.db import db
from services.auth_service import require_admin, require_super_admin, require_employee

router = APIRouter(prefix="/leaves", tags=["leaves"])

LEAVES_PER_MONTH = 4


async def _leave_balance(employee_id: str) -> dict:
    now = datetime.now(timezone.utc)
    month_str = f"{now.year}-{now.month:02d}"
    leaves_cursor = db.leaves.find({
        "employeeId": employee_id,
        "date": {"$regex": f"^{month_str}"},
        "status": "approved"
    })
    used = 0.0
    async for l in leaves_cursor:
        used += 0.5 if l.get("type") == "half" else 1.0
    return {"used": round(used, 1), "remaining": round(max(0, LEAVES_PER_MONTH - used), 1)}


# === Employee Routes ===

@router.post("")
async def apply_leave(
    payload: LeaveApplyInput,
    user: dict = Depends(require_employee)
):
    """Employee applies for leave (half or full day)."""
    now = datetime.now(timezone.utc)
    balance = await _leave_balance(user["sub"])

    deduct = 0.5 if payload.type == "half" else 1
    if balance["remaining"] < deduct:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough leave balance. Remaining: {balance['remaining']}"
        )

    leave_id = str(uuid.uuid4())
    await db.leaves.insert_one({
        "id": leave_id,
        "employeeId": user["sub"],
        "date": payload.date,
        "type": payload.type,
        "status": "pending",
        "appliedAt": now.isoformat(),
        "approvedAt": None,
        "approvedBy": None,
        "rejectionReason": None,
    })

    # Notification for Admin/Super Admin
    await db.notifications.insert_one({
        "id": str(uuid.uuid4()),
        "type": "leave_applied",
        "employeeId": user["sub"],
        "employeeName": user.get("name", ""),
        "leaveId": leave_id,
        "date": payload.date,
        "read": False,
        "createdAt": now.isoformat(),
    })

    return {"id": leave_id, "status": "pending", "date": payload.date, "type": payload.type}


@router.get("/my")
async def my_leaves(
    user: dict = Depends(require_employee),
    limit: int = Query(30, le=90)
):
    """Employee sees their own leaves."""
    cursor = db.leaves.find({"employeeId": user["sub"]}).sort("date", -1).limit(limit)
    leaves = []
    async for l in cursor:
        leaves.append({
            "id": l.get("id"),
            "date": l.get("date"),
            "type": l.get("type"),
            "status": l.get("status"),
            "appliedAt": l.get("appliedAt"),
            "approvedAt": l.get("approvedAt"),
            "rejectionReason": l.get("rejectionReason"),
        })
    return leaves


@router.get("/balance/my")
async def my_leave_balance(user: dict = Depends(require_employee)):
    """Employee sees their remaining leave balance."""
    return await _leave_balance(user["sub"])


# === Admin Routes ===

@router.get("")
async def list_leaves(
    user: dict = Depends(require_admin),
    status: str = Query(None),
    month: str = Query(None, description="YYYY-MM"),
    limit: int = Query(100, le=300)
):
    """Admin/Super Admin lists all leaves."""
    query = {}
    if status:
        query["status"] = status
    if month:
        query["date"] = {"$regex": f"^{month}"}

    cursor = db.leaves.find(query).sort("date", -1).limit(limit)
    leaves = []
    async for l in cursor:
        emp = await db.users.find_one({"id": l.get("employeeId")})
        leaves.append({
            "id": l.get("id"),
            "employeeId": l.get("employeeId"),
            "employeeName": emp.get("name", "Unknown") if emp else "Unknown",
            "date": l.get("date"),
            "type": l.get("type"),
            "status": l.get("status"),
            "appliedAt": l.get("appliedAt"),
            "approvedAt": l.get("approvedAt"),
            "approvedBy": l.get("approvedBy"),
            "rejectionReason": l.get("rejectionReason"),
        })
    return leaves


@router.get("/balance/{employee_id}")
async def employee_leave_balance(employee_id: str, user: dict = Depends(require_admin)):
    """Admin checks leave balance for any employee."""
    return await _leave_balance(employee_id)


@router.put("/{leave_id}/approve")
async def approve_leave(leave_id: str, user: dict = Depends(require_admin)):
    """Admin/Super Admin approves a leave application."""
    now = datetime.now(timezone.utc).isoformat()
    await db.leaves.update_one(
        {"id": leave_id},
        {"$set": {"status": "approved", "approvedAt": now, "approvedBy": user["sub"]}}
    )

    leave = await db.leaves.find_one({"id": leave_id})
    if leave:
        emp = await db.users.find_one({"id": leave["employeeId"]})
        await db.notifications.insert_one({
            "id": str(uuid.uuid4()),
            "type": "leave_approved",
            "employeeId": leave["employeeId"],
            "leaveId": leave_id,
            "message": f"Your leave on {leave['date']} has been approved.",
            "read": False,
            "createdAt": datetime.now(timezone.utc).isoformat(),
        })

    return {"message": "Leave approved"}


@router.put("/{leave_id}/reject")
async def reject_leave(
    leave_id: str,
    payload: LeaveDecisionInput,
    user: dict = Depends(require_admin)
):
    """Admin/Super Admin rejects a leave application."""
    if not payload.reason:
        raise HTTPException(status_code=400, detail="Rejection reason is required")

    now = datetime.now(timezone.utc).isoformat()
    await db.leaves.update_one(
        {"id": leave_id},
        {"$set": {
            "status": "rejected",
            "approvedAt": now,
            "approvedBy": user["sub"],
            "rejectionReason": payload.reason,
        }}
    )

    leave = await db.leaves.find_one({"id": leave_id})
    if leave:
        await db.notifications.insert_one({
            "id": str(uuid.uuid4()),
            "type": "leave_rejected",
            "employeeId": leave["employeeId"],
            "leaveId": leave_id,
            "message": f"Your leave on {leave['date']} was rejected. Reason: {payload.reason}",
            "read": False,
            "createdAt": datetime.now(timezone.utc).isoformat(),
        })

    return {"message": "Leave rejected"}