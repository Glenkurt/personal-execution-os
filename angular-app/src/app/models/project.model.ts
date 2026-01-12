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
  id: string; // GUID from backend
  name: string;
  description: string;
  goal: string | null;
  startDate: string; // ISO 8601 date format
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request DTO for creating a new project.
 */
export interface CreateProjectRequest {
  name: string; // 1-100 characters
  description?: string; // Optional, up to 500 characters
  goal?: string | null; // Optional, 1-500 characters
  startDate: string; // ISO 8601 date format
  isActive?: boolean; // Default: true
}

/**
 * Request DTO for updating an existing project.
 */
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  goal?: string | null;
  isActive?: boolean;
}

/**
 * Response DTO for project API responses.
 */
export interface ProjectResponse {
  id: string; // GUID
  name: string;
  description: string;
  goal: string | null;
  startDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request DTO for activating a project.
 */
export interface ActivateProjectRequest {
  projectId: string; // GUID
}

/**
 * Validation result for project operations.
 */
export interface ProjectValidationError {
  field: keyof CreateProjectRequest;
  message: string;
}
