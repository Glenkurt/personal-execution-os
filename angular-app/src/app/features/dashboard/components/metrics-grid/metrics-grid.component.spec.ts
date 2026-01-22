import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetricsGridComponent } from './metrics-grid.component';
import { MetricsSummary } from '@models/index';

describe('MetricsGridComponent', () => {
  let component: MetricsGridComponent;
  let fixture: ComponentFixture<MetricsGridComponent>;

  const mockMetrics: MetricsSummary = {
    totalProjects: 5,
    activeProjects: 3,
    totalTimeHours: 120.5,
    totalRevenue: 15000.75,
    averageHourlyRate: 125,
    currentStreakDays: 7,
    longestStreakDays: 21,
    lastActivityDate: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricsGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricsGridComponent);
    component = fixture.componentInstance;
    component.metrics = mockMetrics;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display metrics section when metrics provided', () => {
    const section = fixture.nativeElement.querySelector('.metrics-section');
    expect(section).toBeTruthy();
  });

  it('should display total hours, revenue, current streak, and longest streak', () => {
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

  it('should not display active projects or total projects', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.textContent || '';

    // Should NOT show these labels
    expect(text).not.toContain('Active Projects');
    expect(text).not.toContain('Total Projects');
  });

  it('should display appropriate icons for each metric', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const icons = compiled.querySelectorAll('.metric-icon');

    expect(icons.length).toBe(4);
    expect(icons[0].textContent).toContain('⏰'); // Time
    expect(icons[1].textContent).toContain('💰'); // Money
    expect(icons[2].textContent).toContain('🔥'); // Current streak
    expect(icons[3].textContent).toContain('🏆'); // Longest streak
  });

  it('should not display section when metrics is null', () => {
    component.metrics = null;
    fixture.detectChanges();
    const section = fixture.nativeElement.querySelector('.metrics-section');
    expect(section).toBeFalsy();
  });

  it('should format hours with one decimal place', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('120.5');
  });

  it('should format revenue as currency', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    // Currency pipe formats $15,001
    expect(compiled.textContent).toContain('$');
    expect(compiled.textContent).toContain('15,001');
  });

  it('should display streak days as integers', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('7');
    expect(compiled.textContent).toContain('21');
  });
});
