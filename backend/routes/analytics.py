"""Admin analytics + dashboard stats."""
from fastapi import APIRouter, Depends
from datetime import datetime, timezone, timedelta
from services.db import db
from services.auth_service import require_admin

router = APIRouter(prefix="/analytics", tags=["analytics"], dependencies=[Depends(require_admin)])


@router.get("/dashboard")
async def dashboard_stats():
    """Aggregate dashboard counts + recent activity."""
    total_audits = await db.audits.count_documents({})
    new_audits = await db.audits.count_documents({"status": "new"})
    delivered_audits = await db.audits.count_documents({"status": "delivered"})
    hot_leads = await db.audits.count_documents({"lead_score": "hot"})
    warm_leads = await db.audits.count_documents({"lead_score": "warm"})
    cold_leads = await db.audits.count_documents({"lead_score": "cold"})
    total_chats = await db.chats.count_documents({})
    total_bookings = await db.bookings.count_documents({})
    total_emails = await db.email_logs.count_documents({})
    total_calls = await db.call_logs.count_documents({})
    total_tasks = await db.tasks.count_documents({})
    open_tasks = await db.tasks.count_documents({"status": {"$ne": "done"}})

    # Conversion rate (audits / chats if any)
    conversion = 0
    if total_chats > 0:
        conversion = round((total_audits / total_chats) * 100, 1)

    # Recent audits
    recent_audits = await db.audits.find({}, {"_id": 0}).sort("createdAt", -1).limit(5).to_list(5)

    return {
        "audits": {
            "total": total_audits,
            "new": new_audits,
            "delivered": delivered_audits,
        },
        "leads": {"hot": hot_leads, "warm": warm_leads, "cold": cold_leads},
        "chats": total_chats,
        "bookings": total_bookings,
        "emails": total_emails,
        "calls": total_calls,
        "tasks": {"total": total_tasks, "open": open_tasks},
        "conversion_rate": conversion,
        "recent_audits": recent_audits,
    }


@router.get("/funnel")
async def funnel():
    """Conversion funnel: chats -> audits -> reports viewed -> bookings."""
    chats = await db.chats.count_documents({})
    audits = await db.audits.count_documents({})
    delivered = await db.audits.count_documents({"status": "delivered"})
    bookings = await db.bookings.count_documents({})
    return [
        {"step": "Chat engaged", "value": chats},
        {"step": "Audit submitted", "value": audits},
        {"step": "Report delivered", "value": delivered},
        {"step": "Booking made", "value": bookings},
    ]


@router.get("/timeseries")
async def timeseries(days: int = 14):
    """Audits by day for past N days."""
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=days)
    cursor = db.audits.find(
        {"createdAt": {"$gte": start.isoformat()}},
        {"_id": 0, "createdAt": 1, "lead_score": 1},
    )
    items = await cursor.to_list(2000)

    # Group by day
    buckets = {}
    for i in range(days):
        d = (start + timedelta(days=i)).date().isoformat()
        buckets[d] = {"date": d, "audits": 0, "hot": 0}
    for item in items:
        try:
            d = datetime.fromisoformat(item["createdAt"]).date().isoformat()
            if d in buckets:
                buckets[d]["audits"] += 1
                if item.get("lead_score") == "hot":
                    buckets[d]["hot"] += 1
        except Exception:
            continue
    return list(buckets.values())


@router.get("/sources")
async def traffic_sources():
    """Mock source breakdown until real analytics integrated. (Computed from booking source field.)"""
    pipeline = [
        {"$group": {"_id": "$source", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    cursor = db.bookings.aggregate(pipeline)
    res = await cursor.to_list(20)
    return [{"source": r["_id"] or "direct", "count": r["count"]} for r in res]
