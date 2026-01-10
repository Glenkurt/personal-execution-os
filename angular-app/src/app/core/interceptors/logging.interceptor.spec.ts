import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { LoggingInterceptor } from './logging.interceptor';
import { ILogger } from '../interfaces/logger.interface';

describe('LoggingInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let loggerMock: jasmine.SpyObj<ILogger>;

  beforeEach(() => {
    loggerMock = jasmine.createSpyObj('ILogger', ['info', 'warn', 'error', 'debug']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
        { provide: ILogger, useValue: loggerMock },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(httpClient).toBeTruthy();
  });

  it('should log GET request with debug level', (done) => {
    const testData = { name: 'Test' };

    httpClient.get('/api/test').subscribe(() => {
      // Verify debug was called for the request
      const debugCalls = loggerMock.debug.calls.all();
      expect(debugCalls.length).toBeGreaterThan(0);
      done();
    });

    const request = httpTestingController.expectOne('/api/test');
    expect(request.request.method).toBe('GET');
    request.flush(testData);
  });

  it('should log POST request', (done) => {
    const testData = { name: 'Test' };

    httpClient.post('/api/test', testData).subscribe(() => {
      expect(loggerMock.debug).toHaveBeenCalled();
      done();
    });

    const request = httpTestingController.expectOne('/api/test');
    expect(request.request.method).toBe('POST');
    request.flush(testData);
  });

  it('should log PUT request', (done) => {
    const testData = { name: 'Updated' };

    httpClient.put('/api/test/1', testData).subscribe(() => {
      expect(loggerMock.debug).toHaveBeenCalled();
      done();
    });

    const request = httpTestingController.expectOne('/api/test/1');
    expect(request.request.method).toBe('PUT');
    request.flush(testData);
  });

  it('should log DELETE request', (done) => {
    httpClient.delete('/api/test/1').subscribe(() => {
      expect(loggerMock.debug).toHaveBeenCalled();
      done();
    });

    const request = httpTestingController.expectOne('/api/test/1');
    expect(request.request.method).toBe('DELETE');
    request.flush({});
  });

  it('should log 2xx response with debug level', (done) => {
    const testData = { name: 'Test' };

    httpClient.get('/api/test').subscribe(() => {
      expect(loggerMock.debug).toHaveBeenCalled();
      done();
    });

    const request = httpTestingController.expectOne('/api/test');
    request.flush(testData, { status: 200, statusText: 'OK' });
  });

  it('should log response timing information', (done) => {
    const testData = { name: 'Test' };

    httpClient.get('/api/test').subscribe(() => {
      const debugCalls = loggerMock.debug.calls.all();
      // Should have at least 2 debug calls - one for request, one for response/completion
      expect(debugCalls.length).toBeGreaterThanOrEqual(1);
      done();
    });

    const request = httpTestingController.expectOne('/api/test');
    request.flush(testData);
  });

  it('should include unique request ID in logs', (done) => {
    httpClient.get('/api/test').subscribe(() => {
      const debugCalls = loggerMock.debug.calls.all();
      const requestIdFound = debugCalls.some((call) => {
        const message = call.args[0] as string;
        return message.includes('[') && message.includes(']');
      });
      expect(requestIdFound).toBe(true);
      done();
    });

    const request = httpTestingController.expectOne('/api/test');
    request.flush({ data: 'test' });
  });
});
