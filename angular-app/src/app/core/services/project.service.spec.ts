import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ProjectService } from './project.service';
import { CreateProjectRequest, ProjectResponse } from '@models/index';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;
  const apiUrl = '/api/projects';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectService],
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllProjects', () => {
    it('should fetch all projects', () => {
      const mockProjects: ProjectResponse[] = [
        {
          id: 1,
          name: 'Project 1',
          description: 'Test project',
          isActive: true,
          createdAt: '2025-01-10T00:00:00Z',
          updatedAt: '2025-01-10T00:00:00Z',
        },
      ];

      service.getAllProjects().subscribe((projects) => {
        expect(projects.length).toBe(1);
        expect(projects[0].name).toBe('Project 1');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockProjects);
    });
  });

  describe('getProjectById', () => {
    it('should fetch a project by ID', () => {
      const mockProject: ProjectResponse = {
        id: 1,
        name: 'Project 1',
        description: 'Test project',
        isActive: true,
        createdAt: '2025-01-10T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
      };

      service.getProjectById(1).subscribe((project) => {
        expect(project.id).toBe(1);
        expect(project.name).toBe('Project 1');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProject);
    });
  });

  describe('createProject', () => {
    it('should create a new project', () => {
      const request: CreateProjectRequest = {
        name: 'New Project',
        description: 'New test project',
      };

      const mockResponse: ProjectResponse = {
        id: 1,
        ...request,
        isActive: false,
        createdAt: '2025-01-10T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
      };

      service.createProject(request).subscribe((project) => {
        expect(project.name).toBe('New Project');
        expect(project.id).toBe(1);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });
  });

  describe('deleteProject', () => {
    it('should delete a project', () => {
      service.deleteProject(1).subscribe(() => {
        expect(true).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
