"""Overtime management routes."""
from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime, timezone
import uuid

from models.schemas import OvertimeLogInput
from services.db import db
from services.auth_service import require_admin, require_super_admin, require_employee

router = APIRouter(prefix="/overtime", tags=["overtime"])


@router.post("")
async def log_overtime(
    payload: OvertimeLogInput,
    user: dict = Depends(require_admin)
):
    """Admin logs overtime for an employee. Reason and project are mandatory."""
    if not payload.reason or not payload.project:
        raise HTTPException(status_code=400, detail="Reason and project are required")

    now = datetime.now(timezone.utc)
    ot_id = str(uuid.uuid4())
    await db.overtime.insert_one({
        "id": ot_id,
        "employeeId": payload.employeeId,
        "date": payload.date,
        "hours": payload.hours,
        "reason": payload.reason,
        "project": payload.project,
        "approvedBy": user["sub"],
        "status": "approved",
        "createdAt": now.isoformat(),
    })

    # Notify employee
    await db.notifications.insert_one({
        "id": str(uuid.uuid4()),
        "type": "ot_approved",
        "employeeId": payload.employeeId,
        "otId": ot_id,
        "message": f"Overtime of {payload.hours}hrs approved for {payload.project}.",
        "read": False,
        "createdAt": now.isoformat(),
    })

    return {"id": ot_id, "message": "Overtime logged"}


@router.get("")
async def list_overtime(
    user: dict = Depends(require_admin),
    month: str = Query(None, description="YYYY-MM"),
    employee_id: str = Query(None),
    limit: int = Query(100, le=300)
):
    """Admin/Super Admin lists all overtime records."""
    query = {}
    if month:
        query["date"] = {"$regex": f"^{month}"}
    if employee_id:
        query["employeeId"] = employee_id

    cursor = db.overtime.find(query).sort("date", -1).limit(limit)
    records = []
    async for r in cursor:
        emp = await db.users.find_one({"id": r.get("employeeId")})
        records.append({
            "id": r.get("id"),
            "employeeId": r.get("employeeId"),
            "employeeName": emp.get("name", "Unknown") if emp else "Unknown",
            "date": r.get("date"),
            "hours": r.get("hours"),
            "reason": r.get("reason"),
            "project": r.get("project"),
            "approvedBy": r.get("approvedBy"),
            "status": r.get("status"),
        })
    return records


@router.get("/my")
async def my_overtime(
    user: dict = Depends(require_employee),
    limit: int = Query(30, le=90)
):
    """Employee sees their own overtime records."""
    cursor = db.overtime.find(
        {"employeeId": user["sub"], "status": "approved"}
    ).sort("date", -1).limit(limit)
    records = []
    async for r in cursor:
        records.append({
            "id": r.get("id"),
            "date": r.get("date"),
            "hours": r.get("hours"),
            "reason": r.get("reason"),
            "project": r.get("project"),
        })
    return records


@router.get("/{employee_id}")
async def employee_overtime(
    employee_id: str,
    user: dict = Depends(require_admin),
    limit: int = Query(30, le=90)
):
    """Admin sees overtime for a specific employee."""
    cursor = db.overtime.find(
        {"employeeId": employee_id, "status": "approved"}
    ).sort("date", -1).limit(limit)
    records = []
    async for r in cursor:
        records.append({
            "id": r.get("id"),
            "date": r.get("date"),
            "hours": r.get("hours"),
            "reason": r.get("reason"),
            "project": r.get("project"),
        })
    return records