/**
 * Daily Log domain model and related types.
 * Represents work logged on a specific day for a project.
 */

/**
 * Core daily log entity.
 */
export interface DailyLog {
  id: string; // GUID from backend
  projectId: string; // GUID from backend
  date: string; // ISO 8601 date format: YYYY-MM-DD
  taskDescription: string;
  timeSpentMinutes: number;
  outputDescription: string;
  revenueGenerated: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request DTO for creating a daily log entry.
 */
export interface CreateDailyLogRequest {
  projectId: string; // GUID
  date: string; // ISO 8601 date format: YYYY-MM-DD
  taskDescription: string; // 1-500 characters
  timeSpentMinutes: number; // 0-1440
  outputDescription: string; // 1-500 characters
  revenueGenerated: number; // >= 0
  note?: string | null; // Optional
}

/**
 * Request DTO for updating a daily log entry.
 */
export interface UpdateDailyLogRequest {
  taskDescription?: string;
  timeSpentMinutes?: number;
  outputDescription?: string;
  revenueGenerated?: number;
  note?: string | null;
}

/**
 * Response DTO for daily log API responses.
 */
export interface DailyLogResponse {
  id: string; // GUID
  projectId: string; // GUID
  date: string;
  taskDescription: string;
  timeSpentMinutes: number;
  outputDescription: string;
  revenueGenerated: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Range query for daily logs with aggregated hours.
 */
export interface DailyLogRange {
  projectId: string;
  startDate: string; // ISO 8601 date format
  endDate: string; // ISO 8601 date format
  logs: DailyLog[];
  totalMinutes: number;
  totalHours: number;
  averageMinutesPerDay: number;
}

/**
 * Validation result for daily log operations.
 */
export interface DailyLogValidationError {
  field: keyof CreateDailyLogRequest | keyof UpdateDailyLogRequest;
  message: string;
}
