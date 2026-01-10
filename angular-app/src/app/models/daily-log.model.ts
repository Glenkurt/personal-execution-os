/**
 * Daily Log domain model and related types.
 * Represents work logged on a specific day for a project.
 */

/**
 * Core daily log entity.
 */
export interface DailyLog {
  id: number;
  projectId: number;
  logDate: string;
  hoursWorked: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request DTO for creating a daily log entry.
 * Hours must be between 0 and 24 and date must be valid.
 */
export interface CreateDailyLogRequest {
  projectId: number;
  logDate: string; // ISO 8601 date format: YYYY-MM-DD
  hoursWorked: number; // 0-24
  description: string; // 1-500 characters
}

/**
 * Request DTO for updating a daily log entry.
 */
export interface UpdateDailyLogRequest {
  hoursWorked?: number; // 0-24
  description?: string; // 1-500 characters
}

/**
 * Response DTO for daily log API responses.
 */
export interface DailyLogResponse {
  id: number;
  projectId: number;
  logDate: string;
  hoursWorked: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Range query for daily logs with aggregated hours.
 */
export interface DailyLogRange {
  projectId: number;
  startDate: string; // ISO 8601 date format
  endDate: string; // ISO 8601 date format
  logs: DailyLog[];
  totalHours: number;
  averageHoursPerDay: number;
}

/**
 * Validation result for daily log operations.
 */
export interface DailyLogValidationError {
  field: keyof CreateDailyLogRequest | keyof UpdateDailyLogRequest;
  message: string;
}
