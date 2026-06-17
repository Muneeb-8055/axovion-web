"""Customer portal routes — signup, login, dashboard, account, audit & bookings.

Customers are stored in a dedicated `customers` collection, fully isolated from
staff (admins/employees). Each customer gets one free AI audit per unique email.
"""
import os
import uuid
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks

from models.schemas import (
    CustomerSignupInput, LoginInput, CustomerProfileUpdate, PasswordChangeInput,
    AuditSubmitInput, Audit,
)
from services.db import db, serialize_doc
from services.auth_service import (
    hash_password, verify_password, create_token, require_customer,
)
from services.lead_scoring import score_lead
from services.resend_service import send_email, tpl_audit_submitted

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/customer", tags=["customer"])


def _public_customer(c: dict) -> dict:
    return {
        "id": c["id"],
        "name": c.get("name", ""),
        "email": c.get("email", ""),
        "company": c.get("company"),
        "phone": c.get("phone"),
        "role": "customer",
        "createdAt": c.get("createdAt"),
    }


# ============ AUTH ============
@router.post("/signup")
async def customer_signup(payload: CustomerSignupInput):
    """Public: register a new customer account."""
    email = payload.email.lower().strip()

    # Email must be unique across customers AND staff users
    if await db.customers.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="An account with this email already exists. Please log in.")
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="This email is already in use.")

    now = datetime.now(timezone.utc).isoformat()
    customer = {
        "id": str(uuid.uuid4()),
        "name": payload.name.strip(),
        "email": email,
        "company": (payload.company or "").strip() or None,
        "phone": (payload.phone or "").strip() or None,
        "passwordHash": hash_password(payload.password),
        "createdAt": now,
        "updatedAt": now,
    }
    await db.customers.insert_one(customer)

    token = create_token({
        "sub": customer["id"], "email": email, "role": "customer", "name": customer["name"],
    })
    return {"token": token, "user": _public_customer(customer)}


@router.post("/login")
async def customer_login(payload: LoginInput):
    """Public: customer login."""
    email = payload.email.lower().strip()
    customer = await db.customers.find_one({"email": email})
    if not customer or not verify_password(payload.password, customer.get("passwordHash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token({
        "sub": customer["id"], "email": email, "role": "customer", "name": customer.get("name", ""),
    })
    return {"token": token, "user": _public_customer(customer)}


@router.get("/me")
async def customer_me(user: dict = Depends(require_customer)):
    customer = await db.customers.find_one({"id": user["sub"]})
    if not customer:
        raise HTTPException(status_code=404, detail="Account not found")
    return _public_customer(customer)


@router.put("/me")
async def update_customer_profile(payload: CustomerProfileUpdate, user: dict = Depends(require_customer)):
    update = {}
    if payload.name is not None:
        update["name"] = payload.name.strip()
    if payload.company is not None:
        update["company"] = payload.company.strip() or None
    if payload.phone is not None:
        update["phone"] = payload.phone.strip() or None
    if update:
        update["updatedAt"] = datetime.now(timezone.utc).isoformat()
        await db.customers.update_one({"id": user["sub"]}, {"$set": update})
    customer = await db.customers.find_one({"id": user["sub"]})
    return _public_customer(customer)


@router.put("/me/password")
async def change_customer_password(payload: PasswordChangeInput, user: dict = Depends(require_customer)):
    customer = await db.customers.find_one({"id": user["sub"]})
    if not customer or not verify_password(payload.currentPassword, customer.get("passwordHash", "")):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(payload.newPassword) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    await db.customers.update_one(
        {"id": user["sub"]},
        {"$set": {"passwordHash": hash_password(payload.newPassword),
                  "updatedAt": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Password updated"}


# ============ DASHBOARD ============
@router.get("/dashboard")
async def customer_dashboard(user: dict = Depends(require_customer)):
    """Aggregate dashboard data for the logged-in customer."""
    customer = await db.customers.find_one({"id": user["sub"]})
    if not customer:
        raise HTTPException(status_code=404, detail="Account not found")
    email = customer["email"]

    audits_cursor = db.audits.find({"contactEmail": email}, {"_id": 0}).sort("createdAt", -1)
    audits = await audits_cursor.to_list(50)

    bookings_cursor = db.bookings.find({"email": email}, {"_id": 0}).sort("createdAt", -1)
    bookings = await bookings_cursor.to_list(50)

    return {
        "profile": _public_customer(customer),
        "auditCount": len(audits),
        "freeAuditUsed": len(audits) > 0,
        "audits": [
            {
                "id": a.get("id"),
                "businessName": a.get("businessName"),
                "industry": a.get("industry"),
                "status": a.get("status", "new"),
                "lead_score": a.get("lead_score"),
                "createdAt": a.get("createdAt"),
                "hasReport": bool(a.get("report")) and "error" not in (a.get("report") or {}),
            }
            for a in audits
        ],
        "bookings": [
            {
                "id": b.get("id"),
                "preferredTime": b.get("preferredTime"),
                "message": b.get("message"),
                "status": b.get("status", "new"),
                "source": b.get("source"),
                "createdAt": b.get("createdAt"),
            }
            for b in bookings
        ],
    }


# ============ AUDIT (login-gated, one free per email) ============
async def _generate_report_task(audit_id: str):
    """Background: generate AI report (reuses audits route logic)."""
    from routes.audits import _generate_and_save_report
    await _generate_and_save_report(audit_id)


@router.get("/audit/eligibility")
async def audit_eligibility(user: dict = Depends(require_customer)):
    """Tell the frontend whether this customer can still submit a free audit."""
    customer = await db.customers.find_one({"id": user["sub"]})
    count = await db.audits.count_documents({"contactEmail": customer["email"]})
    return {"freeAuditUsed": count > 0, "auditCount": count}


@router.post("/audit")
async def customer_submit_audit(
    payload: AuditSubmitInput,
    background_tasks: BackgroundTasks,
    user: dict = Depends(require_customer),
):
    """Customer submits an AI audit. Enforces one free audit per unique email."""
    customer = await db.customers.find_one({"id": user["sub"]})
    if not customer:
        raise HTTPException(status_code=404, detail="Account not found")
    email = customer["email"]

    # One free audit per unique email
    existing = await db.audits.count_documents({"contactEmail": email})
    if existing > 0:
        raise HTTPException(
            status_code=403,
            detail="You've already used your free AI audit. Book a strategy call to discuss more.",
        )

    settings = await db.settings.find_one({"id": "global"}, {"_id": 0}) or {}
    high_rev = settings.get("highValueRevenueUsd", 50000)
    high_bud = settings.get("highValueBudgetUsd", 5000)

    data = payload.model_dump()
    # Force the audit to be tied to the logged-in customer's email
    data["contactEmail"] = email
    if not data.get("contactName"):
        data["contactName"] = customer.get("name")

    lead_score = score_lead(data, high_value_revenue=high_rev, high_value_budget=high_bud)
    audit = Audit(**data, lead_score=lead_score)
    doc = serialize_doc(audit.model_dump())
    doc["customerId"] = customer["id"]
    await db.audits.insert_one(doc)

    # Confirmation email
    if settings.get("autoEmailEnabled", True):
        try:
            from services.resend_service import tpl_audit_submitted
            tpl = tpl_audit_submitted(name=audit.contactName or audit.businessName, business_name=audit.businessName)
            res = await send_email(email, tpl["subject"], tpl["html"])
            await db.email_logs.insert_one({
                "id": str(uuid.uuid4()),
                "auditId": audit.id,
                "template": "audit_submitted",
                "toEmail": email,
                "subject": tpl["subject"],
                "status": "sent" if res["ok"] else "failed",
                "providerEmailId": res.get("id"),
                "error": res.get("error"),
                "sentAt": datetime.now(timezone.utc).isoformat(),
            })
        except Exception:
            logger.exception("Audit confirmation email failed")

    background_tasks.add_task(_generate_report_task, audit.id)
    return {
        "id": audit.id,
        "status": "submitted",
        "message": "Audit submitted! Your AI report is being generated.",
        "report_url": f"/audit-report/{audit.id}",
    }


@router.get("/audit/{audit_id}")
async def customer_get_audit(audit_id: str, user: dict = Depends(require_customer)):
    """Customer fetches their own audit + report."""
    customer = await db.customers.find_one({"id": user["sub"]})
    audit = await db.audits.find_one({"id": audit_id}, {"_id": 0})
    if not audit or audit.get("contactEmail") != customer["email"]:
        raise HTTPException(status_code=404, detail="Audit not found")
    return audit


# ============ BOOKINGS ============
@router.post("/booking")
async def customer_create_booking(payload: dict, user: dict = Depends(require_customer)):
    """Customer requests a strategy call."""
    customer = await db.customers.find_one({"id": user["sub"]})
    now = datetime.now(timezone.utc).isoformat()
    booking = {
        "id": str(uuid.uuid4()),
        "name": customer.get("name", ""),
        "email": customer["email"],
        "phone": customer.get("phone") or payload.get("phone"),
        "message": payload.get("message", ""),
        "preferredTime": payload.get("preferredTime"),
        "source": "customer-portal",
        "status": "new",
        "customerId": customer["id"],
        "createdAt": now,
    }
    await db.bookings.insert_one(booking)
    return {"id": booking["id"], "ok": True, "message": "Strategy call requested. We'll be in touch shortly."}
