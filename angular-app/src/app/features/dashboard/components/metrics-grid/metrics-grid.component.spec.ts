import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetricsGridComponent } from './metrics-grid.component';
import { MetricsSummary } from '@models/index';

describe('MetricsGridComponent', () => {
  let component: MetricsGridComponent;
  let fixture: ComponentFixture<MetricsGridComponent>;

  const mockMetrics: MetricsSummary = {
    allProjectsHours: 160,
    activeProjectsCount: 3,
    thisMonthHours: 40,
    thisWeekHours: 8,
    averageHoursPerDay: 8,
    totalLogsCount: 20,
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

  it('should display total hours metric', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('160');
    expect(compiled.textContent).toContain('Total Hours');
  });

  it('should display active projects metric', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('3');
    expect(compiled.textContent).toContain('Active Projects');
  });

  it('should display monthly hours metric', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('40');
    expect(compiled.textContent).toContain('This Month');
  });

  it('should display weekly hours metric', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('8');
    expect(compiled.textContent).toContain('This Week');
  });

  it('should not display section when metrics is null', () => {
    component.metrics = null;
    fixture.detectChanges();
    const section = fixture.nativeElement.querySelector('.metrics-section');
    expect(section).toBeFalsy();
  });

  it('should display all four metric cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('.metric-card');
    expect(cards.length).toBe(4);
  });

  it('should format decimal values correctly', () => {
    component.metrics = {
      ...mockMetrics,
      allProjectsHours: 160.5,
      thisMonthHours: 40.75,
      thisWeekHours: 8.25,
    };
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('160.5');
  });
});
