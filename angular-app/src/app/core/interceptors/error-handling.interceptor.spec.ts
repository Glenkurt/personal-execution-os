import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { ErrorHandlingInterceptor } from './error-handling.interceptor';
import { ILogger } from '../interfaces/logger.interface';

describe('ErrorHandlingInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let loggerMock: jasmine.SpyObj<ILogger>;

  beforeEach(() => {
    loggerMock = jasmine.createSpyObj('ILogger', ['info', 'warn', 'error', 'debug']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: ErrorHandlingInterceptor, multi: true },
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

  it('should intercept successful requests', (done) => {
    const testData = { name: 'Test' };

    httpClient.get('/api/test').subscribe((data) => {
      expect(data).toEqual(testData);
      done();
    });

    const request = httpTestingController.expectOne('/api/test');
    expect(request.request.method).toBe('GET');
    request.flush(testData);
  });

  it('should handle 400 bad request error', (done) => {
    httpClient.get('/api/test').subscribe(
      () => fail('should have failed'),
      (error) => {
        expect(error.message).toContain('Invalid request');
        expect(loggerMock.warn).toHaveBeenCalled();
        done();
      }
    );

    httpTestingController
      .expectOne('/api/test')
      .flush(null, { status: 400, statusText: 'Bad Request' });
  });

  it('should handle 401 unauthorized error', (done) => {
    httpClient.get('/api/test').subscribe(
      () => fail('should have failed'),
      (error) => {
        expect(error.message).toContain('Session expired');
        done();
      }
    );

    httpTestingController
      .expectOne('/api/test')
      .flush(null, { status: 401, statusText: 'Unauthorized' });
  });

  it('should handle 403 forbidden error', (done) => {
    httpClient.get('/api/test').subscribe(
      () => fail('should have failed'),
      (error) => {
        expect(error.message).toContain('do not have permission');
        done();
      }
    );

    httpTestingController
      .expectOne('/api/test')
      .flush(null, { status: 403, statusText: 'Forbidden' });
  });

  it('should handle 404 not found error', (done) => {
    httpClient.get('/api/test').subscribe(
      () => fail('should have failed'),
      (error) => {
        expect(error.message).toContain('not found');
        done();
      }
    );

    httpTestingController
      .expectOne('/api/test')
      .flush(null, { status: 404, statusText: 'Not Found' });
  });

  it('should log client errors (4xx)', (done) => {
    httpClient.get('/api/test').subscribe(
      () => fail('should have failed'),
      () => {
        expect(loggerMock.warn).toHaveBeenCalled();
        done();
      }
    );

    httpTestingController
      .expectOne('/api/test')
      .flush(null, { status: 400, statusText: 'Bad Request' });
  });

  it('should transform error with timestamp', (done) => {
    httpClient.get('/api/test').subscribe(
      () => fail('should have failed'),
      (error) => {
        expect(error.timestamp).toBeTruthy();
        expect(error.status).toBe(404);
        done();
      }
    );

    httpTestingController
      .expectOne('/api/test')
      .flush(null, { status: 404, statusText: 'Not Found' });
  });
});
