# Personal Execution OS — Task Breakdown

**Generated:** 2026-01-06  
**Based on:** PRD.md  
**Target MVP:** V1 — Single-user execution tracking system

---

## Summary

This document breaks down the Personal Execution OS MVP into **8 atomic tasks** organized in **4 phases**:

1. **Project Setup** (1 task) — Infrastructure and architecture
2. **Core Domain & Data Layer** (2 tasks) — Models, database, DAL
3. **Business Logic & API** (3 tasks) — Services, controllers, validation
4. **Dashboard & Testing** (2 tasks) — UI and end-to-end validation

Each task is sized between **0.5–3 days** and includes:

- Clear acceptance criteria
- API contracts (where applicable)
- Required tests (unit + integration)
- Dependencies

**Execution Order:**

```
Task 1 (Setup)
  ↓
Task 2 (Models/DAL) → Task 3 (Metrics Engine)
  ↓                      ↓
Task 4 (Project API) → Task 5 (DailyLog API) → Task 6 (Metrics API)
  ↓                      ↓                        ↓
Task 7 (Dashboard) ← Task 8 (E2E Testing)
```

---

## Phase 1: Project Setup

### Task 1 — Project Scaffolding & Database Setup

#### Overview

Create the .NET Minimal API project structure, configure PostgreSQL database connection, set up Entity Framework Core with migrations, and establish project conventions (folder structure, ServiceResult pattern, error handling).

#### Estimate

**1 day**

#### Component

Infrastructure / Setup

#### Dependencies

None — this is the foundation task.

#### Acceptance Criteria

- [ ] .NET 8+ Minimal API project created with proper folder structure (`Controllers/`, `Services/`, `DAL/`, `Models/`, `DTOs/`)
- [ ] PostgreSQL connection string configured in `appsettings.json`
- [ ] Entity Framework Core installed and `ApplicationDbContext` created
- [ ] Migration tooling working (`dotnet ef migrations add InitialCreate`)
- [ ] ServiceResult<T> pattern implemented for standardized responses
- [ ] Global exception handler configured
- [ ] Health check endpoint operational (`/health` returns 200)
- [ ] Project builds and runs locally without errors
- [ ] README.md updated with setup instructions

#### Required Tests

**Unit:**

- ServiceResult success/failure patterns work correctly

**Integration:**

- Health check endpoint returns 200
- Database connection can be established

#### Notes

- Use repository pattern for DAL
- Implement ServiceResult<T> with `IsSuccess`, `Value`, `Error` properties
- Example ServiceResult usage:
  ```csharp
  public record ServiceResult<T>(bool IsSuccess, T? Value, string? Error);
  ```

---

## Phase 2: Core Domain & Data Layer

### Task 2 — Project & DailyLog Models + DAL

#### Overview

Implement domain models (`Project`, `DailyLog`), create database schema via EF Core migrations, build repository classes with CRUD operations, and ensure data integrity rules (single active project, immutable logs after 24h).

#### Estimate

**1.5 days**

#### Component

Models + DAL

#### Dependencies

- Task 1 (Database setup)

#### Acceptance Criteria

- [ ] `Project` entity created with fields: `Id`, `Name`, `Goal`, `StartDate`, `IsActive`
- [ ] `DailyLog` entity created with fields: `Id`, `Date`, `ProjectId`, `TaskDescription`, `TimeSpentMinutes`, `OutputDescription`, `RevenueGenerated`, `Note`
- [ ] EF Core relationships configured (Project has many DailyLogs)
- [ ] Database migration creates tables correctly
- [ ] `IProjectRepository` interface with methods: `CreateAsync`, `GetByIdAsync`, `GetAllAsync`, `SetActiveAsync`, `UpdateAsync`
- [ ] `IDailyLogRepository` interface with methods: `CreateAsync`, `GetByIdAsync`, `GetByProjectIdAsync`, `GetByDateRangeAsync`, `UpdateAsync`
- [ ] Repository implementations handle null cases gracefully
- [ ] Unique constraint on `IsActive=true` (only one active project)
- [ ] DateOnly used for `DailyLog.Date` field

#### Required Tests

**Unit:**

- Repository mock behavior verification

**Integration:**

- Create a Project → verify in database
- Create a DailyLog → verify foreign key relationship
- Attempt to activate two projects → second activation fails
- Update DailyLog within 24h → succeeds
- Query logs by date range → returns correct subset

#### Notes

- Use `DateOnly` type for dates (not `DateTime`)
- Repository pattern returns `ServiceResult<T>`
- Example project creation:
  ```csharp
  var project = new Project
  {
    Name = "Side Project Alpha",
    Goal = "Launch MVP",
    StartDate = DateOnly.FromDateTime(DateTime.Today),
    IsActive = true
  };
  ```

---

### Task 3 — Metrics Calculation Engine

#### Overview

Build a service to compute execution metrics: total time per project, total revenue, revenue per hour, days worked, and execution streak (consecutive days with logs). This is a pure business logic component with no API exposure.

#### Estimate

**1 day**

#### Component

Service Layer (BLL)

#### Dependencies

- Task 2 (DAL + Models)

#### Acceptance Criteria

- [ ] `IMetricsService` interface created with methods:
  - `CalculateTotalTimeAsync(projectId)` → int (minutes)
  - `CalculateTotalRevenueAsync(projectId)` → decimal
  - `CalculateRevenuePerHourAsync(projectId)` → decimal
  - `CalculateDaysWorkedAsync(projectId)` → int
  - `CalculateCurrentStreakAsync(projectId)` → int (consecutive days)
- [ ] MetricsService implementation uses `IDailyLogRepository`
- [ ] Streak calculation handles gaps in dates correctly
- [ ] Revenue per hour returns 0 when time is 0
- [ ] All methods return `ServiceResult<T>`

#### Required Tests

**Unit:**

- Given 3 logs with times [60, 120, 45] → total time = 225 minutes
- Given logs with revenue [100, 0, 50] → total revenue = 150
- Given 225 minutes and $150 revenue → revenue per hour = $40
- Given logs on dates [Jan 1, Jan 2, Jan 3, Jan 5] → streak = 3 (breaks on Jan 4)
- Given logs on dates [Jan 1, Jan 3] → days worked = 2
- Given no logs → all metrics return 0 or appropriate default

**Integration:**

- Create project + 3 logs → verify all metrics compute correctly end-to-end

#### Notes

- Streak logic: count consecutive days from most recent log backward
- Example:
  ```
  Logs: Jan 5, Jan 4, Jan 3, Jan 1
  Streak: 3 (breaks at Jan 2 gap)
  ```

---

## Phase 3: Business Logic & API Endpoints

### Task 4 — Project Management API

#### Overview

Expose HTTP endpoints to create projects, activate/deactivate projects (enforcing single active project rule), and retrieve project details. Includes validation and error handling.

#### Estimate

**1.5 days**

#### Component

Controller + Service (BLL)

#### Dependencies

- Task 2 (DAL + Models)

#### API Contract

**POST** `/api/projects`

- **Request Body:**
  ```json
  {
    "name": "Side Project Alpha",
    "goal": "Launch MVP in 30 days"
  }
  ```
- **Responses:**
  - `201 Created` → `{ "id": "guid", "name": "...", "goal": "...", "startDate": "2026-01-06", "isActive": true }`
  - `400 Bad Request` → `{ "error": "Name is required" }`
  - `500 Internal Server Error` → `{ "error": "Unexpected error" }`

**GET** `/api/projects`

- **Query Params:** None
- **Responses:**
  - `200 OK` → `[{ "id": "guid", "name": "...", "isActive": true, ... }]`

**GET** `/api/projects/{id}`

- **Responses:**
  - `200 OK` → `{ "id": "guid", "name": "...", ... }`
  - `404 Not Found` → `{ "error": "Project not found" }`

**PATCH** `/api/projects/{id}/activate`

- **Responses:**
  - `200 OK` → `{ "id": "guid", "isActive": true }`
  - `400 Bad Request` → `{ "error": "Another project is already active" }`
  - `404 Not Found` → `{ "error": "Project not found" }`

#### Acceptance Criteria

- [ ] All endpoints return correct HTTP status codes
- [ ] Create project sets `IsActive = true` by default
- [ ] Activate endpoint deactivates other projects first
- [ ] Validation: name required (min 1 char, max 100 chars)
- [ ] Validation: goal optional (max 500 chars)
- [ ] StartDate auto-set to today's date
- [ ] Endpoints use `IProjectService` (not repository directly)
- [ ] Service layer returns `ServiceResult<T>`

#### Required Tests

**Unit:**

- ProjectService.CreateAsync with valid data → success
- ProjectService.CreateAsync with empty name → validation error
- ProjectService.ActivateAsync when another project is active → deactivates old project

**Integration:**

- POST /api/projects → 201 with correct JSON
- POST /api/projects with missing name → 400
- PATCH /api/projects/{id}/activate → 200 and old project deactivated
- GET /api/projects → 200 with list

---

### Task 5 — DailyLog Management API

#### Overview

Expose HTTP endpoints to create and update daily logs, retrieve logs by project or date range, and enforce immutability rules (logs cannot be edited after 24h).

#### Estimate

**2 days**

#### Component

Controller + Service (BLL)

#### Dependencies

- Task 2 (DAL + Models)
- Task 4 (Projects must exist to log against)

#### API Contract

**POST** `/api/daily-logs`

- **Request Body:**
  ```json
  {
    "projectId": "guid",
    "date": "2026-01-06",
    "taskDescription": "Built authentication module",
    "timeSpentMinutes": 120,
    "outputDescription": "Auth API working",
    "revenueGenerated": 0,
    "note": "Used JWT tokens"
  }
  ```
- **Responses:**
  - `201 Created` → `{ "id": "guid", "date": "2026-01-06", ... }`
  - `400 Bad Request` → `{ "error": "ProjectId is required" }`
  - `404 Not Found` → `{ "error": "Project not found" }`

**GET** `/api/daily-logs?projectId={guid}`

- **Responses:**
  - `200 OK` → `[{ "id": "guid", "date": "2026-01-06", ... }]`

**GET** `/api/daily-logs?startDate=2026-01-01&endDate=2026-01-07`

- **Responses:**
  - `200 OK` → `[{ "id": "guid", ... }]`

**PATCH** `/api/daily-logs/{id}`

- **Request Body:** (partial update)
  ```json
  {
    "taskDescription": "Updated description",
    "timeSpentMinutes": 150
  }
  ```
- **Responses:**
  - `200 OK` → updated log
  - `400 Bad Request` → `{ "error": "Cannot edit log older than 24 hours" }`
  - `404 Not Found` → `{ "error": "Log not found" }`

#### Acceptance Criteria

- [ ] All endpoints return correct HTTP status codes
- [ ] Create log validates: projectId exists, date not in future, timeSpentMinutes > 0
- [ ] Validation: taskDescription required (max 500 chars)
- [ ] Validation: outputDescription required (max 1000 chars)
- [ ] Validation: revenueGenerated ≥ 0
- [ ] Update log checks if log date is within 24h of now
- [ ] Query by projectId returns all logs for that project
- [ ] Query by date range filters correctly
- [ ] Service layer uses `IDailyLogRepository`

#### Required Tests

**Unit:**

- DailyLogService.CreateAsync with valid data → success
- DailyLogService.CreateAsync with non-existent projectId → error
- DailyLogService.UpdateAsync on log from 2 days ago → fails with immutability error
- DailyLogService.UpdateAsync on today's log → succeeds

**Integration:**

- POST /api/daily-logs → 201
- POST with invalid projectId → 404
- PATCH log from yesterday → 400 immutability error
- GET /api/daily-logs?projectId=X → returns filtered list
- GET /api/daily-logs?startDate=...&endDate=... → returns correct date range

---

### Task 6 — Metrics API Endpoint

#### Overview

Expose HTTP endpoint to retrieve computed metrics for a given project (total time, revenue, revenue/hour, days worked, streak). Uses MetricsService built in Task 3.

#### Estimate

**0.5 days**

#### Component

Controller (uses existing MetricsService)

#### Dependencies

- Task 3 (MetricsService)
- Task 4 (Projects exist)

#### API Contract

**GET** `/api/projects/{id}/metrics`

- **Responses:**
  - `200 OK` →
    ```json
    {
      "projectId": "guid",
      "totalTimeMinutes": 360,
      "totalRevenue": 150.0,
      "revenuePerHour": 25.0,
      "daysWorked": 5,
      "currentStreak": 3
    }
    ```
  - `404 Not Found` → `{ "error": "Project not found" }`

#### Acceptance Criteria

- [ ] Endpoint calls `IMetricsService` methods
- [ ] Returns all 5 metrics in single response
- [ ] Returns 404 if project doesn't exist
- [ ] Revenue formatted to 2 decimal places
- [ ] When no logs exist, returns zeroed metrics

#### Required Tests

**Unit:**

- MetricsController returns correct DTO from service results

**Integration:**

- GET /api/projects/{validId}/metrics → 200 with correct data
- GET /api/projects/{invalidId}/metrics → 404
- Create project + 3 logs → GET metrics → verify calculations

---

## Phase 4: Dashboard & Validation

### Task 7 — Minimal Dashboard UI

#### Overview

Build a single-page web UI showing: active project name, time spent this week, last logged output, total revenue, and current streak. Static HTML + JavaScript calling the APIs.

#### Estimate

**2 days**

#### Component

Frontend (optional, but recommended for V1)

#### Dependencies

- Task 4 (Projects API)
- Task 5 (DailyLogs API)
- Task 6 (Metrics API)

#### Acceptance Criteria

- [ ] Single HTML page served at `/`
- [ ] Displays active project name (or "No active project")
- [ ] Shows time spent this week (calculated client-side or via API filter)
- [ ] Shows last logged output description
- [ ] Shows total revenue for active project
- [ ] Shows current execution streak
- [ ] Refreshes data on page load
- [ ] Simple CSS styling (minimal, clean)
- [ ] No authentication required

#### Required Tests

**Manual:**

- Open dashboard → see correct active project
- Create new log → refresh → see updated data
- Deactivate project → dashboard shows "No active project"

**E2E (optional):**

- Automated browser test verifying dashboard displays correct data

#### Notes

- Use `fetch()` to call APIs
- Example layout:
  ```
  ┌─────────────────────────────────┐
  │ Active Project: Side Project Alpha │
  │ This Week: 6h 30m               │
  │ Last Output: Auth API working   │
  │ Total Revenue: $150             │
  │ Streak: 🔥 3 days              │
  └─────────────────────────────────┘
  ```

---

### Task 8 — End-to-End Testing & Release Validation

#### Overview

Write integration and E2E tests covering full user workflows, validate all acceptance criteria from PRD, and prepare deployment documentation.

#### Estimate

**1.5 days**

#### Component

Testing + Documentation

#### Dependencies

- All previous tasks (1-7)

#### Acceptance Criteria

- [ ] Integration tests cover happy path:
  1. Create project
  2. Add 3 daily logs
  3. Query metrics
  4. Activate/deactivate project
- [ ] Integration tests cover edge cases:
  - Create log for non-existent project
  - Edit log older than 24h
  - Activate project when another is active
- [ ] E2E test (manual or automated):
  1. User creates project via dashboard
  2. Logs execution for 7 consecutive days
  3. Views metrics
- [ ] Deployment README includes:
  - Prerequisites (Docker, PostgreSQL)
  - Database migration steps
  - How to run locally
  - Environment variables
- [ ] All PRD release criteria met:
  - ✅ Can create a project
  - ✅ Can log daily execution
  - ✅ Dashboard displays correct metrics
  - ✅ System used successfully for one full week (validated in E2E test)

#### Required Tests

**Integration:**

- Full workflow test (create project → add logs → verify metrics)
- Error handling test (invalid inputs return correct 400/404)

**E2E:**

- Simulate 7-day usage via API calls
- Verify streak calculation after 7 days
- Verify immutability rule after 24h

#### Deliverables

- Test suite with >80% code coverage
- Deployment guide in `DEPLOYMENT.md`
- Release notes documenting V1 features

---

## Execution Guidelines

### For the Developer Agent:

1. **Start with Task 1** — no work can proceed without database setup
2. **Complete Phase 2 before Phase 3** — API needs data layer
3. **Test incrementally** — run tests after each task
4. **Use ServiceResult<T> pattern** — standardize all service responses
5. **Follow repository pattern** — controllers → services → repositories
6. **No feature creep** — strictly adhere to PRD V1 scope

### Tech Stack Confirmation:

- .NET 8+ Minimal API
- PostgreSQL
- Entity Framework Core 8+
- xUnit for testing
- Optional: Blazor or static HTML/JS for dashboard

### Example Code Patterns:

**ServiceResult:**

```csharp
public record ServiceResult<T>(bool IsSuccess, T? Value, string? Error)
{
    public static ServiceResult<T> Success(T value) => new(true, value, null);
    public static ServiceResult<T> Failure(string error) => new(false, default, error);
}
```

**Repository Method:**

```csharp
public async Task<ServiceResult<Project>> CreateAsync(Project project)
{
    try
    {
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();
        return ServiceResult<Project>.Success(project);
    }
    catch (Exception ex)
    {
        return ServiceResult<Project>.Failure(ex.Message);
    }
}
```

**Controller Endpoint:**

```csharp
app.MapPost("/api/projects", async (CreateProjectRequest request, IProjectService service) =>
{
    var result = await service.CreateAsync(request);
    return result.IsSuccess
        ? Results.Created($"/api/projects/{result.Value.Id}", result.Value)
        : Results.BadRequest(new { error = result.Error });
});
```

---

## Questions to Clarify (if any):

### ❓ Immutability Rule

**Q:** Should the 24h immutability rule be enforced, or is it optional for V1?  
**Default Assumption:** Yes, enforce it (per PRD optional note, but good practice).

### ❓ Dashboard Hosting

**Q:** Should dashboard be bundled with API or separate static site?  
**Default Assumption:** Bundle with API, serve at `/` root.

### ❓ Database Migrations

**Q:** Should migrations run automatically on startup, or manually via CLI?  
**Default Assumption:** Manual via `dotnet ef database update` (safer for production).

---

## Handoff Checklist

Before starting implementation, confirm:

- [ ] API contracts are clear (request/response examples provided)
- [ ] Acceptance criteria are measurable (no ambiguity)
- [ ] Tests are specified (unit + integration)
- [ ] Dependencies are explicit (no circular dependencies)
- [ ] No remaining technical ambiguities (stack confirmed)

---

**Ready for implementation.** Each task is fully specified and executable without further clarification. Estimated total time: **11 days** (can be parallelized where dependencies allow).
