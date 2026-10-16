#!/usr/bin/env python3
"""
Axovion Growth Agent — Unified Command Center.
Run audits, generate thought-leadership posts, and close prospect DMs.
"""

import sys
import os
from brain import brain
from audit_agent import generate_audit_proposal
from content_agent import generate_content
from closer_agent import reply_to_prospect
from outbound_agent import dispatch_proposal


def print_banner():
    print("""
============================================================
              AXOVION AI GROWTH MACHINE (v1.0)
         Built for Muhammad Hamza Zafar & Axovion.io
============================================================
    """)


def test_connection():
    print(f"[*] Testing connection with Provider: '{brain.provider.upper()}' ...")
    try:
        res = brain.generate(
            [{"role": "user", "content": "Respond with 1 sentence confirming you are online and ready to close clients."}],
            max_tokens=50
        )
        print(f"[+] CONNECTION SUCCESSFUL!\n    Brain Response: \"{res}\"")
        return True
    except Exception as e:
        print(f"[-] CONNECTION FAILED: {e}")
        print("\nTip: Make sure you have created growth-agent/.env and filled in your API key.")
        return False


def main():
    print_banner()

    if len(sys.argv) < 2:
        print("Usage:")
        print("  python3 run.py test                     # Test AI Brain connection")
        print("  python3 run.py audit <website_url>      # Run automated prospect teardown & pitch")
        print("  python3 run.py post [topic]             # Generate daily LinkedIn authority post")
        print("  python3 run.py tweet [topic]            # Generate Twitter / X thread")
        print("  python3 run.py reply <Name> <Message>   # Generate closing reply to an inbound lead")
        print("\nInteractive Menu:")
        print("  1. Run Prospect Audit on a Website")
        print("  2. Generate LinkedIn Authority Post")
        print("  3. Draft Response to a Prospect DM")
        print("  4. Test AI Brain Connection")
        
        choice = input("\nSelect an option (1-4) or press Enter to exit: ").strip()
        if choice == "1":
            target = input("Enter prospect website or company name: ").strip()
            if target:
                res = generate_audit_proposal(target)
                print("\n" + res)
        elif choice == "2":
            topic = input("Enter post topic (or press Enter for default): ").strip()
            res = generate_content(topic=topic or None, format_type="linkedin")
            print("\n" + res)
        elif choice == "3":
            name = input("Prospect Name: ").strip() or "Prospect"
            msg = input("Prospect Message: ").strip()
            if msg:
                res = reply_to_prospect(name, msg)
                print("\n" + res)
        elif choice == "4":
            test_connection()
        return

    cmd = sys.argv[1].lower()

    if cmd == "test":
        test_connection()

    elif cmd == "audit":
        target = sys.argv[2] if len(sys.argv) > 2 else "https://axovion.io"
        res = generate_audit_proposal(target)
        print("\n" + res)

    elif cmd == "post":
        topic = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else None
        res = generate_content(topic=topic, format_type="linkedin")
        print("\n" + res)

    elif cmd == "tweet":
        topic = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else None
        res = generate_content(topic=topic, format_type="twitter")
        print("\n" + res)

    elif cmd == "reply":
        name = sys.argv[2] if len(sys.argv) > 2 else "Lead"
        msg = " ".join(sys.argv[3:]) if len(sys.argv) > 3 else "Can you tell me more about pricing?"
        res = reply_to_prospect(name, msg)
        print("\n" + res)

    elif cmd == "send":
        if len(sys.argv) < 4:
            print("Usage: python3 run.py send <recipient_email> <subject> [message_or_file_path]")
            return
        recipient = sys.argv[2]
        subject = sys.argv[3]
        if len(sys.argv) > 4:
            content_arg = sys.argv[4]
            if os.path.exists(content_arg):
                with open(content_arg, "r") as f:
                    body = f.read()
            else:
                body = " ".join(sys.argv[4:])
        else:
            body = "Hello,\n\nFollowing up on our automation audit for your team."

        print(f"[*] Dispatching outreach to: {recipient} ...")
        res = dispatch_proposal(recipient, subject, body)
        if res.get("success"):
            print(f"[+] OUTREACH SENT SUCCESSFULLY via {res.get('channel')}!")
        else:
            print(f"[-] DISPATCH FAILED: {res.get('error')}")
            if "details" in res:
                print(f"    Details: {res.get('details')}")

    else:
        print(f"Unknown command: '{cmd}'. Run 'python3 run.py' for help.")


if __name__ == "__main__":
    main()
