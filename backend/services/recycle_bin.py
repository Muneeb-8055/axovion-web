"""Soft-delete / recycle bin service.

Instead of permanently deleting documents, we move them into a central
`recycle_bin` collection so they can be restored or purged later.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from services.db import db


# Human-friendly labels per collection (for the UI)
_TYPE_LABELS = {
    "tasks": "Task",
    "users": "Employee",
    "leaves": "Leave",
    "audits": "Audit",
    "chats": "Chat",
    "bookings": "Booking",
    "overtime": "Overtime",
    "attendance": "Attendance",
}


def _label_for(collection: str, doc: dict) -> str:
    """Pick a readable label for a deleted doc."""
    return (
        doc.get("title")
        or doc.get("name")
        or doc.get("email")
        or doc.get("date")
        or doc.get("id", "")
    )


async def soft_delete(collection: str, doc_id: str, deleted_by: Optional[str] = None) -> bool:
    """Move a document from its collection into the recycle bin.

    Returns True if a document was found and moved.
    """
    coll = db[collection]
    doc = await coll.find_one({"id": doc_id})
    if not doc:
        return False

    doc.pop("_id", None)
    bin_entry = {
        "id": str(uuid.uuid4()),
        "originalCollection": collection,
        "originalId": doc_id,
        "typeLabel": _TYPE_LABELS.get(collection, collection),
        "itemLabel": _label_for(collection, doc),
        "data": doc,
        "deletedBy": deleted_by,
        "deletedAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.recycle_bin.insert_one(bin_entry)
    await coll.delete_one({"id": doc_id})
    return True


async def restore_item(bin_id: str) -> bool:
    """Restore a recycle-bin entry back to its original collection."""
    entry = await db.recycle_bin.find_one({"id": bin_id})
    if not entry:
        return False

    coll = db[entry["originalCollection"]]
    data = entry.get("data", {})
    data.pop("_id", None)

    existing = await coll.find_one({"id": entry["originalId"]})
    if not existing:
        await coll.insert_one(data)

    await db.recycle_bin.delete_one({"id": bin_id})
    return True


async def purge_item(bin_id: str) -> bool:
    """Permanently delete a single recycle-bin entry."""
    res = await db.recycle_bin.delete_one({"id": bin_id})
    return res.deleted_count > 0


async def list_bin(collection: Optional[str] = None) -> list:
    """List recycle-bin entries, optionally filtered by original collection."""
    query = {}
    if collection:
        query["originalCollection"] = collection
    cursor = db.recycle_bin.find(query, {"_id": 0}).sort("deletedAt", -1).limit(500)
    return await cursor.to_list(500)
