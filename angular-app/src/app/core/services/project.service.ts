import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@environments/environment';
import {
  Project,
  ProjectResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  ActivateProjectRequest,
} from '@models/index';

/**
 * ProjectService - Manages project-related API calls.
 * Handles CRUD operations for projects.
 */
@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/projects`;

  /**
   * Get all projects.
   */
  getAllProjects(): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(this.apiUrl);
  }

  /**
   * Get the currently active project.
   */
  getActiveProject(): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`${this.apiUrl}/active/current`);
  }

  /**
   * Get a specific project by ID.
   */
  getProjectById(id: string): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new project.
   */
  createProject(request: CreateProjectRequest): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(this.apiUrl, request);
  }

  /**
   * Update an existing project.
   */
  updateProject(
    id: string,
    request: UpdateProjectRequest
  ): Observable<ProjectResponse> {
    return this.http.put<ProjectResponse>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Delete a project.
   */
  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Activate a project (set as current active project).
   */
  activateProject(request: ActivateProjectRequest): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(
      `${this.apiUrl}/${request.projectId}/activate`,
      {}
    );
  }
}
