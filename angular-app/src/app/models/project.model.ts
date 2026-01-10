/**
 * Project domain model and related types.
 * Represents a project in the Personal Execution OS system.
 */

/**
 * Status enum for project state management.
 */
export enum ProjectStatus {
  Active = 'active',
  Paused = 'paused',
  Completed = 'completed',
  Archived = 'archived',
}

/**
 * Core project domain entity.
 */
export interface Project {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request DTO for creating a new project.
 */
export interface CreateProjectRequest {
  name: string;
  description: string;
}

/**
 * Request DTO for updating an existing project.
 */
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

/**
 * Response DTO for project API responses.
 */
export interface ProjectResponse {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request DTO for activating a project.
 */
export interface ActivateProjectRequest {
  projectId: number;
}

/**
 * Validation result for project operations.
 */
export interface ProjectValidationError {
  field: keyof CreateProjectRequest;
  message: string;
}
