"""
test_endpoints.py — Admin/Employee API smoke test.

Logs in as admin (and a temp employee) and hits every endpoint the panels use,
reporting which ones fail with their status code. Run while the server is up:

    cd backend && .\\venv\\Scripts\\python.exe test_endpoints.py
"""
import os
import asyncio
import httpx
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")

BASE = os.environ.get("TEST_BASE_URL", "http://localhost:8000/api")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@axovion.io")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "AxovionAdmin2025!")

GREEN = "\033[92m"; RED = "\033[91m"; YELLOW = "\033[93m"; BLUE = "\033[94m"; END = "\033[0m"

results = []  # (name, ok, detail)


def record(name, ok, detail=""):
    tag = f"{GREEN}PASS{END}" if ok else f"{RED}FAIL{END}"
    print(f"  [{tag}] {name} — {detail}")
    results.append((name, ok, detail))


async def hit(client, method, path, name, *, token=None, json=None, ok_codes=(200, 201)):
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    try:
        r = await client.request(method, f"{BASE}{path}", headers=headers, json=json)
        if r.status_code in ok_codes:
            record(name, True, f"{method} {path} -> {r.status_code}")
            return r.json() if r.content else None
        else:
            body = r.text[:160].replace("\n", " ")
            record(name, False, f"{method} {path} -> {r.status_code}: {body}")
            return None
    except Exception as e:
        record(name, False, f"{method} {path} -> EXC {str(e)[:160]}")
        return None


async def main():
    month = datetime.now(timezone.utc).strftime("%Y-%m")
    async with httpx.AsyncClient(timeout=30) as client:
        print(f"\n{YELLOW}=== PUBLIC / CUSTOMER-FACING ==={END}")
        await hit(client, "GET", "/", "api root", ok_codes=(200,))
        await hit(client, "GET", "/health", "health check", ok_codes=(200,))
        await hit(client, "GET", "/settings", "public settings", ok_codes=(200,))
        await hit(client, "POST", "/newsletter", "newsletter signup",
                  json={"email": f"news_{datetime.now(timezone.utc).strftime('%H%M%S')}@example.com", "source": "test"})
        await hit(client, "POST", "/booking", "create booking",
                  json={"name": "Test Lead", "email": "lead@example.com", "phone": "123",
                        "message": "interested", "source": "contact-form"})
        sess = f"sess_{datetime.now(timezone.utc).strftime('%H%M%S')}"
        await hit(client, "POST", "/chat", "public chat send",
                  json={"sessionId": sess, "message": "What does Axovion do?"})
        await hit(client, "GET", f"/chat/{sess}", "public get chat", ok_codes=(200,))
        audit = await hit(client, "POST", "/audit", "submit audit",
                          json={"businessName": "SmokeBiz", "industry": "E-commerce",
                                "websiteUrl": "https://smoke.example", "contactEmail": "smoke@example.com",
                                "contactName": "Smoke", "mainGoal": "automate support"})
        if audit and audit.get("id"):
            await hit(client, "GET", f"/audit/report/{audit['id']}", "get audit report (public)", ok_codes=(200,))

        print(f"\n{YELLOW}=== AUTH ==={END}")
        login = await hit(client, "POST", "/auth/login", "admin login",
                          json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        if not login or not login.get("token"):
            print(f"{RED}Admin login failed — cannot continue.{END}")
            return 1
        token = login["token"]
        role = login["user"].get("role")
        record("admin is super_admin", role == "super_admin", f"role={role}")

        print(f"\n{YELLOW}=== ADMIN: CORE PANELS ==={END}")
        await hit(client, "GET", "/auth/me", "auth/me", token=token)
        await hit(client, "GET", "/analytics/dashboard", "dashboard", token=token)
        await hit(client, "GET", "/analytics/funnel", "analytics funnel", token=token)
        await hit(client, "GET", "/analytics/timeseries?days=14", "analytics timeseries", token=token)
        await hit(client, "GET", "/analytics/sources", "analytics sources", token=token)
        await hit(client, "GET", "/audits", "list audits", token=token)
        await hit(client, "GET", "/chats", "list chats", token=token)
        await hit(client, "GET", "/bookings", "list bookings", token=token)
        await hit(client, "GET", "/emails", "list emails", token=token)
        await hit(client, "GET", "/tasks", "list tasks", token=token)
        await hit(client, "GET", "/settings/admin", "get settings", token=token)
        await hit(client, "GET", "/newsletter/list", "newsletter list", token=token)
        await hit(client, "GET", "/recycle-bin", "recycle bin", token=token)
        await hit(client, "GET", "/notifications", "notifications", token=token)

        print(f"\n{YELLOW}=== ADMIN: EMS PANELS ==={END}")
        await hit(client, "GET", "/employees", "list employees", token=token)
        await hit(client, "GET", "/attendance", "list attendance", token=token)
        await hit(client, "GET", "/attendance/pending", "pending attendance", token=token)
        await hit(client, "GET", "/leaves", "list leaves", token=token)
        await hit(client, "GET", "/overtime", "list overtime", token=token)
        await hit(client, "GET", f"/reports/monthly-summary/{month}", "report monthly-summary", token=token)
        await hit(client, "GET", f"/reports/leave-usage/{month}", "report leave-usage", token=token)
        await hit(client, "GET", f"/reports/attendance-rates/{month}", "report attendance-rates", token=token)
        await hit(client, "GET", f"/reports/target-missers/{month}", "report target-missers", token=token)
        await hit(client, "GET", f"/reports/overtime-tracking/{month}", "report overtime-tracking", token=token)

        print(f"\n{YELLOW}=== EMPLOYEE LIFECYCLE (create -> use -> delete -> restore) ==={END}")
        ts = datetime.now(timezone.utc).strftime("%H%M%S")
        emp_email = f"smoketest_{ts}@axovion.io"
        emp = await hit(client, "POST", "/employees", "create employee", token=token,
                        json={"name": "Smoke Test", "email": emp_email, "password": "Test12345!", "role": "employee"})
        emp_id = emp.get("id") if emp else None

        emp_token = None
        if emp_id:
            await hit(client, "GET", f"/employees/{emp_id}", "get employee", token=token)
            await hit(client, "GET", f"/employees/{emp_id}/profile-summary", "employee profile-summary", token=token)

            # Login as the employee
            elogin = await hit(client, "POST", "/auth/login", "employee login",
                               json={"email": emp_email, "password": "Test12345!"})
            emp_token = elogin.get("token") if elogin else None

        if emp_token:
            print(f"\n{YELLOW}=== EMPLOYEE PORTAL ENDPOINTS ==={END}")
            await hit(client, "GET", "/employees/me", "emp: my profile", token=emp_token)
            await hit(client, "GET", "/attendance/my/summary", "emp: my summary", token=emp_token)
            await hit(client, "GET", "/attendance/my", "emp: my attendance", token=emp_token)
            await hit(client, "GET", "/leaves/my", "emp: my leaves", token=emp_token)
            await hit(client, "GET", "/leaves/balance/my", "emp: my leave balance", token=emp_token)
            await hit(client, "GET", "/overtime/my", "emp: my overtime", token=emp_token)
            await hit(client, "GET", "/tasks/my", "emp: my tasks", token=emp_token)
            await hit(client, "GET", "/notifications", "emp: notifications", token=emp_token)

            # Apply for a leave (with reason)
            leave = await hit(client, "POST", "/leaves", "emp: apply leave", token=emp_token,
                              json={"date": f"{month}-15", "type": "half", "reason": "smoke test reason"})
            leave_id = leave.get("id") if leave else None
            if leave_id:
                await hit(client, "PUT", f"/leaves/{leave_id}/approve", "admin: approve leave", token=token)

        print(f"\n{YELLOW}=== TASK LIFECYCLE (create -> edit -> feedback -> delete) ==={END}")
        task = await hit(client, "POST", "/tasks", "create task", token=token,
                         json={"title": "Smoke task", "description": "d", "priority": "medium",
                               "status": "todo", "assignee": emp_id})
        task_id = task.get("id") if task else None
        if task_id:
            await hit(client, "PUT", f"/tasks/{task_id}", "edit task", token=token,
                      json={"title": "Smoke task edited", "description": "d2", "priority": "high",
                            "status": "in-progress", "assignee": emp_id})
            if emp_token:
                await hit(client, "POST", f"/tasks/{task_id}/feedback", "emp: task feedback", token=emp_token,
                          json={"message": "cannot complete, blocked"})
                await hit(client, "PUT", f"/tasks/{task_id}/resolve-issue", "admin: resolve issue", token=token)
            await hit(client, "DELETE", f"/tasks/{task_id}", "delete task (soft)", token=token)

        print(f"\n{YELLOW}=== RECYCLE BIN RESTORE/PURGE ==={END}")
        bin_items = await hit(client, "GET", "/recycle-bin", "recycle bin after deletes", token=token)
        if isinstance(bin_items, list):
            task_entry = next((b for b in bin_items if b.get("originalCollection") == "tasks"), None)
            if task_entry:
                await hit(client, "POST", f"/recycle-bin/{task_entry['id']}/restore", "restore task", token=token)
                # re-delete then purge to clean up
                await hit(client, "DELETE", f"/tasks/{task_entry['originalId']}", "re-delete task", token=token)
                bin2 = await hit(client, "GET", "/recycle-bin", "recycle bin reload", token=token)
                if isinstance(bin2, list):
                    te2 = next((b for b in bin2 if b.get("originalId") == task_entry["originalId"]), None)
                    if te2:
                        await hit(client, "DELETE", f"/recycle-bin/{te2['id']}", "purge task", token=token)

        # Cleanup: delete and purge the test employee
        if emp_id:
            print(f"\n{YELLOW}=== CLEANUP ==={END}")
            await hit(client, "DELETE", f"/employees/{emp_id}", "delete test employee", token=token)
            binx = await hit(client, "GET", "/recycle-bin?collection=users", "find deleted employee", token=token)
            if isinstance(binx, list):
                ux = next((b for b in binx if b.get("originalId") == emp_id), None)
                if ux:
                    await hit(client, "DELETE", f"/recycle-bin/{ux['id']}", "purge test employee", token=token)

        print(f"\n{YELLOW}=== CUSTOMER PORTAL (signup -> dashboard -> audit -> booking -> account) ==={END}")
        cts = datetime.now(timezone.utc).strftime("%H%M%S")
        cust_email = f"cust_{cts}@example.com"
        signup = await hit(client, "POST", "/customer/signup", "customer signup",
                           json={"name": "Cust Test", "email": cust_email, "password": "Pass12345!",
                                 "company": "TestCo", "phone": "123"})
        ctoken = signup.get("token") if signup else None
        if ctoken:
            await hit(client, "GET", "/customer/me", "customer me", token=ctoken)
            await hit(client, "PUT", "/customer/me", "customer update profile", token=ctoken,
                      json={"name": "Cust Test 2", "company": "TestCo2", "phone": "456"})
            await hit(client, "GET", "/customer/dashboard", "customer dashboard", token=ctoken)
            await hit(client, "GET", "/customer/audit/eligibility", "customer audit eligibility", token=ctoken)
            # First audit should succeed
            caudit = await hit(client, "POST", "/customer/audit", "customer submit audit (1st)", token=ctoken,
                               json={"businessName": "CustBiz", "industry": "SaaS",
                                     "websiteUrl": "https://custbiz.example", "contactEmail": "ignored@x.com",
                                     "mainGoal": "automate onboarding"})
            caudit_id = caudit.get("id") if caudit else None
            if caudit_id:
                await hit(client, "GET", f"/customer/audit/{caudit_id}", "customer get own audit", token=ctoken)
            # Second audit should be blocked (403)
            await hit(client, "POST", "/customer/audit", "customer 2nd audit blocked (expect 403)", token=ctoken,
                      json={"businessName": "CustBiz2", "industry": "SaaS",
                            "websiteUrl": "https://x2.example", "contactEmail": "x@x.com",
                            "mainGoal": "more automation"}, ok_codes=(403,))
            await hit(client, "POST", "/customer/booking", "customer create booking", token=ctoken,
                      json={"message": "want a call", "preferredTime": "mornings"})
            await hit(client, "PUT", "/customer/me/password", "customer change password", token=ctoken,
                      json={"currentPassword": "Pass12345!", "newPassword": "NewPass123!"})
            # Customer must NOT access admin endpoints
            await hit(client, "GET", "/employees", "customer blocked from admin (expect 403)", token=ctoken, ok_codes=(403,))

    # Summary
    print(f"\n{YELLOW}{'='*60}\nSUMMARY\n{'='*60}{END}")
    failed = [r for r in results if not r[1]]
    passed = [r for r in results if r[1]]
    print(f"  {GREEN}{len(passed)} passed{END}, {RED}{len(failed)} failed{END}, {len(results)} total")
    if failed:
        print(f"\n{RED}Failures:{END}")
        for name, _, detail in failed:
            print(f"  {RED}- {name}: {detail}{END}")
        return 1
    print(f"\n{GREEN}All endpoints OK.{END}")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
