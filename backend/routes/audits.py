"""Audit submission + AI report generation routes."""
import os
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List

from models.schemas import AuditSubmitInput, Audit, AuditStatusUpdate
from services.db import db, serialize_doc
from services.groq_service import generate_audit_report
from services.resend_service import send_email, tpl_audit_submitted, tpl_audit_report_ready
from services.lead_scoring import score_lead, is_high_value
from services.auth_service import require_admin

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/audit", tags=["audit"])


async def _generate_and_save_report(audit_id: str):
    """Background task: generate report, save it, send report-ready email."""
    try:
        audit = await db.audits.find_one({"id": audit_id}, {"_id": 0})
        if not audit:
            logger.error(f"Audit {audit_id} not found for report gen")
            return

        # Build sanitized data for LLM
        prompt_data = {k: audit.get(k) for k in (
            "businessName", "industry", "websiteUrl", "mainGoal", "monthlyRevenue",
            "employees", "repetitiveTasks", "tools", "supportVolume",
            "leadsPerMonth", "bottleneck", "budget", "timeline",
            "salesCycleLength", "currentAutomationLevel"
        )}
        report = await generate_audit_report(prompt_data)
        report["generated_at"] = datetime.now(timezone.utc).isoformat()

        await db.audits.update_one(
            {"id": audit_id},
            {"$set": {
                "report": report,
                "updatedAt": datetime.now(timezone.utc).isoformat(),
            }}
        )
        logger.info(f"Report generated for audit {audit_id}")

        # Send report-ready email
        settings = await db.settings.find_one({"id": "global"}, {"_id": 0}) or {}
        if settings.get("autoEmailEnabled", True):
            site_url = os.environ.get("SITE_URL", "")
            report_url = f"{site_url}/audit-report/{audit_id}"
            calendly = settings.get("calendlyLink", "https://calendly.com/axovion/30min")
            opportunities = report.get("opportunities", [])
            top_opp = opportunities[0]["title"] if opportunities else "your top workflow"
            savings = report.get("total_monthly_savings_usd", 0)

            tpl = tpl_audit_report_ready(
                name=audit.get("contactName") or audit.get("businessName", ""),
                business_name=audit.get("businessName", ""),
                report_url=report_url,
                monthly_savings=savings,
                top_opportunity=top_opp,
                calendly_url=calendly,
            )
            res = await send_email(audit["contactEmail"], tpl["subject"], tpl["html"])
            await db.email_logs.insert_one({
                "id": __import__("uuid").uuid4().__str__(),
                "auditId": audit_id,
                "template": "audit_report_ready",
                "toEmail": audit["contactEmail"],
                "subject": tpl["subject"],
                "status": "sent" if res["ok"] else "failed",
                "providerEmailId": res.get("id"),
                "error": res.get("error"),
                "sentAt": datetime.now(timezone.utc).isoformat(),
            })
    except Exception as e:
        logger.exception(f"Failed to generate/email report for {audit_id}: {e}")
        await db.audits.update_one(
            {"id": audit_id},
            {"$set": {
                "report": {"error": str(e)},
                "updatedAt": datetime.now(timezone.utc).isoformat(),
            }}
        )


@router.post("")
async def submit_audit(payload: AuditSubmitInput, background_tasks: BackgroundTasks):
    """Public: submit AI audit form. Triggers async AI report generation + email."""
    settings = await db.settings.find_one({"id": "global"}, {"_id": 0}) or {}
    high_rev = settings.get("highValueRevenueUsd", 50000)
    high_bud = settings.get("highValueBudgetUsd", 5000)

    data = payload.model_dump()
    lead_score = score_lead(data, high_value_revenue=high_rev, high_value_budget=high_bud)

    audit = Audit(**data, lead_score=lead_score)
    doc = serialize_doc(audit.model_dump())
    await db.audits.insert_one(doc)

    # Send confirmation email immediately
    if settings.get("autoEmailEnabled", True):
        tpl = tpl_audit_submitted(
            name=audit.contactName or audit.businessName,
            business_name=audit.businessName,
        )
        res = await send_email(audit.contactEmail, tpl["subject"], tpl["html"])
        await db.email_logs.insert_one({
            "id": __import__("uuid").uuid4().__str__(),
            "auditId": audit.id,
            "template": "audit_submitted",
            "toEmail": audit.contactEmail,
            "subject": tpl["subject"],
            "status": "sent" if res["ok"] else "failed",
            "providerEmailId": res.get("id"),
            "error": res.get("error"),
            "sentAt": datetime.now(timezone.utc).isoformat(),
        })

    # Kick off background report generation
    background_tasks.add_task(_generate_and_save_report, audit.id)

    return {
        "id": audit.id,
        "status": "submitted",
        "message": "Audit submitted! Your AI report is being generated and will be ready in 10-30 seconds.",
        "lead_score": lead_score,
        "report_url": f"/audit-report/{audit.id}",
    }


@router.get("/report/{audit_id}")
async def get_audit_report(audit_id: str):
    """Public: fetch a single audit + report (limited fields for public view)."""
    audit = await db.audits.find_one({"id": audit_id}, {"_id": 0})
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    # Return safe public subset
    return {
        "id": audit["id"],
        "businessName": audit.get("businessName"),
        "industry": audit.get("industry"),
        "websiteUrl": audit.get("websiteUrl"),
        "contactName": audit.get("contactName"),
        "createdAt": audit.get("createdAt"),
        "report": audit.get("report"),
        "status": audit.get("status", "new"),
    }


@router.post("/regenerate/{audit_id}")
async def regenerate_report(audit_id: str, background_tasks: BackgroundTasks, _: dict = Depends(require_admin)):
    """Admin: regenerate report for an audit."""
    audit = await db.audits.find_one({"id": audit_id}, {"_id": 0})
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    background_tasks.add_task(_generate_and_save_report, audit_id)
    return {"ok": True, "message": "Report regeneration started"}


# ============ ADMIN ENDPOINTS ============
@router.get("s", dependencies=[Depends(require_admin)])
async def list_audits(status: str = None, lead_score: str = None, limit: int = 200):
    """Admin: list all audits with optional filters."""
    query = {}
    if status:
        query["status"] = status
    if lead_score:
        query["lead_score"] = lead_score
    cursor = db.audits.find(query, {"_id": 0}).sort("createdAt", -1).limit(limit)
    items = await cursor.to_list(limit)
    return items


@router.get("s/{audit_id}", dependencies=[Depends(require_admin)])
async def get_audit_admin(audit_id: str):
    audit = await db.audits.find_one({"id": audit_id}, {"_id": 0})
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    return audit


@router.put("s/{audit_id}", dependencies=[Depends(require_admin)])
async def update_audit(audit_id: str, update: AuditStatusUpdate):
    audit = await db.audits.find_one({"id": audit_id}, {"_id": 0})
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    update_data = {"status": update.status, "updatedAt": datetime.now(timezone.utc).isoformat()}
    if update.notes is not None:
        update_data["notes"] = update.notes
    await db.audits.update_one({"id": audit_id}, {"$set": update_data})
    return {"ok": True}


@router.delete("s/{audit_id}", dependencies=[Depends(require_admin)])
async def delete_audit(audit_id: str):
    res = await db.audits.delete_one({"id": audit_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Audit not found")
    return {"ok": True}


@router.post("/resend-report/{audit_id}", dependencies=[Depends(require_admin)])
async def resend_report_email(audit_id: str):
    audit = await db.audits.find_one({"id": audit_id}, {"_id": 0})
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    settings = await db.settings.find_one({"id": "global"}, {"_id": 0}) or {}
    site_url = os.environ.get("SITE_URL", "")
    report_url = f"{site_url}/audit-report/{audit_id}"
    calendly = settings.get("calendlyLink", "https://calendly.com/axovion/30min")
    report = audit.get("report") or {}
    opportunities = report.get("opportunities", [])
    top_opp = opportunities[0]["title"] if opportunities else "your top workflow"
    savings = report.get("total_monthly_savings_usd", 0)
    tpl = tpl_audit_report_ready(
        name=audit.get("contactName") or audit.get("businessName", ""),
        business_name=audit.get("businessName", ""),
        report_url=report_url,
        monthly_savings=savings,
        top_opportunity=top_opp,
        calendly_url=calendly,
    )
    res = await send_email(audit["contactEmail"], tpl["subject"], tpl["html"])
    await db.email_logs.insert_one({
        "id": __import__("uuid").uuid4().__str__(),
        "auditId": audit_id,
        "template": "audit_report_ready_resend",
        "toEmail": audit["contactEmail"],
        "subject": tpl["subject"],
        "status": "sent" if res["ok"] else "failed",
        "providerEmailId": res.get("id"),
        "error": res.get("error"),
        "sentAt": datetime.now(timezone.utc).isoformat(),
    })
    return {"ok": res["ok"], "error": res.get("error")}
