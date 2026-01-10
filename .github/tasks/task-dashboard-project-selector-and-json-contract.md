# Task: Fix Dashboard API JSON shape + Add Project Selector

## Summary

The dashboard client currently assumes **camelCase** JSON properties (`project.id`, `metrics.totalTimeMinutes`, `log.taskDescription`, etc.). The API is configured with `PropertyNamingPolicy = null` (see Program.cs), which returns **PascalCase** properties (`Id`, `TotalTimeMinutes`, `TaskDescription`, ...).

This mismatch causes the dashboard to repeatedly call endpoints with `undefined` IDs, e.g.:

- `GET /api/dailylogs/project/undefined/range?...` → 404
- `GET /api/metrics/undefined` → 404

Additionally, the dashboard does not provide a way to:

- list existing projects
- select which project is active

This task fixes the client/server contract mismatch and adds minimal UI controls to list projects and activate one.

---

## Task 1 — Normalize API responses in dashboard client

## Overview

Update the dashboard JavaScript so it correctly handles the API’s PascalCase JSON responses (and remains tolerant if camelCase appears in the future). Prevent any polling requests that contain `undefined` project IDs.

## Estimate (days)

0.5–1

## Component

Frontend (wwwroot) + minimal controller-contract tests

## Dependencies

- Existing endpoints must remain unchanged:
  - `GET /api/projects` (list)
  - `GET /api/projects/active/current` (active)
  - `POST /api/projects/{id}/activate` (activate)
  - `GET /api/metrics/{projectId}`
  - `GET /api/dailylogs/project/{projectId}/range?startDate=...&endDate=...`

## API Contract (if applicable)

No new endpoints.

## Acceptance criteria (checklist)

- Dashboard never issues requests containing `undefined` in the URL (verify via browser Network tab during 2+ refresh cycles).
- Dashboard correctly displays:
  - Active project name/goal/start date
  - Metrics (time, revenue, revenue/hour, days worked, streak)
  - Last activity (task/output/time/revenue)
- When no active project exists:
  - Metrics and last-activity sections show a neutral “no active project” state
  - No metrics/log requests are attempted
- Error banner does not spam repeatedly every 30s due to the `undefined` request loop.

## Required tests (unit + integration)

Add small **integration tests** that validate the JSON contract the dashboard relies on:

- `GET /api/projects/active/current` returns PascalCase property `Id` when a project exists and is active.
- `GET /api/metrics/{projectId}` response JSON contains `TotalTimeMinutes`.
- `GET /api/dailylogs/project/{projectId}/range?...` response JSON items contain `TaskDescription`.

Notes:

- These tests should read raw JSON (`ReadAsStringAsync`) and assert on property names.
- Keep tests minimal and deterministic.

---

## Task 2 — Add “Projects” list + activate project UX

## Overview

Add a minimal UI section to list existing projects and allow the user to set one as active (calling the existing activate endpoint). This resolves the “I can create projects, but I can’t consult or choose the active one” feedback.

## Estimate (days)

0.5–1

## Component

Frontend (wwwroot)

## Dependencies

- Requires Task 1 normalization to reliably read `Id/Name/IsActive`.

## API Contract (if applicable)

Uses existing API.

- List projects

  - Endpoint: `GET /api/projects`
  - Responses:
    - `200 OK` with `[{"Id": "guid", "Name": "...", "Goal": "...", "StartDate": "YYYY-MM-DD", "IsActive": true|false, ...}]`

- Activate project
  - Endpoint: `POST /api/projects/{id}/activate`
  - Responses:
    - `200 OK` with updated project response
    - `404 Not Found` if project id doesn’t exist

## Acceptance criteria (checklist)

- Dashboard shows a “Projects” section containing at least:
  - Project name
  - Active indicator (e.g., label/text)
  - An “Activate” button (or equivalent control) for non-active projects
- Clicking “Activate”:
  - Calls `POST /api/projects/{id}/activate`
  - Refreshes the dashboard state (active project + metrics + last activity)
  - Ensures only one project appears active after refresh
- If activation fails (400/404):
  - Error banner shows a meaningful message

## Required tests (unit + integration)

- If not already covered, add/extend integration tests to confirm:
  - Activating a project deactivates the previous one.
  - Listing projects includes the active status.

(These tests likely exist already, but confirm coverage and add only what’s missing.)

---

## Task 3 — Docker/dev feedback loop guardrails (optional but recommended)

## Overview

Improve developer ergonomics so the dashboard doesn’t appear “broken” in a fresh Docker run.

## Estimate (days)

0.5

## Component

Docs + small config

## Dependencies

None.

## API Contract

None.

## Acceptance criteria (checklist)

- Deployment docs mention that:
  - API JSON uses PascalCase because `PropertyNamingPolicy = null`
  - Dashboard is built to tolerate PascalCase/camelCase but contract is PascalCase
- Doc section includes a quick troubleshooting line: “If you see `/project/undefined/...` in Network, the dashboard JSON mapping is broken.”

## Required tests

None.

---

## Execution order

1. Task 1 — Fix JSON shape / undefined request loop
2. Task 2 — Add projects list + activation UI
3. Task 3 — Optional docs polish

---

## Handoff checklist

- [ ] API contract present
- [ ] Measurable acceptance criteria
- [ ] Tests listed (unit + integration)
- [ ] No remaining ambiguities
