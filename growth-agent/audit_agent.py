"""
The Prospect Auditor & Proposal Machine (Pillar 2).
Analyzes any prospective client's website or business model, identifies automation bottlenecks,
and writes high-converting, personalized audit pitches signed by Muhammad Hamza Zafar.
"""

import os
import re
import urllib.request
from brain import brain


def extract_website_text(url, timeout=10):
    """Scrapes clean text from a target website to analyze its business model."""
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    }

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw_html = resp.read().decode("utf-8", errors="ignore")

        # Strip scripts, styles, and tags
        text = re.sub(r"<(script|style).*?</\1>", " ", raw_html, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"<[^>]+>", " ", text)
        clean_text = " ".join(text.split())
        return clean_text[:3500]  # First 3,500 characters of high-signal content
    except Exception as e:
        return f"[Note: Website scrape timed out or was blocked. Operating on domain name: {url}. Error: {e}]"


def generate_audit_proposal(target, is_url=True):
    """
    Runs an automated bottleneck audit and outputs a personalized pitch.
    target: Either a website URL or a text description of the company/niche.
    """
    if is_url:
        print(f"[*] Scanning prospect website: {target} ...")
        context = extract_website_text(target)
    else:
        context = target

    system_prompt = """You are Muhammad Hamza Zafar, Co-Founder & Head of Automation at Axovion.io (https://www.axovion.io).
Axovion builds ROI-focused AI automation agents that eliminate repetitive manual work, automate 24/7 customer support, and capture high-intent leads instantly.

Your goal is to perform a sharp, value-first operational audit on the prospect's business and write a non-spammy, highly consultative outreach message.

Framework to follow:
1. SPECIFIC BOTTLENECK: Identify where their current workflow is leaking leads or wasting human hours (e.g., slow response to web forms, after-hours booking drop-off, manual inbox triage).
2. THE EXACT AGENT BLUEPRINT: Outline the specific multi-agent workflow Axovion would deploy in 5 days to solve it.
3. MEASURABLE ROI: Calculate estimated hours saved per week or extra appointments captured.
4. LOW-FRICTION CALL TO ACTION: Offer a free 15-minute architecture mapping or live demo with no obligation.

Tone: Direct, technical yet commercial, zero corporate buzzwords, zero fluff. Sound like a serious engineer who solves expensive business problems."""

    user_prompt = f"""Here is the target business information:
---
{context}
---

Please produce a complete Prospect Intelligence & Proposal Dossier containing:
1. Target Summary (Industry & Core Offer)
2. The Top 2 Operational Bottlenecks Detected
3. The Proposed Axovion Agent Architecture
4. The Outreach Message (Formatted ready to send via LinkedIn DM, Upwork proposal, or Email, signed by Muhammad Hamza Zafar, Co-Founder & Head of Automation at Axovion.io)"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    print("[*] Generating intelligence dossier with AI Brain ...")
    return brain.generate(messages, temperature=0.6, max_tokens=1400)


if __name__ == "__main__":
    import sys

    target_input = sys.argv[1] if len(sys.argv) > 1 else "https://axovion.io"
    is_url_input = target_input.startswith("http") or "." in target_input
    result = generate_audit_proposal(target_input, is_url=is_url_input)
    print("\n" + "=" * 60)
    print("PROSPECT AUDIT DOSSIER")
    print("=" * 60)
    print(result)
