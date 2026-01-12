import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogsListComponent } from './logs-list.component';
import { DailyLogResponse } from '@models/index';

describe('LogsListComponent', () => {
  let component: LogsListComponent;
  let fixture: ComponentFixture<LogsListComponent>;

  const mockLogs: DailyLogResponse[] = [
    {
      id: 'd4f1a89b-f5e2-48c1-b7e9-3f6c1d2e4a5b',
      projectId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      date: '2025-01-10',
      taskDescription: 'Development work',
      timeSpentMinutes: 480,
      outputDescription: 'Completed feature X',
      revenueGenerated: 150,
      note: null,
      createdAt: '2025-01-10T00:00:00Z',
      updatedAt: '2025-01-10T00:00:00Z',
    },
    {
      id: 'e5f2b90c-g6f3-49d2-c8f0-4g7d2e3f5b6c',
      projectId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      date: '2025-01-09',
      taskDescription: 'Testing and debugging',
      timeSpentMinutes: 240,
      outputDescription: 'Fixed 3 bugs',
      revenueGenerated: 75,
      note: null,
      createdAt: '2025-01-09T00:00:00Z',
      updatedAt: '2025-01-09T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogsListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LogsListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all logs', () => {
    component.logs = mockLogs;
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.log-item');
    expect(items.length).toBe(2);
  });

  it('should display log task description', () => {
    component.logs = [mockLogs[0]];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Development work');
  });

  it('should display log hours formatted', () => {
    component.logs = [mockLogs[0]];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('8h'); // 480 minutes = 8 hours
  });

  it('should display output description', () => {
    component.logs = [mockLogs[0]];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Completed feature X');
  });

  it('should display revenue when available', () => {
    component.logs = [mockLogs[0]];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('$150.00');
  });

  it('should not display revenue when zero', () => {
    const logsWithoutRevenue = [
      {
        ...mockLogs[0],
        revenueGenerated: 0,
      },
    ];
    component.logs = logsWithoutRevenue;
    fixture.detectChanges();

    const revenue = fixture.nativeElement.querySelector('.log-revenue');
    expect(revenue).toBeFalsy();
  });

  it('should display empty message when no logs', () => {
    component.logs = [];
    component.emptyMessage = 'No logs to display';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No logs to display');
  });

  it('should display default empty message when null', () => {
    component.logs = null;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Start logging your work');
  });

  it('should format dates correctly', () => {
    component.logs = [mockLogs[0]];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    // Date should be formatted as 'MMM dd, yyyy' so Jan 10, 2025
    expect(compiled.textContent).toContain('Jan 10, 2025');
  });
});
