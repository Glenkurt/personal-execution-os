import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

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
      id: 1,
      name: 'Test Project',
      description: 'A test project',
      isActive: true,
      createdAt: '2025-01-10T00:00:00Z',
      updatedAt: '2025-01-10T00:00:00Z',
    },
  ];

  const mockLogs = [
    {
      id: 1,
      projectId: 1,
      logDate: '2025-01-10',
      hoursWorked: 8,
      description: 'Development work',
      createdAt: '2025-01-10T00:00:00Z',
      updatedAt: '2025-01-10T00:00:00Z',
    },
  ];

  const mockMetrics = {
    allProjectsHours: 160,
    activeProjectsCount: 1,
    thisMonthHours: 40,
    thisWeekHours: 8,
    averageHoursPerDay: 8,
    totalLogsCount: 20,
  };

  beforeEach(async () => {
    const projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getAllProjects']);
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

    projectService.getAllProjects.and.returnValue(of(mockProjects));
    dailyLogService.getAllLogs.and.returnValue(of(mockLogs));
    metricsService.getDashboardMetrics.and.returnValue(of(mockMetrics));

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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

  it('should set active project from projects list', () => {
    fixture.detectChanges();
    expect(component.activeProject).toEqual(mockProjects[0]);
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
  });

  it('should set isLoading to false after data loads', (done) => {
    fixture.detectChanges();
    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      done();
    }, 100);
  });
});
