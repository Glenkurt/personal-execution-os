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

  it('should display all metric cards when metrics provided', () => {
    component.metrics = mockMetrics;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Total Hours');
    expect(compiled.textContent).toContain('Active Projects');
    expect(compiled.textContent).toContain('Current Streak');
    expect(compiled.textContent).toContain('Total Revenue');
    expect(compiled.textContent).toContain('Longest Streak');
    expect(compiled.textContent).toContain('Total Projects');
  });

  it('should display metric values correctly', () => {
    component.metrics = mockMetrics;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('240');
    expect(compiled.textContent).toContain('2');
    expect(compiled.textContent).toContain('7');
    expect(compiled.textContent).toContain('$3,500.00');
  });

  it('should display icons for each metric', () => {
    component.metrics = mockMetrics;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('⏱️');
    expect(compiled.textContent).toContain('📊');
    expect(compiled.textContent).toContain('🔥');
    expect(compiled.textContent).toContain('💰');
    expect(compiled.textContent).toContain('🏆');
    expect(compiled.textContent).toContain('📁');
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
