"""Groq LLM service — powers chatbot + audit analysis."""
import os
import json
import httpx
from typing import List, Dict, Any, Optional

GROQ_API_KEY = os.environ["GROQ_API_KEY"]
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

CHATBOT_SYSTEM_PROMPT = """You are Axovion AI, the chatbot for Axovion.io — a premium AI automation agency that builds ROI-focused AI agents for businesses.

ABOUT AXOVION:
- We build AI agents that automate: customer support, lead follow-up, booking, e-commerce workflows, and abandoned cart recovery
- Services: Free AI Audit, Customer Support Chatbots (web + WhatsApp), Lead Gen & Follow-up, Booking Automation, E-commerce Support, AI Consulting
- Implementation: days to weeks, not quarters
- ROI-focused — we don't build tech-for-tech
- 100+ demos delivered, 2+ years building AI

YOUR JOB:
1. Answer questions about Axovion's services concisely and confidently
2. Push qualified visitors toward submitting the Free AI Audit (at /audit) or booking a call (at /contact)
3. If user asks about pricing: explain it depends on scope, recommend the AI Audit which is FREE and gives them a custom report with ROI estimates
4. If user shows buying intent: collect their email or WhatsApp and offer to have a strategist follow up
5. Keep responses tight: 2-4 sentences max unless explaining something complex
6. Be confident, direct, outcome-driven — never hype-y or apologetic

FAQ ANSWERS:
- Implementation time: "Days to a few weeks depending on scope. Most AI chatbots deploy in 7-14 days."
- Industries: "E-commerce, real estate, healthcare/clinics, agencies, SaaS, professional services"
- Cost: "Depends on scope. The AI Audit is FREE and gives you exact ROI numbers — start there."
- Data security: "Yes. We use enterprise-grade providers, your data stays yours, and we sign NDAs when needed."
- AI Audit: "Free deep-dive into your business — we analyze workflows, build an automation map, estimate ROI, and recommend specific AI agents. Takes 24h."

ALWAYS end actionable conversations with a clear next step (CTA)."""


async def chat_complete(
    messages: List[Dict[str, str]],
    system_prompt: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 600,
    json_mode: bool = False,
) -> str:
    """Single chat completion call."""
    msg_list = []
    if system_prompt:
        msg_list.append({"role": "system", "content": system_prompt})
    msg_list.extend(messages)

    payload = {
        "model": GROQ_MODEL,
        "messages": msg_list,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        r.raise_for_status()
        data = r.json()
        return data["choices"][0]["message"]["content"]


async def chatbot_response(thread_messages: List[Dict[str, str]], user_message: str) -> str:
    """Generate chatbot response for a user message."""
    history = [{"role": m["role"], "content": m["content"]} for m in thread_messages[-10:] if m["role"] in ("user", "assistant")]
    history.append({"role": "user", "content": user_message})
    return await chat_complete(
        messages=history,
        system_prompt=CHATBOT_SYSTEM_PROMPT,
        temperature=0.7,
        max_tokens=400,
    )


AUDIT_SYSTEM_PROMPT = """You are a senior AI automation consultant at Axovion.io. You analyze businesses and produce structured, ROI-focused automation audit reports.

RULES:
- Always respond with VALID JSON ONLY (no markdown, no code fences)
- Use realistic, conservative ROI estimates (don't inflate)
- Reference the SPECIFIC business data provided
- Recommended agents should be concrete, named offerings (e.g., "24/7 Support Chatbot", "Abandoned Cart Recovery Agent")
- Each opportunity must have a clear, single workflow being automated
- Use industry-standard hourly cost: $30-$50/hr for support, $50-$80/hr for sales
- Setup costs: typical AI agent build = $1,500 - $8,000 depending on complexity"""

AUDIT_JSON_SCHEMA = """{
  "executive_summary": "3-4 sentence summary tailored to this business",
  "opportunities": [
    {
      "title": "short title (e.g., 'Automate Customer Support')",
      "description": "2-3 sentence description of the workflow + how AI handles it",
      "estimated_hours_saved_per_month": <number>,
      "monthly_savings_usd": <number>,
      "priority": "high" | "medium" | "low"
    }
  ],
  "total_monthly_savings_usd": <number — sum of all opportunities>,
  "total_hours_saved_per_month": <number>,
  "recommended_agents": [
    {
      "name": "Agent name (e.g., '24/7 Support Chatbot')",
      "description": "What it does in 1-2 sentences",
      "setup_cost_estimate_usd": <number>,
      "implementation_days": <number>
    }
  ],
  "workflow_map": [
    {"step": <number>, "title": "Step name", "description": "What happens here"}
  ],
  "implementation_timeline_days": <number — total days for everything>,
  "priority_ranking": ["opportunity title 1", "opportunity title 2", ...]
}"""


async def generate_audit_report(audit_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate a structured audit report using Groq."""
    user_prompt = f"""Analyze this business and create a comprehensive AI automation audit report.

BUSINESS DATA:
{json.dumps(audit_data, indent=2, default=str)}

Return ONLY valid JSON matching this EXACT schema:
{AUDIT_JSON_SCHEMA}

Generate 3-5 opportunities, 2-4 recommended agents, and 3-5 workflow_map steps. Be specific to their industry and bottleneck."""

    content = await chat_complete(
        messages=[{"role": "user", "content": user_prompt}],
        system_prompt=AUDIT_SYSTEM_PROMPT,
        temperature=0.4,
        max_tokens=2500,
        json_mode=True,
    )
    parsed = json.loads(content)
    parsed["model_used"] = GROQ_MODEL
    return parsed
