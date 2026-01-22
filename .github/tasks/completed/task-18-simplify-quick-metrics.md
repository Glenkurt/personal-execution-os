# Task 18: Simplify Quick Metrics Display

## Overview

Simplify the Quick Metrics section to show only the most relevant information: Total Hours, Total Revenue, Current Streak, and Longest Streak. Remove "Active Projects" and "Total Projects" metrics to reduce visual clutter.

## Estimate

0.5 days

## Component

Frontend Component: [metrics-grid.component.ts](../../angular-app/src/app/features/dashboard/components/metrics-grid/metrics-grid.component.ts)

## Dependencies

Task 17 must be completed first (Fix Quick Metrics Display)

---

## API Contract

**Not applicable** – No backend changes required. Uses existing `GET /api/metrics/dashboard/summary` endpoint.

---

## Acceptance Criteria

- [ ] Quick Metrics displays exactly 4 cards: Total Hours, Total Revenue, Current Streak, Longest Streak
- [ ] Active Projects and Total Projects are NOT displayed
- [ ] Cards use appropriate icons and formatting
- [ ] Revenue is formatted as currency
- [ ] Hours are formatted with 1 decimal place
- [ ] Streak days are displayed as integers
- [ ] Grid layout adapts responsively (2x2 on desktop, 1 column on mobile)
- [ ] All existing tests pass
- [ ] Updated test verifies correct metrics are displayed

---

## Implementation Details

### Current State

**File:** [angular-app/src/app/features/dashboard/components/metrics-grid/metrics-grid.component.ts](../../angular-app/src/app/features/dashboard/components/metrics-grid/metrics-grid.component.ts)

**Current template shows 4 cards (after Task 17 fixes):**
1. Total Hours (`totalTimeHours`)
2. Active Projects (`activeProjects`)
3. Total Revenue (`totalRevenue`)
4. Current Streak (`currentStreakDays`)

**Issue:** Missing "Longest Streak" and showing "Active Projects" which is not priority.

---

### Required Changes

#### Update Component Template

**File:** [angular-app/src/app/features/dashboard/components/metrics-grid/metrics-grid.component.ts](../../angular-app/src/app/features/dashboard/components/metrics-grid/metrics-grid.component.ts)

**Lines 14-45 (template section)**

**Updated Template:**

```html
<section class="section metrics-section" *ngIf="metrics">
  <h2>Quick Metrics</h2>
  <div class="metrics-grid">
    <!-- Card 1: Total Hours -->
    <div class="metric-card">
      <div class="metric-icon">⏰</div>
      <div class="metric-value">{{ metrics.totalTimeHours | number: '1.1-1' }}</div>
      <div class="metric-label">Total Hours</div>
      <div class="metric-subtitle">All time</div>
    </div>

    <!-- Card 2: Total Revenue -->
    <div class="metric-card">
      <div class="metric-icon">💰</div>
      <div class="metric-value">{{ metrics.totalRevenue | currency: 'USD':'symbol':'1.0-0' }}</div>
      <div class="metric-label">Total Revenue</div>
      <div class="metric-subtitle">All time</div>
    </div>

    <!-- Card 3: Current Streak -->
    <div class="metric-card">
      <div class="metric-icon">🔥</div>
      <div class="metric-value">{{ metrics.currentStreakDays }}</div>
      <div class="metric-label">Current Streak</div>
      <div class="metric-subtitle">Consecutive days</div>
    </div>

    <!-- Card 4: Longest Streak -->
    <div class="metric-card">
      <div class="metric-icon">🏆</div>
      <div class="metric-value">{{ metrics.longestStreakDays }}</div>
      <div class="metric-label">Longest Streak</div>
      <div class="metric-subtitle">Personal best</div>
    </div>
  </div>
</section>
```

**Changes:**
- ✅ Card 1: Total Hours (unchanged)
- ✅ Card 2: Total Revenue (changed subtitle to "All time")
- ✅ Card 3: Current Streak (unchanged)
- ✅ Card 4: **NEW** – Longest Streak (added)
- ❌ Removed: Active Projects card
- ❌ Removed: Total Projects card

**Icon choices:**
- ⏰ Total Hours (time)
- 💰 Total Revenue (money)
- 🔥 Current Streak (fire = momentum)
- 🏆 Longest Streak (trophy = achievement)

---

#### Optional: Update Grid Layout for 2x2 Display

**File:** Same file, styles section (Lines 46-133)

**Current grid layout:**

```css
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}
```

**Recommended update for consistent 2x2 layout:**

```css
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 columns on desktop */
  gap: 1.5rem;
}

/* Responsive: 1 column on mobile */
@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
```

**This ensures a clean 2x2 grid on desktop and single column on mobile.**

---

## Required Tests

### Frontend Component Test

**File:** `angular-app/src/app/features/dashboard/components/metrics-grid/metrics-grid.component.spec.ts`

**Test 1: Component displays correct 4 metrics**

```typescript
it('should display total hours, revenue, current streak, and longest streak', () => {
  const mockMetrics: MetricsSummary = {
    totalProjects: 5,
    activeProjects: 3,
    totalTimeHours: 120.5,
    totalRevenue: 15000.75,
    averageHourlyRate: 125,
    currentStreakDays: 7,
    longestStreakDays: 21,
    lastActivityDate: null
  };

  component.metrics = mockMetrics;
  fixture.detectChanges();

  const compiled = fixture.nativeElement as HTMLElement;
  const metricCards = compiled.querySelectorAll('.metric-card');

  // Should have exactly 4 cards
  expect(metricCards.length).toBe(4);

  // Verify content
  const text = compiled.textContent || '';
  expect(text).toContain('120.5'); // Total hours
  expect(text).toContain('15,001'); // Revenue (formatted)
  expect(text).toContain('7'); // Current streak
  expect(text).toContain('21'); // Longest streak
  expect(text).toContain('Total Hours');
  expect(text).toContain('Total Revenue');
  expect(text).toContain('Current Streak');
  expect(text).toContain('Longest Streak');
});
```

**Test 2: Component does NOT display removed metrics**

```typescript
it('should not display active projects or total projects', () => {
  const mockMetrics: MetricsSummary = {
    totalProjects: 5,
    activeProjects: 3,
    totalTimeHours: 120,
    totalRevenue: 15000,
    averageHourlyRate: 125,
    currentStreakDays: 7,
    longestStreakDays: 21,
    lastActivityDate: null
  };

  component.metrics = mockMetrics;
  fixture.detectChanges();

  const compiled = fixture.nativeElement as HTMLElement;
  const text = compiled.textContent || '';

  // Should NOT show these labels
  expect(text).not.toContain('Active Projects');
  expect(text).not.toContain('Total Projects');
});
```

**Test 3: Verify icons are present**

```typescript
it('should display appropriate icons for each metric', () => {
  const mockMetrics: MetricsSummary = {
    totalProjects: 5,
    activeProjects: 3,
    totalTimeHours: 120,
    totalRevenue: 15000,
    averageHourlyRate: 125,
    currentStreakDays: 7,
    longestStreakDays: 21,
    lastActivityDate: null
  };

  component.metrics = mockMetrics;
  fixture.detectChanges();

  const compiled = fixture.nativeElement as HTMLElement;
  const icons = compiled.querySelectorAll('.metric-icon');

  expect(icons.length).toBe(4);
  expect(icons[0].textContent).toContain('⏰'); // Time
  expect(icons[1].textContent).toContain('💰'); // Money
  expect(icons[2].textContent).toContain('🔥'); // Current streak
  expect(icons[3].textContent).toContain('🏆'); // Longest streak
});
```

---

### Integration Test (Optional)

**File:** `angular-app/src/app/features/dashboard/dashboard.component.e2e.spec.ts`

**Test: Dashboard displays simplified metrics**

```typescript
it('should display simplified quick metrics with 4 cards', fakeAsync(() => {
  mockMetricsService.getDashboardMetrics.and.returnValue(of({
    totalProjects: 5,
    activeProjects: 3,
    totalTimeHours: 120.5,
    totalRevenue: 15000,
    averageHourlyRate: 125,
    currentStreakDays: 7,
    longestStreakDays: 21,
    lastActivityDate: null
  }));

  component.ngOnInit();
  tick();
  fixture.detectChanges();

  const compiled = fixture.nativeElement as HTMLElement;
  const metricsSection = compiled.querySelector('.metrics-section');
  expect(metricsSection).toBeTruthy();

  const metricCards = metricsSection?.querySelectorAll('.metric-card');
  expect(metricCards?.length).toBe(4);

  const text = metricsSection?.textContent || '';
  expect(text).toContain('Total Hours');
  expect(text).toContain('Total Revenue');
  expect(text).toContain('Current Streak');
  expect(text).toContain('Longest Streak');
  expect(text).not.toContain('Active Projects');
}));
```

---

## Visual Design Reference

### Metrics Grid Layout (Desktop)

```
┌─────────────────────────────────────────────────┐
│  📊 Quick Metrics                               │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐    ┌─────────────┐           │
│  │ ⏰          │    │ 💰          │           │
│  │ 120.5       │    │ $15,001     │           │
│  │ Total Hours │    │ Total Revenue│          │
│  │ All time    │    │ All time    │           │
│  └─────────────┘    └─────────────┘           │
│                                                 │
│  ┌─────────────┐    ┌─────────────┐           │
│  │ 🔥          │    │ 🏆          │           │
│  │ 7           │    │ 21          │           │
│  │ Current Streak│  │ Longest Streak│         │
│  │ Consecutive days│ │ Personal best│         │
│  └─────────────┘    └─────────────┘           │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Metrics Grid Layout (Mobile)

```
┌──────────────────────┐
│ 📊 Quick Metrics     │
├──────────────────────┤
│ ┌──────────────────┐ │
│ │ ⏰               │ │
│ │ 120.5            │ │
│ │ Total Hours      │ │
│ │ All time         │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ 💰               │ │
│ │ $15,001          │ │
│ │ Total Revenue    │ │
│ │ All time         │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ 🔥               │ │
│ │ 7                │ │
│ │ Current Streak   │ │
│ │ Consecutive days │ │
│ └──────────────────┘ │
│                      │
│ ┌──────────────────┐ │
│ │ 🏆               │ │
│ │ 21               │ │
│ │ Longest Streak   │ │
│ │ Personal best    │ │
│ └──────────────────┘ │
└──────────────────────┘
```

---

## Notes

- Simplification improves UX by focusing on key metrics
- Current Streak shows ongoing momentum
- Longest Streak provides motivational goal
- Total Hours and Revenue track overall productivity and earnings
- Active/Total Projects removed as they're visible elsewhere in the dashboard
- This change requires Task 17 to be completed first (fixes data display issue)
