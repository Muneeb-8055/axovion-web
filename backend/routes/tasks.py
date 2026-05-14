"""Task kanban routes (admin only)."""
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from typing import List

from models.schemas import TaskInput, Task
from services.db import db, serialize_doc
from services.auth_service import require_admin

router = APIRouter(prefix="/tasks", tags=["tasks"], dependencies=[Depends(require_admin)])


@router.get("")
async def list_tasks(status: str = None):
    query = {}
    if status:
        query["status"] = status
    cursor = db.tasks.find(query, {"_id": 0}).sort("createdAt", -1)
    return await cursor.to_list(500)


@router.post("")
async def create_task(payload: TaskInput):
    task = Task(**payload.model_dump())
    doc = serialize_doc(task.model_dump())
    await db.tasks.insert_one(doc)
    # Return without _id
    return await db.tasks.find_one({"id": task.id}, {"_id": 0})


@router.put("/{task_id}")
async def update_task(task_id: str, payload: TaskInput):
    update_data = payload.model_dump()
    update_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    res = await db.tasks.update_one({"id": task_id}, {"$set": update_data})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    return task


@router.delete("/{task_id}")
async def delete_task(task_id: str):
    res = await db.tasks.delete_one({"id": task_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"ok": True}
