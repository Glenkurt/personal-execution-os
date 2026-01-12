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
          id: 'd4f1a89b-f5e2-48c1-b7e9-3f6c1d2e4a5b',
          projectId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          date: '2025-01-10',
          taskDescription: 'Development work',
          timeSpentMinutes: 480,
          outputDescription: 'Completed feature',
          revenueGenerated: 150,
          note: null,
          createdAt: '2025-01-10T00:00:00Z',
          updatedAt: '2025-01-10T00:00:00Z',
        },
      ];

      service.getAllLogs().subscribe((logs) => {
        expect(logs.length).toBe(1);
        expect(logs[0].timeSpentMinutes).toBe(480);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockLogs);
    });
  });

  describe('getLogById', () => {
    it('should fetch a log by ID', () => {
      const logId = 'd4f1a89b-f5e2-48c1-b7e9-3f6c1d2e4a5b';
      const mockLog: DailyLogResponse = {
        id: logId,
        projectId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        date: '2025-01-10',
        taskDescription: 'Development work',
        timeSpentMinutes: 480,
        outputDescription: 'Completed feature',
        revenueGenerated: 150,
        note: null,
        createdAt: '2025-01-10T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
      };

      service.getLogById(logId).subscribe((log) => {
        expect(log.id).toBe(logId);
        expect(log.taskDescription).toBe('Development work');
      });

      const req = httpMock.expectOne(`${apiUrl}/${logId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockLog);
    });
  });

  describe('createLog', () => {
    it('should create a new daily log entry', () => {
      const request: CreateDailyLogRequest = {
        projectId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        date: '2025-01-10',
        taskDescription: 'Development work',
        timeSpentMinutes: 480,
        outputDescription: 'Completed feature',
        revenueGenerated: 150,
      };

      const mockResponse: DailyLogResponse = {
        id: 'd4f1a89b-f5e2-48c1-b7e9-3f6c1d2e4a5b',
        ...request,
        note: null,
        createdAt: '2025-01-10T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
      };

      service.createLog(request).subscribe((log) => {
        expect(log.timeSpentMinutes).toBe(480);
        expect(log.projectId).toBe('f47ac10b-58cc-4372-a567-0e02b2c3d479');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });
  });

  describe('updateLog', () => {
    it('should update an existing daily log', () => {
      const logId = 'd4f1a89b-f5e2-48c1-b7e9-3f6c1d2e4a5b';
      const updateRequest = {
        taskDescription: 'Updated task',
        timeSpentMinutes: 600,
      };

      const mockResponse: DailyLogResponse = {
        id: logId,
        projectId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        date: '2025-01-10',
        taskDescription: 'Updated task',
        timeSpentMinutes: 600,
        outputDescription: 'Completed feature',
        revenueGenerated: 150,
        note: null,
        createdAt: '2025-01-10T00:00:00Z',
        updatedAt: '2025-01-11T00:00:00Z',
      };

      service.updateLog(logId, updateRequest).subscribe((log) => {
        expect(log.taskDescription).toBe('Updated task');
        expect(log.timeSpentMinutes).toBe(600);
      });

      const req = httpMock.expectOne(`${apiUrl}/${logId}`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });
  });

  describe('deleteLog', () => {
    it('should delete a log', () => {
      const logId = 'd4f1a89b-f5e2-48c1-b7e9-3f6c1d2e4a5b';

      service.deleteLog(logId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${logId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('getLogsByProjectAndDateRange', () => {
    it('should fetch logs for a project within date range', () => {
      const projectId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const startDate = '2025-01-01';
      const endDate = '2025-01-31';

      service.getLogsByProjectAndDateRange(projectId, startDate, endDate).subscribe((result) => {
        expect(result.logs.length).toBe(1);
        expect(result.totalMinutes).toBe(480);
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
        logs: [
          {
            id: 'd4f1a89b-f5e2-48c1-b7e9-3f6c1d2e4a5b',
            projectId,
            date: '2025-01-10',
            taskDescription: 'Development work',
            timeSpentMinutes: 480,
            outputDescription: 'Completed feature',
            revenueGenerated: 150,
            note: null,
            createdAt: '2025-01-10T00:00:00Z',
            updatedAt: '2025-01-10T00:00:00Z',
          },
        ],
        totalMinutes: 480,
        totalHours: 8,
        averageMinutesPerDay: 480,
      });
    });
  });

  describe('getLogsByProject', () => {
    it('should fetch all logs for a project', () => {
      const projectId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const mockLogs: DailyLogResponse[] = [
        {
          id: 'd4f1a89b-f5e2-48c1-b7e9-3f6c1d2e4a5b',
          projectId,
          date: '2025-01-10',
          taskDescription: 'Development work',
          timeSpentMinutes: 480,
          outputDescription: 'Completed feature',
          revenueGenerated: 150,
          note: null,
          createdAt: '2025-01-10T00:00:00Z',
          updatedAt: '2025-01-10T00:00:00Z',
        },
      ];

      service.getLogsByProject(projectId).subscribe((logs) => {
        expect(logs.length).toBe(1);
        expect(logs[0].projectId).toBe(projectId);
      });

      const req = httpMock.expectOne(`${apiUrl}/project/${projectId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockLogs);
    });
  });
});
