import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { ResponseTransformInterceptor } from './response-transform.interceptor';

describe('ResponseTransformInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: ResponseTransformInterceptor, multi: true },
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

  it('should transform snake_case response to camelCase', (done) => {
    const snakeCaseResponse = {
      user_id: 1,
      first_name: 'John',
      last_name: 'Doe',
      user_email: 'john@example.com',
    };

    const expectedResponse = {
      userId: 1,
      firstName: 'John',
      lastName: 'Doe',
      userEmail: 'john@example.com',
    };

    httpClient.get('/api/users/1').subscribe((response) => {
      expect(response).toEqual(expectedResponse);
      done();
    });

    httpTestingController.expectOne('/api/users/1').flush(snakeCaseResponse);
  });

  it('should transform nested snake_case properties', (done) => {
    const snakeCaseResponse = {
      project_id: 1,
      project_name: 'My Project',
      project_owner: {
        user_id: 1,
        first_name: 'John',
        last_name: 'Doe',
      },
    };

    const expectedResponse = {
      projectId: 1,
      projectName: 'My Project',
      projectOwner: {
        userId: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
    };

    httpClient.get('/api/projects/1').subscribe((response) => {
      expect(response).toEqual(expectedResponse);
      done();
    });

    httpTestingController.expectOne('/api/projects/1').flush(snakeCaseResponse);
  });

  it('should transform arrays of objects', (done) => {
    const snakeCaseResponse = [
      { user_id: 1, first_name: 'John', last_name: 'Doe' },
      { user_id: 2, first_name: 'Jane', last_name: 'Smith' },
    ];

    const expectedResponse = [
      { userId: 1, firstName: 'John', lastName: 'Doe' },
      { userId: 2, firstName: 'Jane', lastName: 'Smith' },
    ];

    httpClient.get('/api/users').subscribe((response) => {
      expect(response).toEqual(expectedResponse);
      done();
    });

    httpTestingController.expectOne('/api/users').flush(snakeCaseResponse);
  });

  it('should transform deeply nested structures', (done) => {
    const snakeCaseResponse = {
      project_id: 1,
      project_data: {
        project_name: 'My Project',
        project_tasks: [
          { task_id: 1, task_name: 'Task 1' },
          { task_id: 2, task_name: 'Task 2' },
        ],
      },
    };

    const expectedResponse = {
      projectId: 1,
      projectData: {
        projectName: 'My Project',
        projectTasks: [
          { taskId: 1, taskName: 'Task 1' },
          { taskId: 2, taskName: 'Task 2' },
        ],
      },
    };

    httpClient.get('/api/projects/1').subscribe((response) => {
      expect(response).toEqual(expectedResponse);
      done();
    });

    httpTestingController.expectOne('/api/projects/1').flush(snakeCaseResponse);
  });

  it('should not transform error responses', (done) => {
    const errorResponse = { error_message: 'Not found' };

    httpClient.get('/api/users/999').subscribe(
      () => fail('should have failed'),
      () => {
        // Error responses are not transformed
        done();
      }
    );

    httpTestingController.expectOne('/api/users/999').flush(errorResponse, {
      status: 404,
      statusText: 'Not Found',
    });
  });

  it('should handle null response body', (done) => {
    httpClient.delete('/api/users/1').subscribe((response) => {
      expect(response).toBeNull();
      done();
    });

    httpTestingController.expectOne('/api/users/1').flush(null);
  });

  it('should preserve camelCase properties that are already camelCase', (done) => {
    const response = {
      userId: 1,
      firstName: 'John',
    };

    httpClient.get('/api/users/1').subscribe((data) => {
      expect(data).toEqual(response);
      done();
    });

    httpTestingController.expectOne('/api/users/1').flush(response);
  });

  it('should handle mixed snake_case and camelCase', (done) => {
    const snakeCaseResponse = {
      user_id: 1,
      firstName: 'John',
      last_name: 'Doe',
    };

    const expectedResponse = {
      userId: 1,
      firstName: 'John',
      lastName: 'Doe',
    };

    httpClient.get('/api/users/1').subscribe((response) => {
      expect(response).toEqual(expectedResponse);
      done();
    });

    httpTestingController.expectOne('/api/users/1').flush(snakeCaseResponse);
  });

  it('should handle empty arrays', (done) => {
    httpClient.get('/api/projects').subscribe((response) => {
      expect(response).toEqual([]);
      done();
    });

    httpTestingController.expectOne('/api/projects').flush([]);
  });

  it('should handle empty objects', (done) => {
    httpClient.get('/api/data').subscribe((response) => {
      expect(response).toEqual({});
      done();
    });

    httpTestingController.expectOne('/api/data').flush({});
  });
});
