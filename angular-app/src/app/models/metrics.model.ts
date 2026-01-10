/**
 * Metrics domain model.
 * Represents calculated metrics for projects and time tracking.
 */

/**
 * Core metrics entity for a project.
 */
export interface Metrics {
  projectId: number;
  totalHours: number;
  averageHoursPerDay: number;
  logsCount: number;
  lastLogDate: string;
  currentMonthHours: number;
  currentWeekHours: number;
  currentYearHours: number;
  weeklyTrend: WeeklyMetric[];
}

/**
 * Weekly trend data for metrics visualization.
 */
export interface WeeklyMetric {
  weekNumber: number;
  year: number;
  hoursLogged: number;
  daysLogged: number;
  averagePerDay: number;
}

/**
 * Response DTO for metrics API responses.
 */
export interface MetricsResponse {
  projectId: number;
  totalHours: number;
  averageHoursPerDay: number;
  logsCount: number;
  lastLogDate: string;
  currentMonthHours: number;
  currentWeekHours: number;
  currentYearHours: number;
  weeklyTrend: WeeklyMetric[];
}

/**
 * Summary metrics for dashboard overview.
 */
export interface MetricsSummary {
  allProjectsHours: number;
  activeProjectsCount: number;
  thisMonthHours: number;
  thisWeekHours: number;
  averageHoursPerDay: number;
  totalLogsCount: number;
}
