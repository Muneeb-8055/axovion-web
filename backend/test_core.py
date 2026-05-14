"""
test_core.py — Phase 1 POC

Validates all third-party integrations needed for Axovion.io BEFORE building the app.
Tests: Groq, Kimi (backup), Resend, Vapi, Retell.

Run: cd /app/backend && python test_core.py
"""

import os
import json
import asyncio
import httpx
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")

# --- Config ---
GROQ_API_KEY = os.environ["GROQ_API_KEY"]
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
KIMI_API_KEY = os.environ["KIMI_API_KEY"]
KIMI_BASE_URL = os.environ.get("KIMI_BASE_URL", "https://api.moonshot.ai/v1")
KIMI_MODEL = os.environ.get("KIMI_MODEL", "kimi-k2-0905-preview")
RESEND_API_KEY = os.environ["RESEND_API_KEY"]
RESEND_FROM = f'{os.environ.get("RESEND_FROM_NAME", "Axovion AI")} <{os.environ["RESEND_FROM_EMAIL"]}>'
VAPI_API_KEY = os.environ["VAPI_API_KEY"]
RETELL_API_KEY = os.environ["RETELL_API_KEY"]

# Color output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
END = "\033[0m"

def log_pass(name, detail=""):
    print(f"{GREEN}✓ PASS{END} — {name}: {detail}")

def log_fail(name, detail=""):
    print(f"{RED}✗ FAIL{END} — {name}: {detail}")

def log_info(name, detail=""):
    print(f"{BLUE}ℹ INFO{END} — {name}: {detail}")

def section(title):
    print(f"\n{YELLOW}{'='*70}\n{title}\n{'='*70}{END}")


# ============================================================
# TEST 1: Groq Chat Completion (chatbot core)
# ============================================================
async def test_groq_chat():
    section("TEST 1: Groq Chat Completion (Llama 3.3 70B Versatile)")
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": GROQ_MODEL,
                    "messages": [
                        {"role": "system", "content": "You are Axovion AI, a helpful AI automation expert."},
                        {"role": "user", "content": "In one sentence: what does Axovion do?"},
                    ],
                    "temperature": 0.7,
                    "max_tokens": 100,
                },
            )
            r.raise_for_status()
            data = r.json()
            content = data["choices"][0]["message"]["content"]
            log_pass("Groq chat", f"response='{content[:80]}...'")
            return True
    except Exception as e:
        log_fail("Groq chat", str(e))
        return False


# ============================================================
# TEST 2: Groq Audit Analysis (Structured JSON Output)
# ============================================================
async def test_groq_audit_json():
    section("TEST 2: Groq Audit Analysis — Structured JSON Report Generation")
    audit_data = {
        "businessName": "Acme E-commerce",
        "industry": "E-commerce / DTC",
        "websiteUrl": "https://acme.example",
        "monthlyRevenue": "$80,000",
        "employees": 12,
        "repetitiveTasks": "Answering shipping questions, processing returns, abandoned cart follow-up",
        "tools": ["Shopify", "Klaviyo", "Gorgias"],
        "supportVolume": "~400 tickets/week",
        "leadsPerMonth": "300",
        "bottleneck": "Support team overwhelmed; slow first response",
        "budget": "$5,000-$10,000",
    }

    system_prompt = (
        "You are an AI automation consultant for Axovion.io. Analyze the given business "
        "and produce a strict JSON audit report. Respond with ONLY valid JSON, no markdown."
    )

    user_prompt = f"""Analyze this business and create a JSON audit report.

Business Data:
{json.dumps(audit_data, indent=2)}

Return ONLY valid JSON in this exact schema:
{{
  "executive_summary": "string (3-4 sentence summary)",
  "opportunities": [
    {{
      "title": "string",
      "description": "string",
      "estimated_hours_saved_per_month": number,
      "monthly_savings_usd": number,
      "priority": "high" | "medium" | "low"
    }}
  ],
  "total_monthly_savings_usd": number,
  "total_hours_saved_per_month": number,
  "recommended_agents": [
    {{
      "name": "string",
      "description": "string",
      "setup_cost_estimate_usd": number,
      "implementation_days": number
    }}
  ],
  "workflow_map": [
    {{"step": number, "title": "string", "description": "string"}}
  ],
  "implementation_timeline_days": number,
  "priority_ranking": ["string"]
}}"""

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            r = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": GROQ_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "temperature": 0.4,
                    "max_tokens": 2000,
                    "response_format": {"type": "json_object"},
                },
            )
            r.raise_for_status()
            data = r.json()
            content = data["choices"][0]["message"]["content"]
            parsed = json.loads(content)

            assert "executive_summary" in parsed, "missing executive_summary"
            assert "opportunities" in parsed, "missing opportunities"
            assert isinstance(parsed["opportunities"], list), "opportunities not list"
            assert "total_monthly_savings_usd" in parsed, "missing total_monthly_savings_usd"

            log_pass("Groq audit JSON",
                     f"opportunities={len(parsed['opportunities'])}, "
                     f"savings=${parsed['total_monthly_savings_usd']}/mo, "
                     f"agents={len(parsed.get('recommended_agents', []))}")
            log_info("sample executive_summary", parsed["executive_summary"][:120] + "...")
            return True
    except Exception as e:
        log_fail("Groq audit JSON", str(e))
        return False


# ============================================================
# TEST 3: Kimi Backup
# ============================================================
async def test_kimi_chat():
    section("TEST 3: Kimi (Moonshot) Chat — Backup LLM")
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                f"{KIMI_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {KIMI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": KIMI_MODEL,
                    "messages": [
                        {"role": "user", "content": "Say 'Axovion ready' and nothing else."}
                    ],
                    "temperature": 0.3,
                    "max_tokens": 30,
                },
            )
            r.raise_for_status()
            data = r.json()
            content = data["choices"][0]["message"]["content"]
            log_pass("Kimi chat", f"response='{content[:50]}'")
            return True
    except Exception as e:
        # Kimi is backup-only, so we log but don't block
        log_info("Kimi chat (non-blocking)", f"unavailable: {str(e)[:120]}")
        return None  # None = skipped/non-blocking


# ============================================================
# TEST 4: Resend Send Email
# ============================================================
async def test_resend():
    section("TEST 4: Resend Email Send")
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": RESEND_FROM,
                    "to": ["delivered@resend.dev"],  # Resend test address
                    "subject": "[Axovion POC Test] Integration Validation",
                    "html": "<h1>Axovion.io</h1><p>This is a POC test email.</p>",
                },
            )
            if r.status_code in (200, 201, 202):
                data = r.json()
                log_pass("Resend send", f"email_id={data.get('id', 'unknown')}")
                return True
            else:
                log_fail("Resend send", f"HTTP {r.status_code}: {r.text[:300]}")
                return False
    except Exception as e:
        log_fail("Resend send", str(e))
        return False


# ============================================================
# TEST 5: Vapi API Auth (list assistants, no real call)
# ============================================================
async def test_vapi_auth():
    section("TEST 5: Vapi API Authentication")
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.get(
                "https://api.vapi.ai/assistant",
                headers={"Authorization": f"Bearer {VAPI_API_KEY}"},
                params={"limit": 1},
            )
            if r.status_code == 200:
                data = r.json()
                count = len(data) if isinstance(data, list) else data.get("count", 0)
                log_pass("Vapi auth", f"status=200, assistants_returned={count}")
                return True
            elif r.status_code == 401:
                log_fail("Vapi auth", "Unauthorized (401)")
                return False
            else:
                log_fail("Vapi auth", f"HTTP {r.status_code}: {r.text[:300]}")
                return False
    except Exception as e:
        log_fail("Vapi auth", str(e))
        return False


# ============================================================
# TEST 6: Retell API Auth (list agents, no real call)
# ============================================================
async def test_retell_auth():
    section("TEST 6: Retell API Authentication")
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            # Retell uses /list-agents endpoint
            r = await client.get(
                "https://api.retellai.com/list-agents",
                headers={"Authorization": f"Bearer {RETELL_API_KEY}"},
            )
            if r.status_code == 200:
                data = r.json()
                count = len(data) if isinstance(data, list) else 0
                log_pass("Retell auth", f"status=200, agents_returned={count}")
                return True
            elif r.status_code == 401:
                log_fail("Retell auth", "Unauthorized (401)")
                return False
            else:
                log_info("Retell auth (non-blocking)", f"HTTP {r.status_code}: {r.text[:200]}")
                return None  # Retell is alternative, non-blocking
    except Exception as e:
        log_info("Retell auth (non-blocking)", str(e))
        return None


# ============================================================
# Runner
# ============================================================
async def main():
    print(f"\n{YELLOW}{'#'*70}\n# Axovion.io Phase 1 POC — Integration Validation\n{'#'*70}{END}")

    results = {
        "Groq chat": await test_groq_chat(),
        "Groq audit JSON": await test_groq_audit_json(),
        "Kimi chat (backup)": await test_kimi_chat(),
        "Resend email": await test_resend(),
        "Vapi auth": await test_vapi_auth(),
        "Retell auth (alternative)": await test_retell_auth(),
    }

    section("SUMMARY")
    blocking_failed = []
    for name, ok in results.items():
        if ok is True:
            print(f"  {GREEN}✓{END} {name}")
        elif ok is None:
            print(f"  {YELLOW}⊘{END} {name} (non-blocking, skipped)")
        else:
            print(f"  {RED}✗{END} {name}")
            # Kimi & Retell are alternatives, not blocking
            if "backup" not in name.lower() and "alternative" not in name.lower():
                blocking_failed.append(name)

    print()
    if blocking_failed:
        print(f"{RED}❌ {len(blocking_failed)} blocking test(s) failed: {', '.join(blocking_failed)}{END}")
        print(f"{RED}DO NOT proceed to app build until fixed.{END}\n")
        return 1
    else:
        print(f"{GREEN}✅ ALL BLOCKING TESTS PASSED — Safe to proceed with app build.{END}\n")
        return 0


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    raise SystemExit(exit_code)
