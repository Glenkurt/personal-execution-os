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
      const projectId = 1;
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
    it('should fetch dashboard summary metrics', () => {
      service.getDashboardMetrics().subscribe(() => {
        expect(true).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/dashboard/summary`);
      expect(req.request.method).toBe('GET');
      req.flush({
        allProjectsHours: 500,
        activeProjectsCount: 3,
        thisMonthHours: 100,
        thisWeekHours: 20,
        averageHoursPerDay: 8,
        totalLogsCount: 60,
      });
    });
  });
});
