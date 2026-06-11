"""Task kanban routes — admin can manage, employees can read and update own."""
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from typing import List

from models.schemas import TaskInput, Task
from services.db import db, serialize_doc
from services.auth_service import require_admin, require_employee

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("")
async def list_tasks(user: dict = Depends(require_admin)):
    """Admin/Super Admin: list all tasks."""
    cursor = db.tasks.find({}, {"_id": 0}).sort("createdAt", -1)
    tasks = await cursor.to_list(500)
    return {"tasks": tasks}


@router.get("/my")
async def list_my_tasks(user: dict = Depends(require_employee)):
    """Employee: list only tasks assigned to them."""
    cursor = db.tasks.find({"assignee": user["sub"]}, {"_id": 0}).sort("createdAt", -1)
    tasks = await cursor.to_list(500)
    return {"tasks": tasks}


@router.post("")
async def create_task(payload: TaskInput, user: dict = Depends(require_admin)):
    """Admin/Super Admin only can create tasks."""
    task = Task(**payload.model_dump())
    doc = serialize_doc(task.model_dump())
    await db.tasks.insert_one(doc)
    return await db.tasks.find_one({"id": task.id}, {"_id": 0})


@router.put("/{task_id}")
async def update_task(task_id: str, payload: TaskInput, user: dict = Depends(require_admin)):
    """Admin/Super Admin only can update any task."""
    update_data = payload.model_dump()
    update_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    res = await db.tasks.update_one({"id": task_id}, {"$set": update_data})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    return task


@router.patch("/{task_id}/status")
async def update_my_task_status(task_id: str, status: str, user: dict = Depends(require_employee)):
    """Employee: update status of their own assigned task only."""
    task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.get("assignee") != user["sub"]:
        raise HTTPException(status_code=403, detail="Not assigned to you")
    allowed = ["todo", "in_progress", "done"]
    if status not in allowed:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {allowed}")
    await db.tasks.update_one(
        {"id": task_id},
        {"$set": {"status": status, "updatedAt": datetime.now(timezone.utc).isoformat()}}
    )
    return await db.tasks.find_one({"id": task_id}, {"_id": 0})


@router.delete("/{task_id}")
async def delete_task(task_id: str, user: dict = Depends(require_admin)):
    """Admin/Super Admin only can delete tasks."""
    res = await db.tasks.delete_one({"id": task_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"ok": True}