"""
The Authority & Inbound Content Engine (Pillar 1).
Generates viral, high-converting LinkedIn posts, Twitter/X threads, and lead magnets
establishing Muhammad Hamza Zafar and Axovion.io as industry leaders in AI automation.
"""

from brain import brain


def generate_content(topic=None, format_type="linkedin"):
    """
    Generates high-performing social content.
    format_type: 'linkedin' or 'twitter' or 'lead_magnet'
    """
    system_prompt = """You are an elite ghostwriter for Muhammad Hamza Zafar, Co-Founder & Head of Automation at Axovion.io (https://www.axovion.io).
Axovion builds production-grade AI agents for business workflows (support, lead qualification, booking, CRM sync).

Your writing principles:
- Hook fast: The first line must stop the scroll immediately. Contrast expectation vs reality.
- No corporate fluff: Never use words like 'delve', 'revolutionize', 'game-changer', or 'tapestry'. Use concrete numbers, real operations, and architectural insights.
- Show, don't tell: Break down how modern agents actually work (e.g., triage vs router vs worker agents).
- Call to Action: Every post ends with an invitation to get an audit or book a 15-minute workflow map."""

    user_prompts = {
        "linkedin": f"""Write a powerful, viral LinkedIn post for Muhammad Hamza Zafar about: {topic or 'Why hiring 3 full-time reps for lead qualification is obsolete in 2026'}.
Include:
1. Hard-hitting 1-line hook
2. The real problem businesses face with slow lead response times
3. The 3-step autonomous agent pipeline that fixes it
4. Clear Call to Action inviting readers to comment 'AUDIT' or DM for a free workflow map.""",

        "twitter": f"""Write an engaging Twitter / X thread (4 to 5 tweets) for Muhammad Hamza Zafar about: {topic or 'How we build production-grade AI agents that run unattended'}.
Tweet 1 must be a killer hook.
Tweets 2-4 break down the operational architecture.
Tweet 5 links to axovion.io with an audit CTA.""",

        "lead_magnet": f"""Write a high-converting inbound 'Hand-Raiser' post for LinkedIn about: {topic or 'Free AI Workflow Audit for Service Businesses'}.
The goal is to get 20+ business owners to comment on the post so our agent can DM them in private."""
    }

    selected_prompt = user_prompts.get(format_type, user_prompts["linkedin"])

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": selected_prompt},
    ]

    print(f"[*] Generating {format_type.upper()} content ...")
    return brain.generate(messages, temperature=0.75, max_tokens=1000)


if __name__ == "__main__":
    import sys

    fmt = sys.argv[1] if len(sys.argv) > 1 else "linkedin"
    top = sys.argv[2] if len(sys.argv) > 2 else None
    post = generate_content(topic=top, format_type=fmt)
    print("\n" + "=" * 60)
    print(f"GENERATED {fmt.upper()} POST")
    print("=" * 60)
    print(post)
