"""Resend email service."""
import os
import httpx
from typing import Optional

RESEND_API_KEY = os.environ["RESEND_API_KEY"]
RESEND_FROM_EMAIL = os.environ.get("RESEND_FROM_EMAIL", "onboarding@resend.dev")
RESEND_FROM_NAME = os.environ.get("RESEND_FROM_NAME", "Axovion AI")
RESEND_URL = "https://api.resend.com/emails"


async def send_email(to: str, subject: str, html: str, from_email: Optional[str] = None) -> dict:
    """Send a single email via Resend. Returns {ok, id, error}."""
    sender = f"{RESEND_FROM_NAME} <{from_email or RESEND_FROM_EMAIL}>"
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                RESEND_URL,
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={"from": sender, "to": [to], "subject": subject, "html": html},
            )
            if r.status_code in (200, 201, 202):
                return {"ok": True, "id": r.json().get("id"), "error": None}
            return {"ok": False, "id": None, "error": f"HTTP {r.status_code}: {r.text[:300]}"}
    except Exception as e:
        return {"ok": False, "id": None, "error": str(e)}


# ============ EMAIL TEMPLATES ============
BASE_STYLES = """
  body { background:#0A0A0F; color:#C0C0C8; font-family: -apple-system, 'Segoe UI', Roboto, Inter, sans-serif; margin:0; padding:0; }
  .container { max-width:600px; margin:0 auto; padding:32px 24px; }
  .card { background:#12121A; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:32px; margin:16px 0; }
  h1 { color:#FFF; font-size:28px; font-weight:800; margin:0 0 16px; letter-spacing:-0.02em; }
  h2 { color:#FFF; font-size:20px; font-weight:700; margin:24px 0 12px; }
  p { color:#C0C0C8; font-size:15px; line-height:1.65; margin:0 0 12px; }
  .cta { display:inline-block; background:#F97316; color:#0A0A0F !important; padding:14px 28px; border-radius:12px; text-decoration:none; font-weight:700; font-size:15px; margin:16px 0; }
  .cyan { color:#00D4FF; font-weight:600; }
  .silver { color:rgba(192,192,200,0.7); font-size:13px; }
  .divider { height:1px; background:rgba(255,255,255,0.08); margin:24px 0; }
  .brand { color:#FFF; font-weight:800; font-size:22px; letter-spacing:-0.01em; }
  ul { padding-left:20px; }
  li { color:#C0C0C8; margin:6px 0; }
"""


def _wrap(content_html: str, footer_text: str = "") -> str:
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{BASE_STYLES}</style></head>
<body><div class="container">
  <div style="text-align:left; padding-bottom:8px;">
    <span class="brand">Axovion<span class="cyan">.io</span></span>
    <div class="silver" style="letter-spacing:0.18em; text-transform:uppercase; font-size:11px; margin-top:4px;">Automate to Win</div>
  </div>
  {content_html}
  <div class="divider"></div>
  <p class="silver">{footer_text or 'Sent by Axovion.io — AI automation agency.'}</p>
  <p class="silver">If you no longer wish to receive these emails, simply ignore this message.</p>
</div></body></html>"""


def tpl_audit_submitted(name: str, business_name: str) -> dict:
    html = _wrap(f"""
      <div class="card">
        <h1>Your AI Audit is being prepared</h1>
        <p>Hi {name or 'there'},</p>
        <p>Thanks for submitting your AI Audit for <strong style="color:#FFF">{business_name}</strong>. Our AI is analyzing your business now.</p>
        <h2>What you'll get</h2>
        <ul>
          <li>Automation Opportunity Map</li>
          <li>Estimated ROI &amp; Monthly Savings</li>
          <li>Recommended AI Agents</li>
          <li>Implementation Timeline</li>
        </ul>
        <p>Your interactive report is already live — check the next email for the link.</p>
      </div>
    """)
    return {"subject": f"Your AI Audit is being prepared — Axovion.io", "html": html}


def tpl_audit_report_ready(name: str, business_name: str, report_url: str, monthly_savings: float, top_opportunity: str, calendly_url: str) -> dict:
    savings_str = f"${int(monthly_savings):,}/mo"
    html = _wrap(f"""
      <div class="card">
        <h1>Your AI Audit Report is ready</h1>
        <p>Hi {name or 'there'},</p>
        <p>Your custom AI automation audit for <strong style="color:#FFF">{business_name}</strong> is ready to view.</p>
        <p style="font-size:17px;"><span class="cyan">Top finding:</span> You could save approximately <strong style="color:#FFF">{savings_str}</strong> by automating <strong style="color:#FFF">{top_opportunity}</strong>.</p>
        <p><a href="{report_url}" class="cta">View Your Interactive Report</a></p>
        <h2>Want to discuss implementation?</h2>
        <p>Book a free 15-30 minute strategy call:</p>
        <p><a href="{calendly_url}" class="cta" style="background:#12121A; color:#FFF !important; border:1px solid rgba(0,212,255,0.35);">Book a Strategy Call</a></p>
      </div>
    """)
    return {"subject": f"Your AI Audit Report is ready — {business_name}", "html": html}


def tpl_booking_confirmation(name: str) -> dict:
    html = _wrap(f"""
      <div class="card">
        <h1>Thanks for booking</h1>
        <p>Hi {name or 'there'},</p>
        <p>Thanks for reaching out. We'll be in touch shortly to confirm a time for our call.</p>
        <p>In the meantime, if you haven't already, run the free <span class="cyan">AI Audit</span> — it gives us context for a much more focused call.</p>
      </div>
    """)
    return {"subject": "We received your booking — Axovion.io", "html": html}


def tpl_newsletter_welcome() -> dict:
    html = _wrap("""
      <div class="card">
        <h1>You're in.</h1>
        <p>Welcome to the Axovion list. Every week we send 1 short note: a real automation we shipped (or one we recommend), how it was built, the ROI numbers.</p>
        <p>No fluff. Unsubscribe anytime.</p>
      </div>
    """)
    return {"subject": "You're in — Axovion.io weekly", "html": html}
