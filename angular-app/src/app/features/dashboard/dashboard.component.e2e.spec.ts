import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { ProjectService, DailyLogService, MetricsService } from '@core/services';
import { Project, DailyLogResponse, MetricsSummary } from '@models/index';
import { of } from 'rxjs';

/**
 * Comprehensive end-to-end dashboard workflow tests.
 * Tests the complete workflow: load dashboard -> create project -> select project -> log work -> view metrics
 */
describe('DashboardComponent - End-to-End Workflows', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockDailyLogService: jasmine.SpyObj<DailyLogService>;
  let mockMetricsService: jasmine.SpyObj<MetricsService>;

  const mockProjects: Project[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Website Redesign',
      description: 'Complete website redesign',
      goal: 'Modern responsive design',
      startDate: '2025-01-01',
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-10T00:00:00Z'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'API Development',
      description: 'Backend API development',
      goal: 'RESTful API',
      startDate: '2025-01-05',
      isActive: false,
      createdAt: '2025-01-05T00:00:00Z',
      updatedAt: '2025-01-08T00:00:00Z'
    }
  ];

  const mockLogs: DailyLogResponse[] = [
    {
      id: '660e8400-e29b-41d4-a716-446655440001',
      projectId: mockProjects[0].id,
      date: '2025-01-15',
      taskDescription: 'Implemented homepage design',
      timeSpentMinutes: 480,
      outputDescription: 'Homepage mockup completed',
      revenueGenerated: 800,
      note: 'Productive day',
      createdAt: '2025-01-15T00:00:00Z',
      updatedAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440002',
      projectId: mockProjects[0].id,
      date: '2025-01-14',
      taskDescription: 'Designed footer components',
      timeSpentMinutes: 240,
      outputDescription: 'Footer designs ready',
      revenueGenerated: 400,
      note: '',
      createdAt: '2025-01-14T00:00:00Z',
      updatedAt: '2025-01-14T00:00:00Z'
    }
  ];

  const mockMetrics: MetricsSummary = {
    totalProjects: 2,
    activeProjects: 1,
    totalTimeHours: 12.5,
    totalRevenue: 1200,
    averageHourlyRate: 96,
    currentStreakDays: 5,
    longestStreakDays: 10,
    lastActivityDate: '2025-01-15'
  };

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getAllProjects',
      'getActiveProject',
      'createProject',
      'updateProject'
    ]);
    mockDailyLogService = jasmine.createSpyObj('DailyLogService', [
      'getLogsByProjectAndDateRange',
      'createLog'
    ]);
    mockMetricsService = jasmine.createSpyObj('MetricsService', ['getDashboardMetrics']);

    mockProjectService.getAllProjects.and.returnValue(of(mockProjects));
    mockProjectService.getActiveProject.and.returnValue(of(mockProjects[0]));
    mockDailyLogService.getLogsByProjectAndDateRange.and.returnValue(of(mockLogs));
    mockMetricsService.getDashboardMetrics.and.returnValue(of(mockMetrics));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: DailyLogService, useValue: mockDailyLogService },
        { provide: MetricsService, useValue: mockMetricsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Dashboard Initialization', () => {
    it('should load projects, active project, logs, and metrics on init', fakeAsync(() => {
      tick();

      expect(component.projects.length).toBe(2);
      expect(component.activeProject).toBe(mockProjects[0]);
      expect(component.recentLogs.length).toBe(2);
      expect(component.dashboardMetrics).toEqual(mockMetrics);
      expect(component.isLoading).toBeFalsy();
    }));

    it('should calculate total hours from logs', fakeAsync(() => {
      tick();

      expect(component.totalLogsHours).toBe(12);
    }));

    it('should display error when project loading fails', fakeAsync(() => {
      mockProjectService.getAllProjects.and.returnValue(
        of(undefined as any)
      );
      component.ngOnInit();
      tick();

      expect(component.isLoading).toBeFalsy();
    }));
  });

  describe('Project Selection Workflow', () => {
    it('should switch active project when selected from dropdown', fakeAsync(() => {
      tick();
      const secondProject = mockProjects[1];

      component.onProjectSelected(secondProject.id);
      tick();

      expect(component.activeProject).toEqual(secondProject);
    }));

    it('should reload logs when project changes', fakeAsync(() => {
      tick();
      const callCount = mockDailyLogService.getLogsByProjectAndDateRange.calls.count();

      component.onProjectSelected(mockProjects[1].id);
      tick();

      expect(mockDailyLogService.getLogsByProjectAndDateRange.calls.count()).toBeGreaterThan(
        callCount
      );
    }));

    it('should handle invalid project selection gracefully', fakeAsync(() => {
      tick();
      const originalProject = component.activeProject;

      component.onProjectSelected('non-existent-id');
      tick();

      expect(component.activeProject).toEqual(originalProject);
    }));
  });

  describe('Modal State Management', () => {
    it('should open new project modal', () => {
      component.openNewProjectModal();

      expect(component.isProjectModalOpen).toBeTruthy();
      expect(component.selectedProjectForEdit).toBeNull();
    });

    it('should open edit project modal with project data', () => {
      component.openEditProjectModal(mockProjects[0]);

      expect(component.isProjectModalOpen).toBeTruthy();
      expect(component.selectedProjectForEdit).toEqual(mockProjects[0]);
    });

    it('should open log work modal', () => {
      component.openLogWorkModal();

      expect(component.isLogModalOpen).toBeTruthy();
      expect(component.selectedLogForEdit).toBeNull();
    });

    it('should open edit log modal with log data', () => {
      component.openEditLogModal(mockLogs[0]);

      expect(component.isLogModalOpen).toBeTruthy();
      expect(component.selectedLogForEdit).toEqual(mockLogs[0]);
    });

    it('should close project modal and reload data on project save', fakeAsync(() => {
      component.openNewProjectModal();
      const newProject: Project = {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'New Project',
        description: 'New project',
        goal: 'Test goal',
        startDate: '2025-01-15',
        isActive: true,
        createdAt: '2025-01-15T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z'
      };

      component.onProjectSaved(newProject);
      tick();

      expect(component.isProjectModalOpen).toBeFalsy();
      expect(mockProjectService.getAllProjects).toHaveBeenCalled();
    }));

    it('should close log modal and reload data on log save', fakeAsync(() => {
      component.openLogWorkModal();
      const newLog: DailyLogResponse = {
        id: '660e8400-e29b-41d4-a716-446655440003',
        projectId: mockProjects[0].id,
        date: '2025-01-15',
        taskDescription: 'New log entry',
        timeSpentMinutes: 120,
        outputDescription: 'Work completed',
        revenueGenerated: 200,
        note: 'Great work',
        createdAt: '2025-01-15T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z'
      };

      component.onLogSaved(newLog);
      tick();

      expect(component.isLogModalOpen).toBeFalsy();
      expect(mockProjectService.getAllProjects).toHaveBeenCalled();
    }));
  });

  describe('Complete Workflow: Create Project → Select → Log Work', () => {
    it('should complete create project workflow', fakeAsync(() => {
      // 1. Open new project modal
      component.openNewProjectModal();
      expect(component.isProjectModalOpen).toBeTruthy();

      // 2. Simulate project creation
      const newProject: Project = {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'E-Commerce Platform',
        description: 'Building e-commerce platform',
        goal: 'Launch MVP',
        startDate: '2025-01-15',
        isActive: true,
        createdAt: '2025-01-15T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z'
      };

      component.onProjectSaved(newProject);
      tick();

      // 3. Modal should close and data should reload
      expect(component.isProjectModalOpen).toBeFalsy();
      expect(mockProjectService.getAllProjects).toHaveBeenCalled();
    }));

    it('should complete log work workflow', fakeAsync(() => {
      tick();

      // 1. Verify we have an active project
      expect(component.activeProject).toBeTruthy();

      // 2. Open log work modal
      component.openLogWorkModal();
      expect(component.isLogModalOpen).toBeTruthy();

      // 3. Simulate log creation
      const newLog: DailyLogResponse = {
        id: '660e8400-e29b-41d4-a716-446655440004',
        projectId: component.activeProject!.id,
        date: '2025-01-15',
        taskDescription: 'Worked on database optimization',
        timeSpentMinutes: 300,
        outputDescription: 'Query performance improved 50%',
        revenueGenerated: 500,
        note: 'Excellent progress',
        createdAt: '2025-01-15T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z'
      };

      component.onLogSaved(newLog);
      tick();

      // 4. Modal should close and data should reload
      expect(component.isLogModalOpen).toBeFalsy();
      expect(mockProjectService.getAllProjects).toHaveBeenCalled();
    }));

    it('should handle complete user session: init → select project → log work → view results', fakeAsync(() => {
      // Step 1: Dashboard initializes
      tick();
      expect(component.projects.length).toBe(2);
      expect(component.activeProject).toEqual(mockProjects[0]);

      // Step 2: User selects different project
      component.onProjectSelected(mockProjects[1].id);
      tick();
      expect(component.activeProject).toEqual(mockProjects[1]);

      // Step 3: User opens log work modal
      component.openLogWorkModal();
      expect(component.isLogModalOpen).toBeTruthy();

      // Step 4: User logs work
      const sessionLog: DailyLogResponse = {
        id: 'new-log-id',
        projectId: mockProjects[1].id,
        date: '2025-01-15',
        taskDescription: 'Completed API endpoint development',
        timeSpentMinutes: 420,
        outputDescription: 'POST /api/orders endpoint ready',
        revenueGenerated: 1000,
        note: 'High productivity session',
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T17:00:00Z'
      };

      component.onLogSaved(sessionLog);
      tick();

      // Step 5: Verify modal closed and data updated
      expect(component.isLogModalOpen).toBeFalsy();
      expect(mockProjectService.getAllProjects).toHaveBeenCalled();

      // Step 6: Verify metrics display
      expect(component.dashboardMetrics).toBeTruthy();
      expect(component.dashboardMetrics?.totalTimeHours).toBe(12.5);
    }));
  });

  describe('Data Refresh', () => {
    it('should refresh all dashboard data on manual refresh', fakeAsync(() => {
      tick();
      const initialCallCount = mockProjectService.getAllProjects.calls.count();

      component.onRefresh();
      tick();

      expect(mockProjectService.getAllProjects.calls.count()).toBeGreaterThan(
        initialCallCount
      );
    }));

    it('should maintain modal state during data refresh', fakeAsync(() => {
      tick();
      component.openLogWorkModal();
      component.selectedLogForEdit = mockLogs[0];

      component.onRefresh();
      tick();

      // Modal state should not be affected by refresh
      expect(component.isLogModalOpen).toBeTruthy();
      expect(component.selectedLogForEdit).toEqual(mockLogs[0]);
    }));
  });

  describe('Error Handling', () => {
    it('should display error when dashboard data fails to load', fakeAsync(() => {
      mockProjectService.getAllProjects.and.returnValue(
        throwError(() => new Error('Network error'))
      );
      component.ngOnInit();
      tick();

      expect(component.error).toBeTruthy();
    }));

    it('should allow retry after error', fakeAsync(() => {
      component.error = 'Previous error';
      mockProjectService.getAllProjects.and.returnValue(of(mockProjects));

      component.onRefresh();
      tick();

      expect(component.error).toBeNull();
      expect(component.projects).toEqual(mockProjects);
    }));
  });

  describe('Empty States', () => {
    it('should handle dashboard with no projects', fakeAsync(() => {
      mockProjectService.getAllProjects.and.returnValue(of([]));
      mockProjectService.getActiveProject.and.returnValue(of(undefined as any));

      component.ngOnInit();
      tick();

      expect(component.projects.length).toBe(0);
      expect(component.activeProject).toBeUndefined();
    }));

    it('should handle project with no logs', fakeAsync(() => {
      mockDailyLogService.getLogsByProjectAndDateRange.and.returnValue(of([]));

      component.ngOnInit();
      tick();

      expect(component.recentLogs.length).toBe(0);
      expect(component.totalLogsHours).toBe(0);
    }));
  });
});

// Helper function for throwError
function throwError(fn: () => Error) {
  return new Promise((_, reject) => {
    reject(fn());
  });
}
