import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@environments/environment';
import { Metrics, MetricsResponse, MetricsSummary } from '@models/index';

/**
 * MetricsService - Manages metrics-related API calls.
 * Handles retrieval of project and overall metrics.
 */
@Injectable({
  providedIn: 'root',
})
export class MetricsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/metrics`;

  /**
   * Get metrics for a specific project.
   * @param projectId - The project ID (GUID)
   */
  getProjectMetrics(projectId: string): Observable<MetricsResponse> {
    return this.http.get<MetricsResponse>(`${this.apiUrl}/${projectId}`);
  }

  /**
   * Get overall dashboard metrics summary.
   * Includes aggregated data from all projects.
   */
  getDashboardMetrics(): Observable<MetricsSummary> {
    return this.http.get<MetricsSummary>(`${this.apiUrl}/dashboard/summary`);
  }
}
