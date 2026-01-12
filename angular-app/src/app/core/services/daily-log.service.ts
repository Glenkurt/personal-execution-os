import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@environments/environment';
import {
  DailyLog,
  DailyLogResponse,
  CreateDailyLogRequest,
  UpdateDailyLogRequest,
  DailyLogRange,
} from '@models/index';

/**
 * DailyLogService - Manages daily log-related API calls.
 * Handles CRUD operations for work log entries.
 */
@Injectable({
  providedIn: 'root',
})
export class DailyLogService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/dailylogs`;

  /**
   * Get all daily logs.
   */
  getAllLogs(): Observable<DailyLogResponse[]> {
    return this.http.get<DailyLogResponse[]>(this.apiUrl);
  }

  /**
   * Get a specific daily log by ID.
   */
  getLogById(id: string): Observable<DailyLogResponse> {
    return this.http.get<DailyLogResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new daily log entry.
   */
  createLog(request: CreateDailyLogRequest): Observable<DailyLogResponse> {
    return this.http.post<DailyLogResponse>(this.apiUrl, request);
  }

  /**
   * Update an existing daily log entry.
   */
  updateLog(id: string, request: UpdateDailyLogRequest): Observable<DailyLogResponse> {
    return this.http.put<DailyLogResponse>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Delete a daily log entry.
   */
  deleteLog(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get logs for a specific project within a date range.
   * @param projectId - The project ID (GUID)
   * @param startDate - Start date in ISO 8601 format (YYYY-MM-DD)
   * @param endDate - End date in ISO 8601 format (YYYY-MM-DD)
   */
  getLogsByProjectAndDateRange(
    projectId: string,
    startDate: string,
    endDate: string
  ): Observable<DailyLogResponse[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<DailyLogResponse[]>(
      `${this.apiUrl}/project/${projectId}/range`,
      { params }
    );
  }

  /**
   * Get logs for a specific project.
   */
  getLogsByProject(projectId: string): Observable<DailyLogResponse[]> {
    return this.http.get<DailyLogResponse[]>(`${this.apiUrl}/project/${projectId}`);
  }
}
