# Graph Report - axovion-web  (2026-06-12)

## Corpus Check
- 143 files · ~69,989 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 249 nodes · 395 edges · 9 communities
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `807305bd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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

## God Nodes (most connected - your core abstractions)
1. `adminApi` - 15 edges
2. `AdminPermissions` - 7 edges
3. `_public_fields()` - 7 edges
4. `_get_employee_stats()` - 7 edges
5. `_parse_month()` - 7 edges
6. `EmployeeCreateInput` - 6 edges
7. `EmployeeUpdateInput` - 6 edges
8. `AdminPermissionsUpdate` - 6 edges
9. `_sum_hours()` - 6 edges
10. `monthly_summary()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `TaskInput` --uses--> `TaskInput`  [INFERRED]
  backend/routes/tasks.py → backend/models/schemas.py
- `datetime` --uses--> `AttendanceVerifyInput`  [INFERRED]
  backend/routes/attendance.py → backend/models/schemas.py
- `datetime` --uses--> `AttendanceCorrectInput`  [INFERRED]
  backend/routes/attendance.py → backend/models/schemas.py
- `OvertimeLogInput` --uses--> `OvertimeLogInput`  [INFERRED]
  backend/routes/overtime.py → backend/models/schemas.py
- `TaskInput` --uses--> `Task`  [INFERRED]
  backend/routes/tasks.py → backend/models/schemas.py

## Import Cycles
- 1-file cycle: `backend/routes/attendance.py -> backend/routes/attendance.py`
- 1-file cycle: `backend/routes/employees.py -> backend/routes/employees.py`

## Communities (9 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (12): NAV, COLORS, COLS, PRIORITY_COLOR, STATUS_BADGE, NOTIF_COLORS, NOTIF_LABELS, EmployeeLayout() (+4 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (41): AdminPermissionsUpdate, AttendanceCorrectInput, AttendanceVerifyInput, datetime, BaseModel, EmployeeCreateInput, EmployeeUpdateInput, LeaveApplyInput (+33 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (29): deactivate_employee(), delete_employee(), _employee_month_target(), employee_profile_summary(), get_employee(), _get_employee_stats(), list_employees(), my_profile() (+21 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (23): Any, on_startup(), Axovion.io main FastAPI app., OvertimeLogInput, create_employee(), Super Admin creates an employee or admin account., employee_overtime(), list_overtime() (+15 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (22): datetime, approve_correction(), clock_in(), clock_out(), _compute_hours(), list_attendance(), monthly_summary(), my_attendance() (+14 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (21): attendance_rates(), _count_leaves(), hours_trends(), leave_usage(), monthly_summary(), overtime_tracking(), _parse_month(), Reports and analytics routes. (+13 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (18): my_summary(), Employee's monthly hours summary., apply_leave(), approve_leave(), employee_leave_balance(), _leave_balance(), list_leaves(), my_leave_balance() (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (13): list_notifications(), mark_all_read(), mark_one_read(), In-app notifications for EMS., List notifications for the current user (employee or admin)., Mark all notifications as read for the current user., Mark a single notification as read., check_permission() (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (15): Task, create_task(), delete_task(), list_my_tasks(), list_tasks(), Task kanban routes — admin can manage, employees can read and update own., Admin/Super Admin: list all tasks., Employee: list only tasks assigned to them. (+7 more)

## Knowledge Gaps
- **10 isolated node(s):** `STATUS_BADGE`, `NOTIF_COLORS`, `NOTIF_LABELS`, `API`, `publicApi` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `serialize_doc()` connect `Community 3` to `Community 8`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `create_task()` connect `Community 8` to `Community 3`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `create_employee()` connect `Community 3` to `Community 1`, `Community 2`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `AdminPermissions` (e.g. with `AdminPermissionsUpdate` and `datetime`) actually correct?**
  _`AdminPermissions` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Pydantic models for Axovion.io backend.`, `Public audit form submission.`, `Granular permissions for Admin role — all default False.` to the rest of the system?**
  _81 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06448979591836734 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._