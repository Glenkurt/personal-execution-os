import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityListComponent } from './activity-list.component';
import { DailyLogResponse } from '@models/index';

describe('ActivityListComponent', () => {
  let component: ActivityListComponent;
  let fixture: ComponentFixture<ActivityListComponent>;

  const mockLogs: DailyLogResponse[] = [
    {
      id: 1,
      projectId: 1,
      logDate: '2025-01-10',
      hoursWorked: 8,
      description: 'Development work',
      createdAt: '2025-01-10T00:00:00Z',
      updatedAt: '2025-01-10T00:00:00Z',
    },
    {
      id: 2,
      projectId: 1,
      logDate: '2025-01-09',
      hoursWorked: 6,
      description: 'Bug fixes and testing',
      createdAt: '2025-01-09T00:00:00Z',
      updatedAt: '2025-01-09T00:00:00Z',
    },
    {
      id: 3,
      projectId: 2,
      logDate: '2025-01-08',
      hoursWorked: 4,
      description: 'Design review',
      createdAt: '2025-01-08T00:00:00Z',
      updatedAt: '2025-01-08T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityListComponent);
    component = fixture.componentInstance;
    component.logs = mockLogs;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display activity section when logs provided', () => {
    const section = fixture.nativeElement.querySelector('.activity-section');
    expect(section).toBeTruthy();
  });

  it('should display all log entries', () => {
    const items = fixture.nativeElement.querySelectorAll('.activity-item');
    expect(items.length).toBe(3);
  });

  it('should display hours worked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('8h');
    expect(compiled.textContent).toContain('6h');
    expect(compiled.textContent).toContain('4h');
  });

  it('should display activity descriptions', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Development work');
    expect(compiled.textContent).toContain('Bug fixes and testing');
    expect(compiled.textContent).toContain('Design review');
  });

  it('should display empty state when logs is null', () => {
    component.logs = null;
    fixture.detectChanges();
    const emptyState = fixture.nativeElement.querySelector('.empty-activity');
    expect(emptyState).toBeTruthy();
  });

  it('should display empty state when logs array is empty', () => {
    component.logs = [];
    fixture.detectChanges();
    const emptyState = fixture.nativeElement.querySelector('.empty-activity');
    expect(emptyState).toBeTruthy();
  });

  it('should display project badges', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Project #1');
    expect(compiled.textContent).toContain('Project #2');
  });

  it('should display three timeline dots', () => {
    const dots = fixture.nativeElement.querySelectorAll('.timeline-dot');
    expect(dots.length).toBe(3);
  });

  it('should display two timeline lines', () => {
    const lines = fixture.nativeElement.querySelectorAll('.timeline-line');
    expect(lines.length).toBe(2);
  });
});
