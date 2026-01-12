import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { MetricsService } from './metrics.service';
import { MetricsResponse } from '@models/index';

describe('MetricsService', () => {
  let service: MetricsService;
  let httpMock: HttpTestingController;
  const apiUrl = '/api/metrics';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MetricsService],
    });
    service = TestBed.inject(MetricsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProjectMetrics', () => {
    it('should fetch metrics for a specific project', () => {
      const projectId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const mockMetrics: MetricsResponse = {
        projectId,
        totalHours: 160,
        averageHoursPerDay: 8,
        logsCount: 20,
        lastLogDate: '2025-01-10',
        currentMonthHours: 40,
        currentWeekHours: 8,
        currentYearHours: 160,
        weeklyTrend: [],
      };

      service.getProjectMetrics(projectId).subscribe((metrics) => {
        expect(metrics.projectId).toBe(projectId);
        expect(metrics.totalHours).toBe(160);
      });

      const req = httpMock.expectOne(`${apiUrl}/${projectId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMetrics);
    });
  });

  describe('getDashboardMetrics', () => {
    it('should fetch dashboard summary metrics with complete response', () => {
      const mockDashboardMetrics = {
        totalProjects: 5,
        activeProjects: 2,
        totalTimeHours: 240,
        totalRevenue: 3500,
        averageHourlyRate: 100,
        currentStreakDays: 7,
        longestStreakDays: 30,
        lastActivityDate: '2025-01-10T00:00:00Z',
      };

      service.getDashboardMetrics().subscribe((metrics) => {
        expect(metrics.totalProjects).toBe(5);
        expect(metrics.activeProjects).toBe(2);
        expect(metrics.totalTimeHours).toBe(240);
        expect(metrics.totalRevenue).toBe(3500);
        expect(metrics.currentStreakDays).toBe(7);
      });

      const req = httpMock.expectOne(`${apiUrl}/dashboard/summary`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDashboardMetrics);
    });

    it('should handle zero metrics gracefully', () => {
      const mockEmptyMetrics = {
        totalProjects: 0,
        activeProjects: 0,
        totalTimeHours: 0,
        totalRevenue: 0,
        averageHourlyRate: 0,
        currentStreakDays: 0,
        longestStreakDays: 0,
        lastActivityDate: null,
      };

      service.getDashboardMetrics().subscribe((metrics) => {
        expect(metrics.totalProjects).toBe(0);
        expect(metrics.activeProjects).toBe(0);
        expect(metrics.totalTimeHours).toBe(0);
      });

      const req = httpMock.expectOne(`${apiUrl}/dashboard/summary`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEmptyMetrics);
    });
  });
});
