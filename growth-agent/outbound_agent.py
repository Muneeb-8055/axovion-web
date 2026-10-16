"""
The Outbound Dispatcher (Pillar 4).
Transmits generated proposals and intelligence dossiers directly to prospects via:
1. SMTP (Gmail, Google Workspace, or Custom Domain)
2. Resend API (Free tier: 3,000 emails/month)
3. Webhook / CRM push (HubSpot, Slack alert)
"""

import os
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import urllib.request
import json
from brain import load_env

load_env()


def send_email_smtp(to_email, subject, body_text, body_html=None):
    """
    Sends cold outreach email via SMTP (Gmail App Password or Custom SMTP).
    Configured via .env:
      SMTP_HOST (default: smtp.gmail.com)
      SMTP_PORT (default: 465)
      SMTP_USER (e.g. hello@axovion.io or your gmail)
      SMTP_PASS (App Password)
    """
    host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    port = int(os.getenv("SMTP_PORT", 465))
    user = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASS")
    sender_name = os.getenv("SENDER_NAME", "Muhammad Hamza Zafar | Axovion")

    if not user or not password:
        return {
            "success": False,
            "error": "Missing SMTP_USER or SMTP_PASS in growth-agent/.env. The agent needs a mailbox to send from."
        }

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{sender_name} <{user}>"
    msg["To"] = to_email

    msg.attach(MIMEText(body_text, "plain", "utf-8"))
    if body_html:
        msg.attach(MIMEText(body_html, "html", "utf-8"))

    try:
        if port == 465:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(host, port, context=context) as server:
                server.login(user, password)
                server.sendmail(user, to_email, msg.as_string())
        else:
            with smtplib.SMTP(host, port) as server:
                server.starttls()
                server.login(user, password)
                server.sendmail(user, to_email, msg.as_string())

        return {"success": True, "channel": "SMTP", "recipient": to_email}
    except Exception as e:
        return {"success": False, "error": f"SMTP Error: {e}"}


def send_email_resend(to_email, subject, body_text):
    """
    Sends email via Resend API (Free 3,000 emails/month).
    Requires RESEND_API_KEY in .env.
    """
    api_key = os.getenv("RESEND_API_KEY")
    sender_email = os.getenv("SENDER_EMAIL", "hamza@axovion.io")

    if not api_key:
        return {
            "success": False,
            "error": "Missing RESEND_API_KEY in growth-agent/.env."
        }

    payload = {
        "from": f"Muhammad Hamza Zafar <{sender_email}>",
        "to": [to_email],
        "subject": subject,
        "text": body_text
    }

    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "AxovionGrowthAgent/1.0"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return {"success": True, "channel": "Resend", "id": data.get("id")}
    except Exception as e:
        return {"success": False, "error": f"Resend Error: {e}"}


def dispatch_proposal(to_email, subject, message):
    """
    Attempts to dispatch through configured channels in priority order:
    1. Resend API
    2. SMTP
    """
    if os.getenv("RESEND_API_KEY"):
        return send_email_resend(to_email, subject, message)
    if os.getenv("SMTP_USER") and os.getenv("SMTP_PASS"):
        return send_email_smtp(to_email, subject, message)

    return {
        "success": False,
        "error": "NO_DISPATCHER_CONFIGURED",
        "details": "The agent lacks outbound mailbox credentials (SMTP or Resend API key) to transmit emails into prospect inboxes."
    }
