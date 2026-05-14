# plan.md — Axovion.io Production Website Plan

## 1) Objectives
- Deliver a premium dark-luxury, AI-native Axovion.io website with fluid animations, full public site + full admin dashboard.
- Prove all external integrations (Groq/Kimi, Resend, Vapi, Retell) in isolation before building the app.
- Implement core public flows end-to-end: chatbot → saved transcript, audit form → AI report → email sequence, contact/booking capture.
- Provide admin tooling: view/manage audits, chats, bookings, tasks, analytics, email/call logs, settings.
- Ship SEO essentials (meta, sitemap/robots, JSON-LD) and responsive polish.

---

## 2) Implementation Steps (Phased)

### Phase 1 — Core POC: integrations in isolation (must pass before app build)
**Goal:** confirm keys, payload shapes, and minimal workflows work reliably.

**Steps**
1. Websearch/quick reference check for latest REST endpoints + required headers for:
   - Groq Chat Completions (Llama-3.3-70b-versatile)
   - Moonshot/Kimi chat completion (backup)
   - Resend send email API
   - Vapi API (create assistant / create call or validate auth)
   - Retell API (agent/call creation or validate auth)
2. Create `test_core.py` that runs:
   - Groq: simple chat completion + structured “audit JSON” generation
   - Kimi: simple completion fallback test
   - Resend: send a test email to a configured address (or log-only if needed)
   - Vapi: auth + list/create resource without placing a real call
   - Retell: auth + list/create resource without placing a real call
3. Run until all tests succeed; implement robust error logging + clear pass/fail output.
4. Decide final “core prompts” for:
   - Chatbot system prompt (brand voice, guardrails)
   - Audit analyzer prompt (strict JSON schema)

**Phase 1 user stories**
1. As a developer, I can call Groq and get a correct response so the chatbot is viable.
2. As a developer, I can generate a strict JSON audit report so the report page can render reliably.
3. As a developer, I can send email via Resend so automation can be productionized.
4. As a developer, I can authenticate to Vapi/Retell APIs so calling can be enabled.
5. As a developer, I can fall back to Kimi if Groq is unavailable.

**Exit criteria**
- `test_core.py` returns PASS for Groq + Resend + (Vapi & Retell auth checks). Kimi test passes as backup.

---

### Phase 2 — V1 App Development (core flows + premium UI; no OAuth yet)
**Goal:** ship working end-to-end public site + core admin capabilities fast, using proven POC code.

**Backend (FastAPI + MongoDB)**
1. Implement collections + models: `audits, audit_reports, chats, bookings, tasks, email_logs, call_logs, users, settings`.
2. Implement services:
   - `groq_service` (chat + audit JSON)
   - `kimi_service` (fallback)
   - `resend_service` (send + log)
   - `lead_scoring_service` (rule-based + AI assist)
3. Public APIs:
   - Chat: create message, fetch thread, persist transcript
   - Audit: submit form, generate report, persist, return report id
   - Contact/Booking: capture lead, send confirmation email
4. Admin APIs (email/password auth only):
   - Login + JWT
   - Audits CRUD + status transitions
   - Chats list/detail
   - Bookings list
   - Tasks kanban CRUD
   - Email logs list
   - Call logs list
   - Settings CRUD

**Frontend (React + Tailwind + shadcn/ui + GSAP)**
1. Global design system + layout:
   - Dark luxury palette, Inter/JetBrains Mono, consistent spacing, glassy surfaces
   - Navbar/footer with full routing
2. Public pages (fully navigable):
   - Home, Services, Results, About, Team, Blog, Contact
   - Audit, Audit Report (dynamic route)
3. Core components:
   - Floating chatbot (FAQ chips, lead capture option, transcript saved)
   - Audit form (validation, loading states, error handling)
   - Audit report viewer (tabs/sections) + ROI calculator
4. Premium animations:
   - Aurora hero background + headline reveal
   - Bento hover interactions + scroll reveals
   - Results metrics count-up on scroll
5. Initial admin UI:
   - `/admin/login` (email/password)
   - `/admin` layout + sidebar + key screens (Dashboard, Audits, Chats, Bookings, Tasks, Emails, Calls, Settings)

**Phase 2 user stories**
1. As a visitor, I can browse all pages with a premium, responsive UI and smooth animations.
2. As a visitor, I can chat with the Axovion AI and see helpful answers instantly.
3. As a visitor, I can submit an AI Audit and receive an instant, structured report.
4. As a visitor, I can adjust an ROI calculator and see savings update in real time.
5. As an admin, I can log in and view/manage audits, chats, bookings, and tasks.

**Testing checkpoint**
- Run one full end-to-end pass (public + admin) with the testing agent; fix all blocking issues.

---

### Phase 3 — Feature Expansion (production completeness)
**Goal:** fill in “complete site” requirements: automation sequences, lead scoring, manual triggers, richer analytics, content polish.

**Steps**
1. Email automation sequences:
   - On audit submission: confirmation + report link
   - Follow-up sequence (timed/manual trigger) + logging
2. AI Calling agent workflows:
   - Lead scoring thresholds → create call task/log
   - Manual “Call lead” from admin using Vapi (primary) + Retell fallback
3. Admin dashboard upgrades:
   - Advanced filters/search, bulk actions, export CSV
   - Audit detail page: status, notes, resend report
   - Analytics charts (conversions, sources, funnel)
4. Blog/newsletter:
   - Category filters + newsletter signup (Resend)
5. Security + hardening:
   - Rate limit key endpoints (chat/audit)
   - Input sanitization + server-side validation

**Phase 3 user stories**
1. As a lead, I receive branded emails after submitting an audit.
2. As an admin, I can resend the audit report email and see it logged.
3. As an admin, I can trigger an AI call to a high-value lead and review call logs.
4. As an admin, I can manage tasks in a kanban board to track delivery.
5. As an admin, I can view analytics to understand which pages convert.

**Testing checkpoint**
- Run testing agent again; fix all issues until green.

---

### Phase 4 — Polish, SEO, and “production-ready” finish
**Steps**
1. SEO: React Helmet on all pages, JSON-LD, sitemap.xml, robots.txt, OG defaults.
2. Performance: route-based code splitting, image optimization, reduce animation jank.
3. Content polish: tighten copy, consistent CTAs, validate forms/empty states.
4. Final responsive sweep (mobile/tablet/desktop) + accessibility pass.

**Phase 4 user stories**
1. As a visitor, I can share any page and see correct title/description previews.
2. As a visitor, the site loads fast and animations remain smooth on mobile.
3. As a visitor, forms provide clear errors and success confirmations.
4. As an admin, I can use the dashboard comfortably on a laptop or tablet.
5. As the owner, I can edit settings/templates without code changes.

**Testing checkpoint**
- Final full regression with testing agent; fix remaining bugs.

---

## 3) Next Actions (immediate)
1. Implement and run `test_core.py` for Groq/Kimi/Resend/Vapi/Retell.
2. Lock prompts + JSON schema for audit reports.
3. Scaffold FastAPI routes/services + Mongo models aligned with proven POC.
4. Scaffold React routes/pages + global layout + Tailwind theme.

---

## 4) Success Criteria
- All POC integration tests pass reliably.
- Public site: all pages render, responsive, premium dark-luxury styling, smooth GSAP animations.
- Chatbot works globally, persists to MongoDB, handles errors gracefully.
- Audit flow works end-to-end: submit → AI report saved → report page renders → email sent/logged.
- Admin: email/password login works; audits/chats/bookings/tasks manageable; email/call logs visible.
- SEO basics present (meta/OG/JSON-LD/sitemap/robots) and no critical console/server errors.
