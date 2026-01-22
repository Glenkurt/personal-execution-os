# Task 14: Add Missing API Endpoints for Angular Frontend

## Overview

The Angular frontend is successfully deployed and making HTTP requests, but two critical API endpoints are missing on the backend, causing 404 errors. The backend controllers exist but lack the specific endpoints that the Angular services are calling.

## Estimate

0.5 days

## Component

Controller / API Layer

## Dependencies

- None (backend controllers already exist)
- Angular services are already implemented and calling these endpoints

## Problem Analysis

### Missing Endpoints Identified

1. **Dashboard Summary Endpoint** - `GET /api/metrics/dashboard/summary`
   - **Angular Service Call:** `MetricsService.getDashboardMetrics()` at line 31
   - **Expected Response Type:** `MetricsSummary`
   - **Current Status:** 404 Not Found
   - **Backend Controller:** `MetricsController.cs` exists but lacks this endpoint
   - **Available Endpoints:** Only project-specific metrics with GUID (`/api/metrics/{projectId:guid}`)

2. **All Daily Logs Endpoint** - `GET /api/dailylogs`
   - **Angular Service Call:** `DailyLogService.getAllLogs()` at line 28
   - **Expected Response Type:** `DailyLogResponse[]`
   - **Current Status:** 404 Not Found
   - **Backend Controller:** `DailyLogsController.cs` exists but lacks parameterless GET
   - **Available Endpoints:** Only GET by ID (`/api/dailylogs/{id:guid}`) and project-specific (`/api/dailylogs/project/{projectId:guid}`)

### Root Cause

The backend API was designed with GUID-based resource routing (project-specific queries), but the Angular dashboard requires:
- Aggregated metrics across ALL projects (dashboard summary)
- All daily logs across ALL projects (activity list)

## API Contract

### 1. Dashboard Metrics Summary Endpoint

**Endpoint:** `GET /api/metrics/dashboard/summary`

**Method:** `GET`

**Headers:** 
- `Content-Type: application/json`

**Request Body:** None

**Response - 200 OK:**
```json
{
  "total_projects": 3,
  "active_projects": 2,
  "total_time_hours": 156.5,
  "total_revenue": 7825.0,
  "average_hourly_rate": 50.0,
  "current_streak_days": 12,
  "longest_streak_days": 28,
  "last_activity_date": "2026-01-11T14:00:00Z"
}
```

**Response - 500 Internal Server Error:**
```json
{
  "error": "Failed to retrieve dashboard metrics"
}
```

**Implementation Notes:**
- Aggregate data from ALL projects (no project filter)
- Calculate total hours from all `DailyLog` entries
- Calculate total revenue from all projects
- Compute current and longest streaks from daily log dates
- Return `last_activity_date` as the most recent `DailyLog.Date`

---

### 2. All Daily Logs Endpoint

**Endpoint:** `GET /api/dailylogs`

**Method:** `GET`

**Headers:** 
- `Content-Type: application/json`

**Query Parameters (Optional):**
- `limit` (int, default: 50) - Maximum number of logs to return
- `sortBy` (string, default: "date") - Sort field (`date`, `project`, `time`)
- `sortOrder` (string, default: "desc") - Sort direction (`asc`, `desc`)

**Request Body:** None

**Response - 200 OK:**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "date": "2026-01-11",
    "project_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "task_description": "Implement user authentication",
    "time_spent_minutes": 180,
    "output_description": "Completed JWT token implementation and role-based access control",
    "note": "Need to add refresh token logic",
    "created_at": "2026-01-11T10:30:00Z"
  },
  {
    "id": "c2d3e4f5-a6b7-8901-cdef-123456789012",
    "date": "2026-01-10",
    "project_id": "d3e4f5a6-b7c8-9012-def1-234567890123",
    "task_description": "Database optimization",
    "time_spent_minutes": 120,
    "output_description": "Added indexes on frequently queried columns",
    "note": null,
    "created_at": "2026-01-10T15:45:00Z"
  }
]
```

**Response - 400 Bad Request:**
```json
{
  "error": "Invalid query parameters"
}
```

**Response - 500 Internal Server Error:**
```json
{
  "error": "Failed to retrieve daily logs"
}
```

**Implementation Notes:**
- Return logs from ALL projects (no project filter)
- Default sort: by `Date` descending (most recent first)
- Default limit: 50 records (configurable via query param)
- Use existing `DailyLogResponse` DTO for response mapping

---

## Acceptance Criteria

- [ ] **Dashboard Summary Endpoint Implemented**
  - `GET /api/metrics/dashboard/summary` returns 200 OK with aggregated metrics
  - Response matches `MetricsSummary` TypeScript interface
  - Metrics correctly aggregate data from all projects and daily logs
  - Streak calculation logic correctly identifies consecutive work days
  - Error handling returns 500 with descriptive message on failure

- [ ] **All Daily Logs Endpoint Implemented**
  - `GET /api/dailylogs` returns 200 OK with array of daily logs
  - Endpoint supports optional query parameters (`limit`, `sortBy`, `sortOrder`)
  - Default behavior: 50 most recent logs, sorted by date descending
  - Response uses existing `DailyLogResponse` DTO
  - Error handling returns 400 for invalid params, 500 for server errors

- [ ] **Angular Frontend Integration**
  - `MetricsService.getDashboardMetrics()` successfully retrieves summary (no 404)
  - `DailyLogService.getAllLogs()` successfully retrieves logs (no 404)
  - Dashboard components display aggregated metrics correctly
  - Activity list displays recent daily logs without errors

- [ ] **Testing**
  - Unit tests added for both new endpoints in respective controller test files
  - Integration tests verify correct data aggregation
  - Tests cover edge cases: no projects, no logs, date ranges, sorting

---

## Required Tests

### Unit Tests

**File:** `tests/Unit/Core/Controllers/MetricsControllerTests.cs`

1. `GetDashboardSummaryAsync_WithProjects_ReturnsAggregatedMetrics`
2. `GetDashboardSummaryAsync_NoProjects_ReturnsZeroMetrics`
3. `GetDashboardSummaryAsync_ServiceThrowsException_Returns500`

**File:** `tests/Unit/Core/Controllers/DailyLogsControllerTests.cs`

1. `GetAllLogsAsync_DefaultParams_ReturnsFirst50Logs`
2. `GetAllLogsAsync_WithLimit_ReturnsSpecifiedNumber`
3. `GetAllLogsAsync_WithSorting_ReturnsSortedLogs`
4. `GetAllLogsAsync_InvalidParams_Returns400`
5. `GetAllLogsAsync_RepositoryThrowsException_Returns500`

### Integration Tests

**File:** `tests/Integration/Controllers/MetricsControllerTests.cs`

1. `GetDashboardSummary_WithMultipleProjects_AggregatesCorrectly`
2. `GetDashboardSummary_CalculatesStreaksCorrectly`

**File:** `tests/Integration/Controllers/DailyLogsControllerTests.cs`

1. `GetAllLogs_ReturnsLogsFromAllProjects`
2. `GetAllLogs_SortsAndLimitsCorrectly`

---

## Implementation Guidance

### 1. Dashboard Summary Endpoint

**Location:** `src/API/Controllers/MetricsController.cs`

**Method Signature:**
```csharp
[HttpGet("dashboard/summary")]
[ProducesResponseType(typeof(MetricsSummary), StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
public async Task<ActionResult<MetricsSummary>> GetDashboardSummaryAsync(CancellationToken ct)
```

**Implementation Steps:**
1. Add `GetDashboardSummaryAsync` method to `IMetricsService` interface
2. Implement method in `MetricsService`:
   - Query all projects from `IProjectRepository.GetAllAsync()`
   - Query all daily logs from `IDailyLogRepository` (need to add `GetAllAsync()` if missing)
   - Calculate aggregated values:
     - `total_projects` = project count
     - `active_projects` = projects with `Status == Active`
     - `total_time_hours` = sum of all `DailyLog.TimeSpentMinutes / 60`
     - `total_revenue` = sum of all `Project.TotalRevenue`
     - `average_hourly_rate` = `total_revenue / total_time_hours`
     - `current_streak_days` = calculate consecutive days from most recent log
     - `longest_streak_days` = calculate longest consecutive period
     - `last_activity_date` = max `DailyLog.Date`
3. Add controller action that calls service method
4. Map service result to `MetricsSummary` response DTO

**Streak Calculation Logic:**
```csharp
// Current streak: consecutive days ending today or most recent log
var sortedDates = dailyLogs.Select(l => l.Date).Distinct().OrderByDescending(d => d).ToList();
int currentStreak = 0;
DateTime? previousDate = null;

foreach (var date in sortedDates)
{
    if (previousDate == null || (previousDate.Value - date).TotalDays == 1)
    {
        currentStreak++;
        previousDate = date;
    }
    else
    {
        break; // Streak broken
    }
}

// Longest streak: scan all dates for longest consecutive period
int longestStreak = 0;
int tempStreak = 1;
var allDates = sortedDates.OrderBy(d => d).ToList();

for (int i = 1; i < allDates.Count; i++)
{
    if ((allDates[i] - allDates[i - 1]).TotalDays == 1)
    {
        tempStreak++;
        longestStreak = Math.Max(longestStreak, tempStreak);
    }
    else
    {
        tempStreak = 1;
    }
}
```

---

### 2. All Daily Logs Endpoint

**Location:** `src/API/Controllers/DailyLogsController.cs`

**Method Signature:**
```csharp
[HttpGet]
[ProducesResponseType(typeof(IEnumerable<DailyLogResponse>), StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
public async Task<ActionResult<IEnumerable<DailyLogResponse>>> GetAllLogsAsync(
    [FromQuery] int limit = 50,
    [FromQuery] string sortBy = "date",
    [FromQuery] string sortOrder = "desc",
    CancellationToken ct = default)
```

**Implementation Steps:**
1. Add `GetAllAsync()` method to `IDailyLogRepository` if missing
2. Implement repository method to query all logs with sorting and limit
3. Validate query parameters:
   - `limit` must be > 0 and <= 500
   - `sortBy` must be one of: `date`, `project`, `time`
   - `sortOrder` must be one of: `asc`, `desc`
4. Apply sorting logic based on parameters
5. Apply limit to result set
6. Map to `DailyLogResponse` DTOs

**Repository Method (if missing):**
```csharp
// IDailyLogRepository.cs
Task<ServiceResult<IEnumerable<DailyLog>>> GetAllAsync(
    int limit = 50,
    string sortBy = "date",
    bool descending = true,
    CancellationToken ct = default);

// DailyLogRepository.cs implementation
public async Task<ServiceResult<IEnumerable<DailyLog>>> GetAllAsync(
    int limit = 50,
    string sortBy = "date",
    bool descending = true,
    CancellationToken ct = default)
{
    try
    {
        IQueryable<DailyLog> query = _context.DailyLogs;

        query = sortBy.ToLower() switch
        {
            "date" => descending ? query.OrderByDescending(l => l.Date) : query.OrderBy(l => l.Date),
            "project" => descending ? query.OrderByDescending(l => l.ProjectId) : query.OrderBy(l => l.ProjectId),
            "time" => descending ? query.OrderByDescending(l => l.TimeSpentMinutes) : query.OrderBy(l => l.TimeSpentMinutes),
            _ => query.OrderByDescending(l => l.Date)
        };

        var logs = await query.Take(limit).ToListAsync(ct);
        return ServiceResult<IEnumerable<DailyLog>>.Success(logs);
    }
    catch (Exception ex)
    {
        return ServiceResult<IEnumerable<DailyLog>>.Failure($"Failed to retrieve logs: {ex.Message}");
    }
}
```

---

## Files to Modify

### Backend (C#)

1. **`src/Core/Interfaces/IMetricsService.cs`**
   - Add: `Task<ServiceResult<MetricsSummary>> GetDashboardSummaryAsync(CancellationToken ct)`

2. **`src/Core/Services/MetricsService.cs`**
   - Implement: `GetDashboardSummaryAsync` method

3. **`src/API/Controllers/MetricsController.cs`**
   - Add: `GetDashboardSummaryAsync` endpoint (`[HttpGet("dashboard/summary")]`)

4. **`src/Core/Interfaces/IDailyLogRepository.cs`**
   - Add (if missing): `Task<ServiceResult<IEnumerable<DailyLog>>> GetAllAsync(...)`

5. **`src/Infrastructure/Repositories/DailyLogRepository.cs`**
   - Implement (if missing): `GetAllAsync` method

6. **`src/API/Controllers/DailyLogsController.cs`**
   - Add: `GetAllLogsAsync` endpoint (`[HttpGet]`)

### Tests

7. **`tests/Unit/Core/Controllers/MetricsControllerTests.cs`**
   - Add 3 unit tests for dashboard summary

8. **`tests/Unit/Core/Controllers/DailyLogsControllerTests.cs`**
   - Add 5 unit tests for all logs endpoint

9. **`tests/Integration/Controllers/MetricsControllerTests.cs`**
   - Add 2 integration tests

10. **`tests/Integration/Controllers/DailyLogsControllerTests.cs`**
    - Add 2 integration tests

---

## Expected Behavior After Implementation

1. **Dashboard loads without 404 errors**
   - Angular `MetricsService.getDashboardMetrics()` receives 200 OK
   - Dashboard displays: total projects, active projects, hours worked, revenue, streaks

2. **Activity list populates with recent logs**
   - Angular `DailyLogService.getAllLogs()` receives 200 OK
   - Activity list shows 50 most recent daily logs sorted by date

3. **All tests pass**
   - `dotnet test` shows 100% pass rate
   - No regressions in existing functionality

---

## Verification Steps

1. Start Docker containers: `docker compose -p personalexecutionos_v2 up -d`
2. Open browser: `http://localhost:8080`
3. Open DevTools Console: Verify no 404 errors
4. Check Network tab:
   - `GET /api/metrics/dashboard/summary` → Status 200
   - `GET /api/dailylogs` → Status 200
5. Verify dashboard displays metrics and activity list shows logs
6. Run tests: `dotnet test --filter FullyQualifiedName~MetricsController|DailyLogsController`

---

## Notes

- **Snake_case Response Format:** The API already uses `PropertyNamingPolicy = null` in `Program.cs`, but verify that the Angular `ResponseTransformInterceptor` correctly transforms `snake_case` responses to `camelCase` for the new endpoints.

- **Performance Consideration:** The dashboard summary endpoint aggregates ALL projects and logs. For production with large datasets, consider adding caching (e.g., Redis) or pre-computed metrics tables.

- **Future Enhancement:** Add query parameters to dashboard summary for date ranges (e.g., `?startDate=2026-01-01&endDate=2026-01-31`) to allow time-boxed metrics.

- **Existing Code Reuse:** Leverage existing `MetricsService` methods (time/revenue/streak calculations) where possible to avoid duplication.

---

## Risk Assessment

**Low Risk**
- Additive changes only (no modification of existing endpoints)
- Well-defined contracts matching existing Angular services
- Standard CRUD operations with proven patterns already in codebase
- Clear test requirements ensure quality

**Potential Issues:**
- Empty database: If no projects/logs exist, ensure endpoints return valid empty responses (not 404)
- Streak calculation edge cases: Single log, gaps in dates, logs on same day
- Performance: Large datasets may slow down aggregation (mitigate with query optimization and indexing)
