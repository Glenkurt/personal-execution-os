# Task 15: Default Project in Log Work Form

## Overview

Pre-select the active project in the Log Work form to reduce friction when logging tasks, since users typically work on one active project at a time.

## Estimate

0.5 days

## Component

Angular Frontend – [daily-log-modal.component.ts](../../angular-app/src/app/shared/components/daily-log-modal/daily-log-modal.component.ts)

## Dependencies

None

---

## API Contract

**Not applicable** – No backend changes required.

---

## Acceptance Criteria

- [ ] When opening the Log Work modal and an active project is set (`selectedProjectId`), the project dropdown pre-selects that project
- [ ] If no active project is set (`selectedProjectId` is null), the dropdown remains with "Select a project"
- [ ] User can still change the pre-selected project if needed
- [ ] Form validation still requires a project to be selected
- [ ] Existing unit tests pass
- [ ] New test verifies default project selection behavior

---

## Implementation Details

### Current Behavior

**File:** [angular-app/src/app/shared/components/daily-log-modal/daily-log-modal.component.ts](../../angular-app/src/app/shared/components/daily-log-modal/daily-log-modal.component.ts)

- Line 24: Component receives `@Input() selectedProjectId: string | null = null`
- Lines 48–52: `ngOnInit()` sets today's date and project ID
- Currently sets `projectId: this.selectedProjectId || ''`

**Problem:** The form field is initialized once in `ngOnInit()`, but if `selectedProjectId` changes after initialization, it's not reflected.

### Required Changes

1. **Improve initialization logic:**
   - In `ngOnInit()`, always pre-select `selectedProjectId` if available
   - Ensure the value is set **after** the form is created

2. **Add OnChanges lifecycle:**
   - Implement `OnChanges` interface to detect when `selectedProjectId` changes
   - Update the `projectId` form control value when input changes

3. **Update template (if needed):**
   - Ensure the select dropdown binds correctly to `formControlName="projectId"`

### Example Code

```typescript
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';

export class DailyLogModalComponent implements OnInit, OnDestroy, OnChanges {
  // ... existing code ...

  ngOnInit(): void {
    if (this.log) {
      this.populateForm(this.log);
    } else {
      // Initialize with today's date and active project
      this.logForm.patchValue({ 
        date: this.today,
        projectId: this.selectedProjectId || ''
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update project selection when selectedProjectId input changes
    if (changes['selectedProjectId'] && !this.isEditMode) {
      const projectId = changes['selectedProjectId'].currentValue;
      if (projectId && this.logForm) {
        this.logForm.patchValue({ projectId });
      }
    }
  }
}
```

---

## Required Tests

### Unit Tests

**File:** `angular-app/src/app/shared/components/daily-log-modal/daily-log-modal.component.spec.ts`

1. **Test: Pre-select active project on initialization**
   - Setup: Set `selectedProjectId` to a valid GUID
   - Action: Call `ngOnInit()`
   - Assert: Form control `projectId` equals `selectedProjectId`

2. **Test: No pre-selection when selectedProjectId is null**
   - Setup: Set `selectedProjectId` to `null`
   - Action: Call `ngOnInit()`
   - Assert: Form control `projectId` is empty string

3. **Test: Update project when selectedProjectId changes**
   - Setup: Component initialized with `selectedProjectId = null`
   - Action: Change `selectedProjectId` to a valid GUID via `ngOnChanges`
   - Assert: Form control `projectId` updates to new value

4. **Test: Do not override project in edit mode**
   - Setup: Component in edit mode (log is provided)
   - Action: Call `ngOnChanges` with new `selectedProjectId`
   - Assert: Form control `projectId` remains unchanged

---

## Example Test Code

```typescript
describe('DailyLogModalComponent - Default Project', () => {
  it('should pre-select active project on init when selectedProjectId is provided', () => {
    const projectId = '123e4567-e89b-12d3-a456-426614174000';
    component.selectedProjectId = projectId;
    component.log = null; // Not in edit mode

    component.ngOnInit();

    expect(component.logForm.get('projectId')?.value).toBe(projectId);
  });

  it('should not pre-select when selectedProjectId is null', () => {
    component.selectedProjectId = null;
    component.log = null;

    component.ngOnInit();

    expect(component.logForm.get('projectId')?.value).toBe('');
  });

  it('should update projectId when selectedProjectId changes', () => {
    const newProjectId = '987e6543-e21b-12d3-a456-426614174999';
    component.selectedProjectId = null;
    component.ngOnInit();

    // Simulate input change
    const changes: SimpleChanges = {
      selectedProjectId: {
        currentValue: newProjectId,
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false
      }
    };
    component.ngOnChanges(changes);

    expect(component.logForm.get('projectId')?.value).toBe(newProjectId);
  });

  it('should not override projectId in edit mode', () => {
    const existingLog: DailyLogResponse = {
      id: '111',
      projectId: 'original-project-id',
      // ... other fields
    };
    component.log = existingLog;
    component.ngOnInit();

    const newProjectId = 'new-project-id';
    const changes: SimpleChanges = {
      selectedProjectId: {
        currentValue: newProjectId,
        previousValue: null,
        firstChange: false,
        isFirstChange: () => false
      }
    };
    component.ngOnChanges(changes);

    // Should keep original project from log
    expect(component.logForm.get('projectId')?.value).toBe('original-project-id');
  });
});
```

---

## Notes

- This improves UX by reducing one manual selection step
- Does not break existing functionality – users can still change the project
- Works seamlessly with single active project workflow
