"""Chatbot routes."""
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
import uuid

from models.schemas import ChatSendInput, ChatThread
from services.db import db, serialize_doc
from services.groq_service import chatbot_response
from services.auth_service import require_admin

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("")
async def send_chat_message(payload: ChatSendInput):
    """Public: send a message to the AI chatbot."""
    # Find or create thread
    thread = await db.chats.find_one({"sessionId": payload.sessionId}, {"_id": 0})
    now_iso = datetime.now(timezone.utc).isoformat()

    if not thread:
        thread = {
            "id": str(uuid.uuid4()),
            "sessionId": payload.sessionId,
            "messages": [],
            "contactEmail": payload.contactEmail,
            "contactName": payload.contactName,
            "leadScore": 0,
            "createdAt": now_iso,
            "updatedAt": now_iso,
        }
        await db.chats.insert_one({**thread})

    # Append user message
    user_msg = {"role": "user", "content": payload.message, "timestamp": now_iso}
    thread["messages"].append(user_msg)

    # Get AI response
    try:
        ai_text = await chatbot_response(thread["messages"][:-1], payload.message)
    except Exception:
        logger.exception("Chatbot error")
        ai_text = "I'm having trouble responding right now. Please try again in a moment, or submit the AI Audit form for direct help."

    ai_msg = {"role": "assistant", "content": ai_text, "timestamp": datetime.now(timezone.utc).isoformat()}
    thread["messages"].append(ai_msg)

    # Persist
    update_doc = {
        "messages": thread["messages"],
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }
    if payload.contactEmail:
        update_doc["contactEmail"] = payload.contactEmail
    if payload.contactName:
        update_doc["contactName"] = payload.contactName

    await db.chats.update_one(
        {"sessionId": payload.sessionId},
        {"$set": update_doc},
        upsert=True,
    )

    return {
        "sessionId": payload.sessionId,
        "reply": ai_text,
        "messages": thread["messages"][-10:],
    }


@router.get("/{session_id}")
async def get_chat(session_id: str):
    """Public: fetch current thread for a session."""
    thread = await db.chats.find_one({"sessionId": session_id}, {"_id": 0})
    if not thread:
        return {"sessionId": session_id, "messages": []}
    return thread


@router.get("s", dependencies=[Depends(require_admin)])
async def list_chats(limit: int = 200):
    cursor = db.chats.find({}, {"_id": 0}).sort("updatedAt", -1).limit(limit)
    items = await cursor.to_list(limit)
    return items


@router.get("s/{chat_id}", dependencies=[Depends(require_admin)])
async def get_chat_admin(chat_id: str):
    thread = await db.chats.find_one({"id": chat_id}, {"_id": 0})
    if not thread:
        thread = await db.chats.find_one({"sessionId": chat_id}, {"_id": 0})
    if not thread:
        raise HTTPException(status_code=404, detail="Chat not found")
    return thread


@router.delete("s/{chat_id}", dependencies=[Depends(require_admin)])
async def delete_chat(chat_id: str):
    res = await db.chats.delete_one({"id": chat_id})
    if res.deleted_count == 0:
        res = await db.chats.delete_one({"sessionId": chat_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"ok": True}
