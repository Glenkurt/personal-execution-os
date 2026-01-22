import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetricsPanelComponent } from './metrics-panel.component';
import { MetricsSummary } from '@models/index';

describe('MetricsPanelComponent', () => {
  let component: MetricsPanelComponent;
  let fixture: ComponentFixture<MetricsPanelComponent>;

  const mockMetrics: MetricsSummary = {
    totalProjects: 5,
    activeProjects: 2,
    totalTimeHours: 240,
    totalRevenue: 3500,
    averageHourlyRate: 100,
    currentStreakDays: 7,
    longestStreakDays: 30,
    lastActivityDate: '2025-01-10T00:00:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricsPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricsPanelComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all 4 simplified metric cards when metrics provided', () => {
    component.metrics = mockMetrics;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.textContent || '';
    expect(text).toContain('Total Hours');
    expect(text).toContain('Current Streak');
    expect(text).toContain('Total Revenue');
    expect(text).toContain('Longest Streak');
  });

  it('should not display active projects or total projects', () => {
    component.metrics = mockMetrics;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.textContent || '';
    expect(text).not.toContain('Active Projects');
    expect(text).not.toContain('Total Projects');
  });

  it('should not display panel when metrics is null', () => {
    component.metrics = null;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent.trim()).toBe('');
  });

  it('should format hours with 1 decimal place', () => {
    component.metrics = { ...mockMetrics, totalTimeHours: 240.5 };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('240.5');
  });

  it('should format revenue with 2 decimal places', () => {
    component.metrics = { ...mockMetrics, totalRevenue: 3500.1 };
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('$3,500.10');
  });

  it('should handle zero metrics', () => {
    const zeroMetrics: MetricsSummary = {
      totalProjects: 0,
      activeProjects: 0,
      totalTimeHours: 0,
      totalRevenue: 0,
      averageHourlyRate: 0,
      currentStreakDays: 0,
      longestStreakDays: 0,
      lastActivityDate: null,
    };
    component.metrics = zeroMetrics;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('0');
  });
});
