# Graph Report - backend\routes  (2026-06-17)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 262 nodes · 292 edges · 18 communities (17 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]

## God Nodes (most connected - your core abstractions)
1. `_public_fields()` - 7 edges
2. `_get_employee_stats()` - 7 edges
3. `_parse_month()` - 7 edges
4. `monthly_summary()` - 7 edges
5. `_public_customer()` - 6 edges
6. `_leave_balance()` - 6 edges
7. `_get_target_hours()` - 6 edges
8. `_sum_hours()` - 6 edges
9. `request_correction()` - 5 edges
10. `attendance_rates()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `my_summary()` --calls--> `_leave_balance()`  [INFERRED]
  attendance.py → leaves.py
- `_generate_report_task()` --calls--> `_generate_and_save_report()`  [INFERRED]
  customers.py → audits.py

## Import Cycles
- 1-file cycle: `attendance.py -> attendance.py`
- 1-file cycle: `employees.py -> employees.py`

## Communities (18 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (37): AdminPermissionsUpdate, EmployeeCreateInput, create_employee(), deactivate_employee(), delete_employee(), _employee_month_target(), employee_profile_summary(), get_employee() (+29 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (28): approve_correction(), clock_in(), clock_out(), _compute_hours(), _get_target_hours(), list_attendance(), monthly_summary(), my_attendance() (+20 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (25): CustomerProfileUpdate, audit_eligibility(), change_customer_password(), customer_create_booking(), customer_dashboard(), customer_get_audit(), customer_login(), customer_me() (+17 more)

### Community 3 - "Community 3"
Cohesion: 0.14
Nodes (23): attendance_rates(), _count_leaves(), _get_target_hours(), hours_trends(), leave_usage(), monthly_summary(), overtime_tracking(), _parse_month() (+15 more)

### Community 4 - "Community 4"
Cohesion: 0.10
Nodes (17): _generate_and_save_report(), get_audit_report(), list_audits(), AuditSubmitInput, BackgroundTasks, Audit submission + AI report generation routes., Public: fetch a single audit + report (limited fields for public view)., Admin: regenerate report for an audit. (+9 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (20): BaseModel, TaskInput, create_task(), delete_task(), list_my_tasks(), list_tasks(), Task kanban routes — admin can manage, employees can read and update own., Admin/Super Admin: clear the issue flag on a task after addressing feedback. (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (19): LeaveApplyInput, LeaveDecisionInput, apply_leave(), approve_leave(), employee_leave_balance(), _leave_balance(), list_leaves(), my_leave_balance() (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (10): employee_overtime(), list_overtime(), log_overtime(), my_overtime(), Overtime management routes., Admin sees overtime for a specific employee., Admin logs overtime for an employee. Reason and project are mandatory., Admin/Super Admin lists all overtime records. (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.20
Nodes (9): dashboard_stats(), funnel(), Admin analytics + dashboard stats., Aggregate dashboard counts + recent activity., Conversion funnel: chats -> audits -> reports viewed -> bookings., Audits by day for past N days., Mock source breakdown until real analytics integrated. (Computed from booking so, timeseries() (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.20
Nodes (4): AI Calling routes (Retell + Vapi)., Trigger an outbound call. Creates a CallLog regardless of provider success/failu, trigger_call(), CallTriggerInput

### Community 10 - "Community 10"
Cohesion: 0.20
Nodes (6): get_settings_public(), newsletter_signup(), Newsletter + settings routes., Public newsletter signup., Public-safe settings (no secrets)., NewsletterInput

### Community 11 - "Community 11"
Cohesion: 0.22
Nodes (5): get_chat(), Public: send a message to the AI chatbot., Public: fetch current thread for a session., send_chat_message(), ChatSendInput

### Community 12 - "Community 12"
Cohesion: 0.25
Nodes (7): list_notifications(), mark_all_read(), mark_one_read(), In-app notifications for EMS., List notifications for the current user (employee or admin)., Mark all notifications as read for the current user., Mark a single notification as read.

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (7): get_recycle_bin(), purge(), Recycle bin routes — list, restore, and permanently delete soft-deleted items., Admin/Super Admin lists deleted items., Restore a deleted item to its original collection., Permanently delete a single recycle-bin item., restore()

### Community 14 - "Community 14"
Cohesion: 0.29
Nodes (3): BookingInput, create_booking(), Public: create a booking/contact request.

### Community 15 - "Community 15"
Cohesion: 0.40
Nodes (3): Email logs + manual send (admin)., send_manual_email(), EmailSendInput

## Knowledge Gaps
- **22 isolated node(s):** `AttendanceVerifyInput`, `AttendanceCorrectInput`, `AuditSubmitInput`, `AuditStatusUpdate`, `LoginInput` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `my_summary()` connect `Community 1` to `Community 6`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `_leave_balance()` connect `Community 6` to `Community 1`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `_generate_report_task()` connect `Community 4` to `Community 2`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `Admin analytics + dashboard stats.`, `Aggregate dashboard counts + recent activity.`, `Conversion funnel: chats -> audits -> reports viewed -> bookings.` to the rest of the system?**
  _123 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06827880512091039 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08866995073891626 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09230769230769231 - nodes in this community are weakly interconnected._