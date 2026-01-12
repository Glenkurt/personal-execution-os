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
          id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          name: 'Project 1',
          description: 'Test project',
          goal: null,
          startDate: '2025-01-10',
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

  describe('getActiveProject', () => {
    it('should fetch the active project', () => {
      const mockProject: ProjectResponse = {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        name: 'Active Project',
        description: 'Currently active project',
        goal: 'Complete feature X',
        startDate: '2025-01-10',
        isActive: true,
        createdAt: '2025-01-10T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
      };

      service.getActiveProject().subscribe((project) => {
        expect(project.name).toBe('Active Project');
        expect(project.isActive).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/active/current`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProject);
    });
  });

  describe('getProjectById', () => {
    it('should fetch a project by ID', () => {
      const projectId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const mockProject: ProjectResponse = {
        id: projectId,
        name: 'Project 1',
        description: 'Test project',
        goal: null,
        startDate: '2025-01-10',
        isActive: true,
        createdAt: '2025-01-10T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
      };

      service.getProjectById(projectId).subscribe((project) => {
        expect(project.id).toBe(projectId);
        expect(project.name).toBe('Project 1');
      });

      const req = httpMock.expectOne(`${apiUrl}/${projectId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProject);
    });
  });

  describe('createProject', () => {
    it('should create a new project', () => {
      const createRequest: CreateProjectRequest = {
        name: 'New Project',
        goal: 'Test goal',
        startDate: '2025-01-10',
        isActive: true,
      };

      const mockResponse: ProjectResponse = {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        ...createRequest,
        description: '',
        createdAt: '2025-01-10T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
      };

      service.createProject(createRequest).subscribe((project) => {
        expect(project.name).toBe('New Project');
        expect(project.id).toBeDefined();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockResponse);
    });
  });

  describe('updateProject', () => {
    it('should update an existing project', () => {
      const projectId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const updateRequest = {
        name: 'Updated Project',
      };

      const mockResponse: ProjectResponse = {
        id: projectId,
        name: 'Updated Project',
        description: 'Test project',
        goal: null,
        startDate: '2025-01-10',
        isActive: true,
        createdAt: '2025-01-10T00:00:00Z',
        updatedAt: '2025-01-11T00:00:00Z',
      };

      service.updateProject(projectId, updateRequest).subscribe((project) => {
        expect(project.name).toBe('Updated Project');
      });

      const req = httpMock.expectOne(`${apiUrl}/${projectId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockResponse);
    });
  });

  describe('deleteProject', () => {
    it('should delete a project', () => {
      const projectId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

      service.deleteProject(projectId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${projectId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('activateProject', () => {
    it('should activate a project', () => {
      const projectId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const activateRequest = { projectId };

      const mockResponse: ProjectResponse = {
        id: projectId,
        name: 'Activated Project',
        description: 'Test project',
        goal: null,
        startDate: '2025-01-10',
        isActive: true,
        createdAt: '2025-01-10T00:00:00Z',
        updatedAt: '2025-01-11T00:00:00Z',
      };

      service.activateProject(activateRequest).subscribe((project) => {
        expect(project.isActive).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/${projectId}/activate`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });
});
