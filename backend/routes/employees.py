"""Employee management routes."""
from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime, timezone, timedelta
import calendar
import uuid

from models.schemas import (
    EmployeeCreateInput, EmployeeUpdateInput, AdminPermissionsUpdate,
    AdminPermissions
)
from services.db import db, serialize_doc
from services.auth_service import (
    require_admin, require_super_admin, require_employee, check_permission,
    hash_password, create_token, verify_password
)

router = APIRouter(prefix="/employees", tags=["employees"])

DEFAULT_TARGET_HOURS = 208
WORKING_DAYS_PER_MONTH = 26
HOURS_PER_DAY = 8
LEAVES_PER_MONTH = 4


async def _get_target_hours() -> float:
    """Fetch the configured monthly target hours from settings."""
    s = await db.settings.find_one({"id": "global"})
    if s and s.get("monthlyTargetHours"):
        return float(s["monthlyTargetHours"])
    return float(DEFAULT_TARGET_HOURS)


def _public_fields(user: dict) -> dict:
    """Return safe fields for any viewer."""
    return {
        "id": user["id"],
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", "employee"),
        "photoUrl": user.get("photoUrl"),
        "isActive": user.get("isActive", True),
        "createdAt": user.get("createdAt"),
    }


def _working_days_in_month(year: int, month: int) -> int:
    """Count working days (Mon-Fri) in a given month."""
    _, last_day = calendar.monthrange(year, month)
    count = 0
    for day in range(1, last_day + 1):
        wd = calendar.weekday(year, month, day)
        if wd < 5:
            count += 1
    return count


def _remaining_working_days(year: int, month: int, from_date: datetime) -> int:
    """Working days from from_date to end of month."""
    _, last_day = calendar.monthrange(year, month)
    count = 0
    for day in range(from_date.day, last_day + 1):
        wd = calendar.weekday(year, month, day)
        if wd < 5:
            count += 1
    return count


def _employee_month_target(user_id: str) -> float:
    """Calculate employee's prorated monthly target based on join date."""
    now = datetime.now(timezone.utc)
    year, month = now.year, now.month
    user = db.users.find_one_sync({"id": user_id}) if hasattr(db.users, "find_one_sync") else None

    # Fallback: use the user's createdAt if available from a separate lookup
    # Since Motor is async, we'll compute based on the createdAt stored in user doc
    # We'll pass it from the caller
    return float(DEFAULT_TARGET_HOURS)


async def _get_employee_stats(user_id: str) -> dict:
    """Get current month hours, leaves, OT for an employee (async)."""
    now = datetime.now(timezone.utc)
    year, month = now.year, now.month
    month_prefix = f"{year}-{month:02d}"

    # Hours: sum verified attendance for this month
    att_cursor = db.attendance.find({
        "employeeId": user_id,
        "isVerified": True,
        "clockIn": {"$regex": f"^{month_prefix}"}
    })
    total_hours = 0.0
    async for r in att_cursor:
        total_hours += r.get("totalHours", 0)

    # Overtime: sum approved OT for this month
    ot_cursor = db.overtime.find({
        "employeeId": user_id,
        "status": "approved",
        "date": {"$regex": f"^{month_prefix}"}
    })
    total_ot = 0.0
    async for r in ot_cursor:
        total_ot += r.get("hours", 0)

    # Leaves used this month
    leaves_cursor = db.leaves.find({
        "employeeId": user_id,
        "status": "approved",
        "date": {"$regex": f"^{month_prefix}"}
    })
    leaves_used = 0.0
    async for l in leaves_cursor:
        leaves_used += 0.5 if l.get("type") == "half" else 1.0

    # Get user's join date for prorating
    user_doc = await db.users.find_one({"id": user_id})
    created_at_str = user_doc.get("createdAt", "") if user_doc else ""
    if created_at_str:
        try:
            created_at = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
        except Exception:
            created_at = now
    else:
        created_at = now

    # Always use the configured monthly target (no prorating)
    month_target = await _get_target_hours()

    return {
        "targetHours": month_target,
        "completedHours": round(total_hours, 2),
        "remainingHours": round(max(0, month_target - total_hours), 2),
        "overtimeHours": round(total_ot, 2),
        "leavesUsed": round(leaves_used, 1),
        "leavesRemaining": round(max(0, LEAVES_PER_MONTH - leaves_used), 1),
        "currentMonth": f"{year}-{month:02d}",
    }


# === Routes ===

@router.post("")
async def create_employee(
    payload: EmployeeCreateInput,
    user: dict = Depends(require_super_admin)
):
    """Super Admin creates an employee or admin account."""
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    emp_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    admin_perms = None
    if payload.role == "admin":
        admin_perms = {
            "create_employee": False,
            "approve_attendance": False,
            "approve_leaves": False,
            "assign_tasks": False,
            "manage_tasks": False,
            "edit_attendance": False,
        }

    await db.users.insert_one({
        "id": emp_id,
        "email": payload.email.lower(),
        "name": payload.name,
        "passwordHash": hash_password(payload.password),
        "role": payload.role,
        "isActive": True,
        "photoUrl": None,
        "adminPermissions": admin_perms,
        "createdAt": now.isoformat(),
        "updatedAt": now.isoformat(),
    })

    return {"id": emp_id, "email": payload.email.lower(), "name": payload.name, "role": payload.role}


@router.get("")
async def list_employees(
    user: dict = Depends(require_admin)
):
    """Admin or Super Admin lists all employees."""
    cursor = db.users.find({"role": {"$ne": "super_admin"}})
    employees = []
    async for emp in cursor:
        emp_data = _public_fields(emp)
        emp_data["stats"] = await _get_employee_stats(emp["id"])
        employees.append(emp_data)
    return employees


@router.get("/me")
async def my_profile(user: dict = Depends(require_employee)):
    """Employee sees their own profile."""
    emp = await db.users.find_one({"id": user["sub"]})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    emp_data = _public_fields(emp)
    emp_data["stats"] = await _get_employee_stats(emp["id"])
    return emp_data


@router.get("/{emp_id}")
async def get_employee(emp_id: str, user: dict = Depends(require_admin)):
    """Admin or Super Admin views a specific employee."""
    emp = await db.users.find_one({"id": emp_id})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    emp_data = _public_fields(emp)
    emp_data["stats"] = await _get_employee_stats(emp["id"])
    emp_data["adminPermissions"] = emp.get("adminPermissions")
    return emp_data


@router.put("/{emp_id}")
async def update_employee(
    emp_id: str,
    payload: EmployeeUpdateInput,
    user: dict = Depends(require_admin)
):
    """Admin or Super Admin updates employee info."""
    update = {}
    if payload.name is not None:
        update["name"] = payload.name
    if payload.photoUrl is not None:
        update["photoUrl"] = payload.photoUrl
    if payload.isActive is not None:
        update["isActive"] = payload.isActive

    if update:
        update["updatedAt"] = datetime.now(timezone.utc).isoformat()
        await db.users.update_one({"id": emp_id}, {"$set": update})

    emp = await db.users.find_one({"id": emp_id})
    return _public_fields(emp) if emp else {}


@router.delete("/{emp_id}")
async def delete_employee(emp_id: str, user: dict = Depends(require_super_admin)):
    """Super Admin deletes an employee account."""
    result = await db.users.delete_one({"id": emp_id, "role": {"$ne": "super_admin"}})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found or cannot delete super admin")
    return {"message": "Employee deleted"}


@router.put("/{emp_id}/deactivate")
async def deactivate_employee(emp_id: str, user: dict = Depends(require_super_admin)):
    """Super Admin deactivates an employee."""
    await db.users.update_one(
        {"id": emp_id, "role": {"$ne": "super_admin"}},
        {"$set": {"isActive": False, "updatedAt": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Employee deactivated"}


@router.put("/{emp_id}/reactivate")
async def reactivate_employee(emp_id: str, user: dict = Depends(require_super_admin)):
    """Super Admin reactivates a deactivated employee."""
    await db.users.update_one(
        {"id": emp_id, "role": {"$ne": "super_admin"}},
        {"$set": {"isActive": True, "updatedAt": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Employee reactivated"}


@router.put("/admins/{admin_id}/permissions")
async def update_admin_permissions(
    admin_id: str,
    payload: AdminPermissionsUpdate,
    user: dict = Depends(require_super_admin)
):
    """Super Admin sets permissions for an admin."""
    admin = await db.users.find_one({"id": admin_id, "role": "admin"})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    await db.users.update_one(
        {"id": admin_id},
        {"$set": {
            "adminPermissions": payload.model_dump(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"message": "Permissions updated"}


@router.get("/{emp_id}/profile-summary")
async def employee_profile_summary(emp_id: str, user: dict = Depends(require_admin)):
    """Full profile card data for Admin view."""
    emp = await db.users.find_one({"id": emp_id})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    stats = await _get_employee_stats(emp_id)

    # Tasks grouped by status
    tasks_cursor = db.tasks.find({"assignee": emp_id})
    tasks = {"todo": [], "in-progress": [], "done": []}
    async for t in tasks_cursor:
        status = t.get("status", "todo")
        if status in tasks:
            tasks[status].append({
                "id": t.get("id"),
                "title": t.get("title"),
                "dueDate": t.get("dueDate"),
                "priority": t.get("priority"),
            })

    # Leaves
    now = datetime.now(timezone.utc)
    month_key = f"{now.year}-{now.month:02d}"
    leaves_cursor = db.leaves.find({
        "employeeId": emp_id,
        "date": {"$regex": f"^{month_key}"}
    })
    leaves = []
    async for lv in leaves_cursor:
        leaves.append({
            "id": lv.get("id"),
            "date": lv.get("date"),
            "type": lv.get("type"),
            "status": lv.get("status"),
        })

    # Overtime
    ot_cursor = db.overtime.find({
        "employeeId": emp_id,
        "status": "approved",
        "date": {"$regex": f"^{month_key}"}
    })
    overtime = []
    async for ot in ot_cursor:
        overtime.append({
            "id": ot.get("id"),
            "date": ot.get("date"),
            "hours": ot.get("hours"),
            "reason": ot.get("reason"),
            "project": ot.get("project"),
        })

    return {
        "profile": _public_fields(emp),
        "stats": stats,
        "tasks": tasks,
        "leaves": leaves,
        "overtime": overtime,
        "taskBadges": {
            "todo": len(tasks["todo"]),
            "inProgress": len(tasks["in-progress"]),
            "done": len(tasks["done"]),
        }
    }