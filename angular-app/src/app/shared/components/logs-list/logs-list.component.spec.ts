import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogsListComponent } from './logs-list.component';
import { DailyLogResponse } from '../../../models/daily-log.model';

describe('LogsListComponent', () => {
  let component: LogsListComponent;
  let fixture: ComponentFixture<LogsListComponent>;

  const mockLogs: DailyLogResponse[] = [
    {
      id: '1',
      projectId: 'proj-1',
      date: '2025-01-15',
      taskDescription: 'Implement feature',
      timeSpentMinutes: 120,
      outputDescription: 'Feature completed',
      revenueGenerated: 100,
      note: 'Good progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      projectId: 'proj-1',
      date: '2025-01-14',
      taskDescription: 'Bug fixes',
      timeSpentMinutes: 60,
      outputDescription: 'Fixed critical bugs',
      revenueGenerated: 50,
      note: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogsListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LogsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display empty state when no logs', () => {
    component.logs = [];
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent).toContain('No logs found');
  });

  it('should display custom empty message', () => {
    component.logs = [];
    component.emptyMessage = 'No activities recorded';
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState.textContent).toContain('No activities recorded');
  });

  it('should display logs when provided', () => {
    component.logs = mockLogs;
    fixture.detectChanges();

    const logItems = fixture.nativeElement.querySelectorAll('.log-item');
    expect(logItems.length).toBe(2);
  });

  it('should format date correctly', () => {
    const dateString = '2025-01-15';
    const formatted = component.formatDate(dateString);

    expect(formatted).toContain('Jan');
    expect(formatted).toContain('15');
  });

  it('should format minutes to hours', () => {
    expect(component.formatHours(60)).toBe('1.0h');
    expect(component.formatHours(90)).toBe('1.5h');
    expect(component.formatHours(120)).toBe('2.0h');
    expect(component.formatHours(0)).toBe('0h');
  });

  it('should format currency correctly', () => {
    expect(component.formatCurrency(100)).toBe('$100.00');
    expect(component.formatCurrency(50.5)).toBe('$50.50');
    expect(component.formatCurrency(0)).toBe('$0');
    expect(component.formatCurrency(null)).toBe('$0');
    expect(component.formatCurrency(undefined)).toBe('$0');
  });

  it('should display task description when provided', () => {
    component.logs = mockLogs;
    fixture.detectChanges();

    const taskElement = fixture.nativeElement.querySelector('.log-task');
    expect(taskElement).toBeTruthy();
    expect(taskElement.textContent).toContain('Implement feature');
  });

  it('should display revenue when provided', () => {
    component.logs = mockLogs;
    fixture.detectChanges();

    const revenueBadges = fixture.nativeElement.querySelectorAll('.revenue-badge');
    expect(revenueBadges.length).toBeGreaterThan(0);
    expect(revenueBadges[0].textContent).toContain('$100.00');
  });

  it('should display hours for each log', () => {
    component.logs = mockLogs;
    fixture.detectChanges();

    const hoursElements = fixture.nativeElement.querySelectorAll('.log-hours');
    expect(hoursElements.length).toBe(2);
    expect(hoursElements[0].textContent).toBe('2.0h');
    expect(hoursElements[1].textContent).toBe('1.0h');
  });

  it('should not show empty state when logs are present', () => {
    component.logs = mockLogs;
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeNull();
  });
});
