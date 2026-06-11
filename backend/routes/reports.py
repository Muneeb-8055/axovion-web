"""Reports and analytics routes."""
from fastapi import APIRouter, Depends, Query
from datetime import datetime, timezone

from services.db import db
from services.auth_service import require_admin, require_super_admin

router = APIRouter(prefix="/reports", tags=["reports"])

TARGET_HOURS = 208
LEAVES_PER_MONTH = 4


def _parse_month(month: str) -> tuple:
    """Parse 'YYYY-MM' into (year, month)."""
    parts = month.split("-")
    return int(parts[0]), int(parts[1])


async def _sum_hours(cursor) -> float:
    """Sum totalHours from an async cursor."""
    total = 0.0
    async for r in cursor:
        total += r.get("totalHours", 0)
    return total


async def _sum_overtime(cursor) -> float:
    """Sum hours from an async cursor."""
    total = 0.0
    async for r in cursor:
        total += r.get("hours", 0)
    return total


async def _count_leaves(cursor) -> float:
    """Sum leave days (half=0.5, full=1) from an async cursor."""
    total = 0.0
    async for r in cursor:
        total += 0.5 if r.get("type") == "half" else 1.0
    return total


@router.get("/monthly-summary/{month}")
async def monthly_summary(month: str, user: dict = Depends(require_admin)):
    """Monthly summary: hours, OT, leaves per employee."""
    year, m = _parse_month(month)
    pattern = f"{year}-{m:02d}"

    employees = db.users.find({"role": {"$in": ["admin", "employee"]}, "isActive": True})
    summaries = []
    async for emp in employees:
        emp_id = emp["id"]

        att_cursor = db.attendance.find({
            "employeeId": emp_id,
            "isVerified": True,
            "clockIn": {"$regex": f"^{pattern}"}
        })
        total_hours = await _sum_hours(att_cursor)

        ot_cursor = db.overtime.find({
            "employeeId": emp_id,
            "status": "approved",
            "date": {"$regex": f"^{pattern}"}
        })
        total_ot = await _sum_overtime(ot_cursor)

        leave_cursor = db.leaves.find({
            "employeeId": emp_id,
            "status": "approved",
            "date": {"$regex": f"^{pattern}"}
        })
        leaves_used = await _count_leaves(leave_cursor)

        summaries.append({
            "employeeId": emp_id,
            "employeeName": emp.get("name", ""),
            "role": emp.get("role", "employee"),
            "targetHours": TARGET_HOURS,
            "completedHours": round(total_hours, 2),
            "remainingHours": round(max(0, TARGET_HOURS - total_hours), 2),
            "overtimeHours": round(total_ot, 2),
            "leavesUsed": round(leaves_used, 1),
            "leavesRemaining": round(max(0, LEAVES_PER_MONTH - leaves_used), 1),
            "metTarget": total_hours >= TARGET_HOURS,
        })
    return {"month": month, "employees": summaries}


@router.get("/hours-trends/{employee_id}")
async def hours_trends(
    employee_id: str,
    user: dict = Depends(require_admin),
    months: int = Query(6, le=12)
):
    """Hours trend for an employee over last N months."""
    now = datetime.now(timezone.utc)
    trends = []
    for i in range(months - 1, -1, -1):
        m = now.month - i
        y = now.year
        while m <= 0:
            m += 12
            y -= 1
        pattern = f"{y}-{m:02d}"
        att_cursor = db.attendance.find({
            "employeeId": employee_id,
            "isVerified": True,
            "clockIn": {"$regex": f"^{pattern}"}
        })
        total_hours = await _sum_hours(att_cursor)
        trends.append({
            "month": pattern,
            "hours": round(total_hours, 2),
            "target": TARGET_HOURS,
        })
    return {"employeeId": employee_id, "trends": trends}


@router.get("/leave-usage/{month}")
async def leave_usage(month: str, user: dict = Depends(require_admin)):
    """Leaves taken vs available per employee."""
    year, m = _parse_month(month)
    pattern = f"{year}-{m:02d}"

    emp_cursor = db.users.find({"role": {"$in": ["admin", "employee"]}, "isActive": True})
    usage = []
    async for emp in emp_cursor:
        emp_id = emp["id"]
        leave_cursor = db.leaves.find({
            "employeeId": emp_id,
            "status": "approved",
            "date": {"$regex": f"^{pattern}"}
        })
        used = await _count_leaves(leave_cursor)
        usage.append({
            "employeeId": emp_id,
            "employeeName": emp.get("name", ""),
            "leavesAvailable": LEAVES_PER_MONTH,
            "leavesUsed": round(used, 1),
            "leavesRemaining": round(max(0, LEAVES_PER_MONTH - used), 1),
        })
    return {"month": month, "usage": usage}


@router.get("/attendance-rates/{month}")
async def attendance_rates(month: str, user: dict = Depends(require_admin)):
    """Who met 208 target, who fell short."""
    year, m = _parse_month(month)
    pattern = f"{year}-{m:02d}"

    employees = db.users.find({"role": {"$in": ["admin", "employee"]}, "isActive": True})
    met = []
    missed = []
    async for emp in employees:
        emp_id = emp["id"]
        att_cursor = db.attendance.find({
            "employeeId": emp_id,
            "isVerified": True,
            "clockIn": {"$regex": f"^{pattern}"}
        })
        total_hours = await _sum_hours(att_cursor)
        entry = {
            "employeeId": emp_id,
            "employeeName": emp.get("name", ""),
            "hoursCompleted": round(total_hours, 2),
            "hoursShort": round(max(0, TARGET_HOURS - total_hours), 2),
            "target": TARGET_HOURS,
        }
        if total_hours >= TARGET_HOURS:
            met.append(entry)
        else:
            missed.append(entry)
    return {
        "month": month,
        "metTarget": met,
        "missedTarget": missed,
        "metCount": len(met),
        "missedCount": len(missed),
    }


@router.get("/target-missers/{month}")
async def target_missers(month: str, user: dict = Depends(require_admin)):
    """Employees who missed the 208-hour target."""
    year, m = _parse_month(month)
    pattern = f"{year}-{m:02d}"

    employees = db.users.find({"role": {"$in": ["admin", "employee"]}, "isActive": True})
    missers = []
    async for emp in employees:
        emp_id = emp["id"]
        att_cursor = db.attendance.find({
            "employeeId": emp_id,
            "isVerified": True,
            "clockIn": {"$regex": f"^{pattern}"}
        })
        total_hours = await _sum_hours(att_cursor)
        if total_hours < TARGET_HOURS:
            missers.append({
                "employeeId": emp_id,
                "employeeName": emp.get("name", ""),
                "hoursCompleted": round(total_hours, 2),
                "hoursShort": round(TARGET_HOURS - total_hours, 2),
                "target": TARGET_HOURS,
            })
    return {"month": month, "missers": missers, "count": len(missers)}


@router.get("/overtime-tracking/{month}")
async def overtime_tracking(month: str, user: dict = Depends(require_admin)):
    """Overtime per employee, per project."""
    year, m = _parse_month(month)
    pattern = f"{year}-{m:02d}"

    records = db.overtime.find({
        "status": "approved",
        "date": {"$regex": f"^{pattern}"}
    })

    by_employee = {}
    by_project = {}
    total_ot = 0.0

    async for r in records:
        emp_id = r.get("employeeId")
        emp = await db.users.find_one({"id": emp_id})
        emp_name = emp.get("name", "Unknown") if emp else "Unknown"
        hours = r.get("hours", 0)
        project = r.get("project", "General")
        total_ot += hours

        if emp_id not in by_employee:
            by_employee[emp_id] = {"employeeName": emp_name, "totalHours": 0.0, "records": []}
        by_employee[emp_id]["totalHours"] += hours
        by_employee[emp_id]["records"].append({
            "date": r.get("date"),
            "hours": hours,
            "reason": r.get("reason"),
            "project": project,
        })

        if project not in by_project:
            by_project[project] = 0.0
        by_project[project] += hours

    return {
        "month": month,
        "totalOvertimeHours": round(total_ot, 2),
        "byEmployee": [
            {"employeeId": k, **v, "totalHours": round(v["totalHours"], 2)}
            for k, v in by_employee.items()
        ],
        "byProject": [
            {"project": k, "totalHours": round(v, 2)}
            for k, v in by_project.items()
        ],
    }