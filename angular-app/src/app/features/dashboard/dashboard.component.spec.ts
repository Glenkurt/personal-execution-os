import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { ProjectService, DailyLogService, MetricsService } from '@core/services';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let projectService: jasmine.SpyObj<ProjectService>;
  let dailyLogService: jasmine.SpyObj<DailyLogService>;
  let metricsService: jasmine.SpyObj<MetricsService>;

  const mockProjects = [
    {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      name: 'Test Project',
      description: 'A test project',
      goal: null,
      startDate: '2025-01-10',
      isActive: true,
      createdAt: '2025-01-10T00:00:00Z',
      updatedAt: '2025-01-10T00:00:00Z',
    },
  ];

  const mockLogs = [
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
  ];

  const mockMetrics = {
    totalProjects: 5,
    activeProjects: 1,
    totalTimeHours: 160,
    totalRevenue: 2500,
    averageHourlyRate: 100,
    currentStreakDays: 5,
    longestStreakDays: 30,
    lastActivityDate: '2025-01-10T00:00:00Z',
  };

  beforeEach(async () => {
    const projectServiceSpy = jasmine.createSpyObj('ProjectService', [
      'getAllProjects',
      'getActiveProject',
    ]);
    const dailyLogServiceSpy = jasmine.createSpyObj('DailyLogService', ['getAllLogs']);
    const metricsServiceSpy = jasmine.createSpyObj('MetricsService', ['getDashboardMetrics']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: DailyLogService, useValue: dailyLogServiceSpy },
        { provide: MetricsService, useValue: metricsServiceSpy },
      ],
    }).compileComponents();

    projectService = TestBed.inject(ProjectService) as jasmine.SpyObj<ProjectService>;
    dailyLogService = TestBed.inject(DailyLogService) as jasmine.SpyObj<DailyLogService>;
    metricsService = TestBed.inject(MetricsService) as jasmine.SpyObj<MetricsService>;

    projectService.getActiveProject.and.returnValue(of(mockProjects[0]));
    projectService.getAllProjects.and.returnValue(of(mockProjects));
    dailyLogService.getAllLogs.and.returnValue(of(mockLogs));
    metricsService.getDashboardMetrics.and.returnValue(of(mockMetrics));

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load active project on init', () => {
    fixture.detectChanges();
    expect(projectService.getActiveProject).toHaveBeenCalled();
    expect(component.activeProject).toEqual(mockProjects[0]);
  });

  it('should load projects on init', () => {
    fixture.detectChanges();
    expect(projectService.getAllProjects).toHaveBeenCalled();
    expect(component.projects).toEqual(mockProjects);
  });

  it('should load metrics on init', () => {
    fixture.detectChanges();
    expect(metricsService.getDashboardMetrics).toHaveBeenCalled();
    expect(component.dashboardMetrics).toEqual(mockMetrics);
  });

  it('should load recent logs on init', () => {
    fixture.detectChanges();
    expect(dailyLogService.getAllLogs).toHaveBeenCalled();
    expect(component.recentLogs.length).toBe(1);
  });

  it('should display dashboard title', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Personal Execution OS');
  });

  it('should display active project name', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Project');
  });

  it('should display metrics', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Total Hours');
    expect(compiled.textContent).toContain('Active Projects');
  });

  it('should refresh dashboard on refresh button click', () => {
    fixture.detectChanges();
    component.onRefresh();
    expect(projectService.getAllProjects).toHaveBeenCalledTimes(2);
    expect(projectService.getActiveProject).toHaveBeenCalledTimes(2);
  });

  it('should set isLoading to false after data loads', (done) => {
    fixture.detectChanges();
    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      done();
    }, 100);
  });

  it('should handle when no active project exists', () => {
    projectService.getActiveProject.and.returnValue(throwError(() => new Error('No active project')));
    fixture.detectChanges();
    // Component should still work - activeProject will be null
    expect(component.activeProject).toBeNull();
  });

  it('should display error message on projects load failure', () => {
    projectService.getAllProjects.and.returnValue(throwError(() => new Error('Load failed')));
    fixture.detectChanges();
    setTimeout(() => {
      expect(component.error).toContain('projects');
      expect(component.isLoading).toBe(false);
    }, 100);
  });
});
