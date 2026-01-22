# Task 19: Fix Project Activation and Optional OutputDescription Validation

## Overview

Two critical bugs are blocking user workflows:

1. **Project Activation Failure**: When trying to activate a project, the API returns `"An error occurred while saving the entity changes. See the inner exception for details."` — likely a database constraint issue related to the unique active project index.

2. **OutputDescription Required Error**: When logging work, users get an error that OutputDescription cannot be empty — but it should be optional per the DTO definition.

---

## Estimate

**1.5 days**

---

## Component

- **Backend**: Controllers, Models, DTOs, DbContext, Repositories
- **Database**: Migration for schema changes
- **Tests**: Unit + Integration tests

---

## Dependencies

- None (standalone bug fixes)

---

## Issue 1: Project Activation Failure

### Root Cause Analysis

The database has a unique filtered index on `IsActive = true`:

```csharp
// ApplicationDbContext.cs line 32-34
entity.HasIndex(p => p.IsActive)
    .IsUnique()
    .HasFilter("\"IsActive\" = true");
```

The `SetActiveAsync` method in `ProjectRepository.cs`:
1. Deactivates all other projects
2. Activates the target project  
3. Calls `SaveChangesAsync()`

**Problem**: EF Core may try to set the new project as active before the old ones are saved as inactive, violating the unique constraint. This is a race condition in the SaveChanges operation.

### Required Changes

**File: [src/Infrastructure/Repositories/ProjectRepository.cs](src/Infrastructure/Repositories/ProjectRepository.cs)**

```csharp
// Current implementation (around line 100-115)
public async Task<ServiceResult<Project>> SetActiveAsync(Guid projectId, CancellationToken ct = default)
```

**Fix**: Split into two separate SaveChanges calls to ensure deactivation completes before activation:

1. First, deactivate all currently active projects and save
2. Then, activate the target project and save

Alternatively, consider using a transaction with proper isolation.

### Acceptance Criteria

- [ ] User can activate a project when another project is already active
- [ ] User can activate a project when no project is currently active
- [ ] Only one project is active at any given time (constraint is preserved)
- [ ] API returns 200 with the activated project on success
- [ ] API returns appropriate error if project not found

### Required Tests

**Unit Tests:**
- [ ] Test activating a project when another is active (happy path)
- [ ] Test activating a project when none are active
- [ ] Test activating already active project (should succeed, idempotent)
- [ ] Test activating non-existent project (should return 404)

**Integration Tests:**
- [ ] End-to-end test: create 2 projects → activate first → activate second → verify only second is active

---

## Issue 2: OutputDescription Required but Should Be Optional

### Root Cause Analysis

There is an inconsistency across the stack:

| Layer | OutputDescription Status | File |
|-------|-------------------------|------|
| **DTO (CreateDailyLogRequest)** | Optional (`string?`) | `src/Core/DTOs/CreateDailyLogRequest.cs:31` |
| **Controller Validation** | **Required** (explicit check) | `src/API/Controllers/DailyLogsController.cs:63-66` |
| **Model (DailyLog)** | **Required** (`required string`) | `src/Core/Models/DailyLog.cs:33` |
| **DbContext** | **Required** (`.IsRequired()`) | `src/Infrastructure/Data/ApplicationDbContext.cs:44` |
| **Database Migration** | **Not Nullable** | `Migrations/20260106211015_InitialCreate.cs:39` |
| **Frontend DTO** | Optional | `angular-app/src/app/models/daily-log.model.ts:30` |

The DTO says optional, but every other layer treats it as required.

### Required Changes

#### Step 1: Update Model

**File: [src/Core/Models/DailyLog.cs](src/Core/Models/DailyLog.cs)** (line 32-33)

```csharp
// BEFORE:
/// <summary>
/// Description of what was produced/output (required, max 1000 chars)
/// </summary>
public required string OutputDescription { get; set; }

// AFTER:
/// <summary>
/// Description of what was produced/output (optional, max 1000 chars)
/// </summary>
public string? OutputDescription { get; set; }
```

#### Step 2: Update DbContext

**File: [src/Infrastructure/Data/ApplicationDbContext.cs](src/Infrastructure/Data/ApplicationDbContext.cs)** (line 44)

```csharp
// BEFORE:
entity.Property(dl => dl.OutputDescription).IsRequired().HasMaxLength(1000);

// AFTER:
entity.Property(dl => dl.OutputDescription).IsRequired(false).HasMaxLength(1000);
```

#### Step 3: Remove Controller Validation

**File: [src/API/Controllers/DailyLogsController.cs](src/API/Controllers/DailyLogsController.cs)** (lines 63-71)

Remove or modify the validation block:

```csharp
// REMOVE THIS BLOCK:
if (string.IsNullOrWhiteSpace(request.OutputDescription))
{
    _logger.LogWarning("Create daily log failed: output description is empty");
    return BadRequest(new { error = "Output description is required and cannot be empty" });
}
```

Keep the max length validation:
```csharp
if (request.OutputDescription?.Length > 1000)
{
    _logger.LogWarning("Create daily log failed: output description exceeds 1000 characters");
    return BadRequest(new { error = "Output description cannot exceed 1000 characters" });
}
```

Also check the **Update endpoint** (around line 268-277) for the same validation to remove.

#### Step 4: Update DTO Comment (optional clarity)

**File: [src/Core/DTOs/CreateDailyLogRequest.cs](src/Core/DTOs/CreateDailyLogRequest.cs)** (line 29-32)

Confirm the comment matches the optional status (already correct).

#### Step 5: Add Database Migration

Create a new migration to make the column nullable:

```bash
dotnet ef migrations add MakeOutputDescriptionOptional
```

The migration should alter the column:
```sql
ALTER TABLE "DailyLogs" ALTER COLUMN "OutputDescription" DROP NOT NULL;
```

### Acceptance Criteria

- [ ] User can create a daily log without providing OutputDescription
- [ ] User can create a daily log with an empty string for OutputDescription
- [ ] User can create a daily log with a valid OutputDescription (1-1000 chars)
- [ ] Validation still rejects OutputDescription > 1000 characters
- [ ] Existing daily logs with OutputDescription continue to work
- [ ] API returns 200/201 on success without OutputDescription

### Required Tests

**Unit Tests:**
- [ ] Test creating log without OutputDescription (should succeed)
- [ ] Test creating log with empty string OutputDescription (should succeed)
- [ ] Test creating log with valid OutputDescription (should succeed)
- [ ] Test creating log with OutputDescription > 1000 chars (should fail with 400)
- [ ] Test updating log to remove OutputDescription (should succeed)

**Integration Tests:**
- [ ] Create log without output → verify saved correctly
- [ ] Create log with output → update to remove output → verify null

---

## API Contract Reference

### POST /api/dailylogs (Create)

**Request Body:**
```json
{
  "projectId": "guid",
  "date": "2026-01-22",
  "taskDescription": "Worked on feature X",
  "timeSpentMinutes": 120,
  "outputDescription": null,  // ← OPTIONAL, can be omitted or null
  "revenueGenerated": 0,
  "note": null
}
```

**Response 201:**
```json
{
  "id": "guid",
  "projectId": "guid",
  "date": "2026-01-22",
  "taskDescription": "Worked on feature X",
  "timeSpentMinutes": 120,
  "outputDescription": null,
  "revenueGenerated": 0,
  "note": null,
  "createdAt": "2026-01-22T10:00:00Z"
}
```

### POST /api/projects/{id}/activate

**Response 200:**
```json
{
  "id": "guid",
  "name": "Project Name",
  "goal": "Project goal",
  "startDate": "2026-01-01",
  "isActive": true,
  "createdAt": "2026-01-01T00:00:00Z"
}
```

**Response 400 (activation failed):**
```json
{
  "error": "Failed to activate project: <reason>"
}
```

---

## Handoff Checklist

- [x] API contract present
- [x] Measurable acceptance criteria
- [x] Tests listed (unit + integration)
- [x] No remaining ambiguities

---

## Implementation Order

1. **Issue 2 first** (OutputDescription) — simpler, standalone change
   - Update model
   - Update DbContext
   - Remove controller validation
   - Add migration
   - Run tests
   
2. **Issue 1 second** (Project Activation) — requires careful transaction handling
   - Update repository method
   - Add tests
   - Verify constraint is still enforced

---

## Notes

- After creating the migration, ensure the database is updated: `dotnet ef database update`
- The frontend (Angular) already expects OutputDescription to be optional — no frontend changes needed
- The project activation fix should use a transaction to ensure atomicity
