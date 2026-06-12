"""Attendance management routes."""
from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime, timezone, timedelta
import uuid
from dateutil import parser as dateparser

from models.schemas import AttendanceVerifyInput, AttendanceCorrectInput
from services.db import db
from services.auth_service import require_admin, require_super_admin, require_employee

DEFAULT_TARGET_HOURS = 208


async def _get_target_hours() -> float:
    """Fetch the configured monthly target hours from settings."""
    s = await db.settings.find_one({"id": "global"})
    if s and s.get("monthlyTargetHours"):
        return float(s["monthlyTargetHours"])
    return float(DEFAULT_TARGET_HOURS)

router = APIRouter(prefix="/attendance", tags=["attendance"])


def _parse_dt(s: str) -> datetime:
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid datetime: {s}")


def _compute_hours(clock_in: datetime, clock_out: datetime) -> float:
    delta = clock_out - clock_in
    return round(delta.total_seconds() / 3600, 2)


# === Employee Routes ===

@router.post("/clock-in")
async def clock_in(user: dict = Depends(require_employee)):
    """Employee clocks in. Returns active record id."""
    user_id = user["sub"]

    # Check if already clocked in
    active = await db.attendance.find_one({
        "employeeId": user_id,
        "clockOut": None
    })
    if active:
        raise HTTPException(status_code=409, detail="Already clocked in. Please clock out first.")

    now = datetime.now(timezone.utc)
    record_id = str(uuid.uuid4())
    await db.attendance.insert_one({
        "id": record_id,
        "employeeId": user_id,
        "clockIn": now.isoformat(),
        "clockOut": None,
        "totalHours": 0,
        "isVerified": False,
        "verifiedBy": None,
        "verifiedAt": None,
        "isCorrection": False,
        "correctionReason": None,
        "createdAt": now.isoformat(),
        "updatedAt": now.isoformat(),
    })

    return {"recordId": record_id, "clockIn": now.isoformat(), "message": "Clocked in successfully"}


@router.post("/clock-out")
async def clock_out(user: dict = Depends(require_employee)):
    """Employee clocks out. Computes total hours."""
    user_id = user["sub"]

    active = await db.attendance.find_one({
        "employeeId": user_id,
        "clockOut": None
    })
    if not active:
        raise HTTPException(status_code=400, detail="Not clocked in.")

    now = datetime.now(timezone.utc)
    clock_in_dt = _parse_dt(active["clockIn"])
    total_hours = _compute_hours(clock_in_dt, now)

    await db.attendance.update_one(
        {"id": active["id"]},
        {"$set": {
            "clockOut": now.isoformat(),
            "totalHours": total_hours,
            "updatedAt": now.isoformat(),
        }}
    )

    return {
        "recordId": active["id"],
        "clockIn": active["clockIn"],
        "clockOut": now.isoformat(),
        "totalHours": total_hours,
        "message": "Clocked out successfully"
    }


@router.get("/my")
async def my_attendance(
    user: dict = Depends(require_employee),
    limit: int = Query(30, le=90)
):
    """Employee sees their own attendance records."""
    cursor = db.attendance.find(
        {"employeeId": user["sub"]}
    ).sort("clockIn", -1).limit(limit)
    records = []
    async for r in cursor:
        records.append({
            "id": r.get("id"),
            "clockIn": r.get("clockIn"),
            "clockOut": r.get("clockOut"),
            "totalHours": r.get("totalHours", 0),
            "isVerified": r.get("isVerified", False),
        })
    return records


@router.get("/my/summary")
async def my_summary(user: dict = Depends(require_employee)):
    """Employee's monthly hours summary."""
    now = datetime.now(timezone.utc)
    year, month = now.year, now.month
    month_str = f"{year}-{month:02d}"
    user_id = user["sub"]

    att_cursor = db.attendance.find({
        "employeeId": user_id,
        "isVerified": True,
        "clockIn": {"$regex": f"^{month_str}"}
    })
    total_hours = 0.0
    async for r in att_cursor:
        total_hours += r.get("totalHours", 0)

    ot_cursor = db.overtime.find({
        "employeeId": user_id,
        "status": "approved",
        "date": {"$regex": f"^{month_str}"}
    })
    total_ot = 0.0
    async for r in ot_cursor:
        total_ot += r.get("hours", 0)

    # Leave balance
    from routes.leaves import _leave_balance
    leave_bal = await _leave_balance(user_id)
    target_hours = await _get_target_hours()

    return {
        "currentMonth": month_str,
        "completedHours": round(total_hours, 2),
        "targetHours": target_hours,
        "remainingHours": round(max(0, target_hours - total_hours), 2),
        "overtimeHours": round(total_ot, 2),
        "leave_balance": leave_bal.get("remaining", 4),
        "leaves_used": leave_bal.get("used", 0),
    }


# === Admin Routes ===

@router.get("")
async def list_attendance(
    user: dict = Depends(require_admin),
    date: str = Query(None, description="YYYY-MM-DD"),
    employee_id: str = Query(None),
    verified: bool = Query(None),
    limit: int = Query(100, le=300)
):
    """Admin/Super Admin lists attendance records."""
    query = {}
    if date:
        query["clockIn"] = {"$regex": f"^{date}"}
    if employee_id:
        query["employeeId"] = employee_id
    if verified is not None:
        query["isVerified"] = verified

    cursor = db.attendance.find(query).sort("clockIn", -1).limit(limit)
    records = []
    async for r in cursor:
        emp = await db.users.find_one({"id": r.get("employeeId")})
        records.append({
            "id": r.get("id"),
            "employeeId": r.get("employeeId"),
            "employeeName": emp.get("name", "Unknown") if emp else "Unknown",
            "clockIn": r.get("clockIn"),
            "clockOut": r.get("clockOut"),
            "totalHours": r.get("totalHours", 0),
            "isVerified": r.get("isVerified", False),
            "verifiedBy": r.get("verifiedBy"),
            "verifiedAt": r.get("verifiedAt"),
            "isCorrection": r.get("isCorrection", False),
        })
    return records


@router.get("/pending")
async def pending_verification(user: dict = Depends(require_admin)):
    """Admin/Super Admin sees unverified attendance records."""
    cursor = db.attendance.find({"isVerified": False}).sort("clockIn", -1).limit(100)
    records = []
    async for r in cursor:
        emp = await db.users.find_one({"id": r.get("employeeId")})
        records.append({
            "id": r.get("id"),
            "employeeId": r.get("employeeId"),
            "employeeName": emp.get("name", "Unknown") if emp else "Unknown",
            "clockIn": r.get("clockIn"),
            "clockOut": r.get("clockOut"),
            "totalHours": r.get("totalHours", 0),
        })
    return records


@router.post("/verify")
async def verify_attendance(
    payload: AttendanceVerifyInput,
    user: dict = Depends(require_admin)
):
    """Admin/Super Admin bulk verifies attendance for a date (optionally per employee)."""
    query = {"isVerified": False, "clockIn": {"$regex": f"^{payload.date}"}}
    if payload.employeeId:
        query["employeeId"] = payload.employeeId

    now = datetime.now(timezone.utc).isoformat()
    result = await db.attendance.update_many(
        query,
        {"$set": {
            "isVerified": True,
            "verifiedBy": user["sub"],
            "verifiedAt": now,
        }}
    )
    return {"message": f"Verified {result.modified_count} record(s)"}


@router.post("/correct")
async def request_correction(
    payload: AttendanceCorrectInput,
    user: dict = Depends(require_employee)
):
    """Employee requests a clock-in/out correction with reason."""
    now = datetime.now(timezone.utc)
    clock_in_dt = _parse_dt(payload.clockIn)
    clock_out_dt = _parse_dt(payload.clockOut)
    total_hours = _compute_hours(clock_in_dt, clock_out_dt)

    # Find the open record for this user today
    active = await db.attendance.find_one({
        "employeeId": user["sub"],
        "clockOut": None
    })

    if active:
        record_id = active["id"]
    else:
        # Create a correction record
        record_id = str(uuid.uuid4())
        await db.attendance.insert_one({
            "id": record_id,
            "employeeId": user["sub"],
            "clockIn": payload.clockIn,
            "totalHours": 0,
            "isVerified": False,
            "createdAt": now.isoformat(),
        })

    await db.attendance.update_one(
        {"id": record_id},
        {"$set": {
            "clockIn": payload.clockIn,
            "clockOut": payload.clockOut,
            "totalHours": total_hours,
            "isCorrection": True,
            "correctionReason": payload.reason,
            "updatedAt": now.isoformat(),
        }}
    )
    return {"message": "Correction requested", "recordId": record_id}


@router.put("/correct/{record_id}/approve")
async def approve_correction(
    record_id: str,
    user: dict = Depends(require_admin)
):
    """Admin/Super Admin approves a correction and marks it verified."""
    now = datetime.now(timezone.utc).isoformat()
    await db.attendance.update_one(
        {"id": record_id},
        {"$set": {
            "isVerified": True,
            "verifiedBy": user["sub"],
            "verifiedAt": now,
            "updatedAt": now,
        }}
    )
    return {"message": "Correction approved and verified"}


@router.get("/summary/{employee_id}/{month}/{year}")
async def monthly_summary(
    employee_id: str,
    month: int,
    year: int,
    user: dict = Depends(require_admin)
):
    """Admin/Super Admin gets monthly hours for an employee."""
    month_str = f"{year}-{month:02d}"
    att_cursor = db.attendance.find({
        "employeeId": employee_id,
        "isVerified": True,
        "clockIn": {"$regex": f"^{month_str}"}
    })
    total_hours = 0.0
    async for r in att_cursor:
        total_hours += r.get("totalHours", 0)
    return {
        "employeeId": employee_id,
        "month": month_str,
        "totalHours": round(total_hours, 2),
        "targetHours": await _get_target_hours(),
        "remaining": round(max(0, await _get_target_hours() - total_hours), 2),
    }