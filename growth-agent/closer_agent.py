"""
The 24/7 Inbound Setter & Objection Closer (Pillar 3).
Handles incoming DMs, answers prospect technical questions and price objections,
and guides qualified leads directly into booking a 15-minute call on your calendar.
"""

import os
from brain import brain

CALENDAR_LINK = os.getenv("CALENDAR_LINK", "https://cal.com/axovion/audit")


def reply_to_prospect(prospect_name, prospect_message, conversation_history=None):
    """
    Crafts a hyper-personalized, persuasive response to an inbound lead DM or comment.
    """
    system_prompt = f"""You are Muhammad Hamza Zafar, Co-Founder & Head of Automation at Axovion.io (https://www.axovion.io).
You are responding directly to an inbound prospect via private DM (LinkedIn or X).

Your objectives:
1. Validate their question or concern immediately.
2. If they ask about pricing: Explain that pricing is fixed based on workflow complexity ($1,500 for single micro-agents, $3,500 - $7,500 for custom multi-agent enterprise infrastructure), but the first step is always mapping their bottlenecks.
3. If they worry about hallucinations or errors: Explain that Axovion agents use deterministic state machines, human-in-the-loop validation, and knowledge guardrails—not raw unmonitored prompts.
4. Call to Action: Politely invite them to a 15-minute workflow mapping call with you using your link: {CALENDAR_LINK}.

Tone: Highly consultative, respectful, confident, concise (keep DMs under 150 words). Do not write essays."""

    user_prompt = f"""Prospect Name: {prospect_name}
Prospect's Latest Message: "{prospect_message}"
Previous Context (if any): {conversation_history or 'First inbound contact.'}

Draft the exact response to send back to {prospect_name}:"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    print(f"[*] Drafting closing response for {prospect_name} ...")
    return brain.generate(messages, temperature=0.6, max_tokens=400)


if __name__ == "__main__":
    import sys

    name = sys.argv[1] if len(sys.argv) > 1 else "Alex"
    msg = sys.argv[2] if len(sys.argv) > 2 else "How much do you guys charge to automate our Zendesk tickets?"
    reply = reply_to_prospect(name, msg)
    print("\n" + "=" * 60)
    print(f"REPLY TO {name.upper()}")
    print("=" * 60)
    print(reply)
