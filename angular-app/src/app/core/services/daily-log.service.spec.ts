import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { DailyLogService } from './daily-log.service';
import { CreateDailyLogRequest, DailyLogResponse } from '@models/index';

describe('DailyLogService', () => {
  let service: DailyLogService;
  let httpMock: HttpTestingController;
  const apiUrl = '/api/dailylogs';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DailyLogService],
    });
    service = TestBed.inject(DailyLogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllLogs', () => {
    it('should fetch all daily logs', () => {
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
      ];

      service.getAllLogs().subscribe((logs) => {
        expect(logs.length).toBe(1);
        expect(logs[0].hoursWorked).toBe(8);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockLogs);
    });
  });

  describe('createLog', () => {
    it('should create a new daily log entry', () => {
      const request: CreateDailyLogRequest = {
        projectId: 1,
        logDate: '2025-01-10',
        hoursWorked: 8,
        description: 'Development work',
      };

      const mockResponse: DailyLogResponse = {
        id: 1,
        ...request,
        createdAt: '2025-01-10T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
      };

      service.createLog(request).subscribe((log) => {
        expect(log.hoursWorked).toBe(8);
        expect(log.projectId).toBe(1);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });
  });

  describe('getLogsByProjectAndDateRange', () => {
    it('should fetch logs for a project within date range', () => {
      const projectId = 1;
      const startDate = '2025-01-01';
      const endDate = '2025-01-31';

      service.getLogsByProjectAndDateRange(projectId, startDate, endDate).subscribe(() => {
        expect(true).toBeTruthy();
      });

      const req = httpMock.expectOne(
        (request) =>
          request.url === `${apiUrl}/project/${projectId}/range` &&
          request.params.get('startDate') === startDate &&
          request.params.get('endDate') === endDate
      );
      expect(req.request.method).toBe('GET');
      req.flush({
        projectId,
        startDate,
        endDate,
        logs: [],
        totalHours: 0,
        averageHoursPerDay: 0,
      });
    });
  });
});
