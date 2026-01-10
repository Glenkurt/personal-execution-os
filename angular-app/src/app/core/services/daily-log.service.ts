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
  getLogById(id: number): Observable<DailyLogResponse> {
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
  updateLog(id: number, request: UpdateDailyLogRequest): Observable<DailyLogResponse> {
    return this.http.put<DailyLogResponse>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Delete a daily log entry.
   */
  deleteLog(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get logs for a specific project within a date range.
   * @param projectId - The project ID
   * @param startDate - Start date in ISO 8601 format (YYYY-MM-DD)
   * @param endDate - End date in ISO 8601 format (YYYY-MM-DD)
   */
  getLogsByProjectAndDateRange(
    projectId: number,
    startDate: string,
    endDate: string
  ): Observable<DailyLogRange> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<DailyLogRange>(
      `${this.apiUrl}/project/${projectId}/range`,
      { params }
    );
  }

  /**
   * Get logs for a specific project.
   */
  getLogsByProject(projectId: number): Observable<DailyLogResponse[]> {
    return this.http.get<DailyLogResponse[]>(`${this.apiUrl}/project/${projectId}`);
  }
}
