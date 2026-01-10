import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { ProjectService, DailyLogService, MetricsService } from '@core/services';
import {
  Project,
  ProjectResponse,
  MetricsResponse,
  DailyLogResponse,
  MetricsSummary,
} from '@models/index';

/**
 * Dashboard component - Main feature component for the Personal Execution OS.
 * Displays active project, metrics, projects list, and recent activity.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <header class="dashboard-header">
        <h1>Personal Execution OS</h1>
        <p class="subtitle">Track your projects and log your work</p>
      </header>

      <!-- Action Bar (placeholder) -->
      <section class="action-bar">
        <button class="btn btn-primary" (click)="onRefresh()">
          {{ isLoading ? 'Loading...' : 'Refresh' }}
        </button>
        <button class="btn btn-secondary">Log Work</button>
        <button class="btn btn-secondary">New Project</button>
      </section>

      <!-- Active Project Section -->
      <section class="section active-project-section" *ngIf="activeProject">
        <h2>Active Project</h2>
        <div class="active-project-card">
          <h3>{{ activeProject.name }}</h3>
          <p>{{ activeProject.description }}</p>
          <div class="project-meta">
            <span class="badge badge-active">Active</span>
            <span class="meta-date">{{ activeProject.updatedAt | date: 'short' }}</span>
          </div>
        </div>
      </section>

      <!-- Metrics Grid (placeholder) -->
      <section class="section metrics-section" *ngIf="dashboardMetrics">
        <h2>Quick Metrics</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">{{ dashboardMetrics.allProjectsHours | number: '1.1-1' }}</div>
            <div class="metric-label">Total Hours</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ dashboardMetrics.activeProjectsCount }}</div>
            <div class="metric-label">Active Projects</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ dashboardMetrics.thisMonthHours | number: '1.1-1' }}</div>
            <div class="metric-label">This Month</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ dashboardMetrics.thisWeekHours | number: '1.1-1' }}</div>
            <div class="metric-label">This Week</div>
          </div>
        </div>
      </section>

      <!-- Projects List (placeholder) -->
      <section class="section projects-section" *ngIf="projects && projects.length > 0">
        <h2>All Projects ({{ projects.length }})</h2>
        <div class="projects-list">
          <div class="project-item" *ngFor="let project of projects">
            <div class="project-name">{{ project.name }}</div>
            <div class="project-description">{{ project.description }}</div>
            <div class="project-status">
              <span [class.active]="project.isActive" class="status-badge">
                {{ project.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Last Activity Section (placeholder) -->
      <section class="section activity-section" *ngIf="recentLogs && recentLogs.length > 0">
        <h2>Recent Activity</h2>
        <div class="activity-list">
          <div class="activity-item" *ngFor="let log of recentLogs">
            <div class="activity-time">{{ log.logDate | date: 'short' }}</div>
            <div class="activity-details">
              <div class="activity-hours">{{ log.hoursWorked }}h</div>
              <div class="activity-description">{{ log.description }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Empty State -->
      <section *ngIf="!isLoading && projects && projects.length === 0" class="empty-state">
        <p>No projects yet. Create your first project to get started!</p>
      </section>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-spinner">
        <p>Loading dashboard...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-message">
        <p>{{ error }}</p>
        <button class="btn btn-secondary" (click)="onRefresh()">Try Again</button>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .dashboard-header {
      margin-bottom: 2rem;
      border-bottom: 2px solid var(--primary-color, #2563eb);
      padding-bottom: 1rem;
    }

    .dashboard-header h1 {
      font-size: 2rem;
      margin: 0;
      color: var(--primary-color, #2563eb);
    }

    .subtitle {
      margin: 0.5rem 0 0 0;
      color: #666;
    }

    .action-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--primary-color, #2563eb);
      color: white;
    }

    .btn-primary:hover {
      opacity: 0.9;
    }

    .btn-secondary {
      background: white;
      color: var(--primary-color, #2563eb);
      border: 1px solid var(--primary-color, #2563eb);
    }

    .btn-secondary:hover {
      background: var(--primary-color, #2563eb);
      color: white;
    }

    .section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .section h2 {
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
      color: #333;
    }

    .active-project-card {
      padding: 1rem;
      background: linear-gradient(135deg, var(--primary-color, #2563eb) 0%, #1e40af 100%);
      color: white;
      border-radius: 6px;
    }

    .active-project-card h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
    }

    .active-project-card p {
      margin: 0 0 1rem 0;
      opacity: 0.9;
    }

    .project-meta {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .badge-active {
      background: rgba(255, 255, 255, 0.2);
    }

    .meta-date {
      font-size: 0.875rem;
      opacity: 0.8;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .metric-card {
      padding: 1.5rem;
      background: #f9fafb;
      border-radius: 6px;
      text-align: center;
      border-left: 4px solid var(--primary-color, #2563eb);
    }

    .metric-value {
      font-size: 2rem;
      font-weight: bold;
      color: var(--primary-color, #2563eb);
      margin-bottom: 0.5rem;
    }

    .metric-label {
      font-size: 0.875rem;
      color: #666;
    }

    .projects-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .project-item {
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .project-item:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .project-name {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .project-description {
      font-size: 0.875rem;
      color: #666;
      margin-bottom: 0.75rem;
      line-height: 1.4;
    }

    .project-status {
      display: flex;
      gap: 0.5rem;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #e5e7eb;
      color: #374151;
    }

    .status-badge.active {
      background: #d1fae5;
      color: #065f46;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .activity-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border-left: 3px solid var(--primary-color, #2563eb);
      background: #f9fafb;
      border-radius: 4px;
    }

    .activity-time {
      font-size: 0.875rem;
      color: #666;
      min-width: 80px;
    }

    .activity-details {
      flex: 1;
    }

    .activity-hours {
      font-weight: 600;
      color: var(--primary-color, #2563eb);
    }

    .activity-description {
      font-size: 0.875rem;
      color: #333;
      margin-top: 0.25rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #666;
    }

    .loading-spinner {
      text-align: center;
      padding: 3rem 1rem;
      color: #666;
    }

    .error-message {
      padding: 1rem;
      background: #fee2e2;
      color: #991b1b;
      border-radius: 6px;
      margin: 1rem 0;
    }

    .error-message p {
      margin: 0 0 1rem 0;
    }
  `],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private projectService = inject(ProjectService);
  private dailyLogService = inject(DailyLogService);
  private metricsService = inject(MetricsService);

  private destroy$ = new Subject<void>();

  projects: ProjectResponse[] = [];
  activeProject: ProjectResponse | null = null;
  dashboardMetrics: MetricsSummary | null = null;
  recentLogs: DailyLogResponse[] = [];
  isLoading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all dashboard data from services.
   */
  private loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;

    // Load projects
    this.projectService
      .getAllProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (projects) => {
          this.projects = projects;
          this.activeProject = projects.find((p) => p.isActive) || projects[0] || null;
        },
        error: (err) => {
          console.error('Error loading projects:', err);
          this.error = 'Failed to load projects. Please try again.';
          this.isLoading = false;
        },
      });

    // Load dashboard metrics
    this.metricsService
      .getDashboardMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (metrics) => {
          this.dashboardMetrics = metrics;
        },
        error: (err) => {
          console.error('Error loading metrics:', err);
        },
      });

    // Load recent logs
    this.dailyLogService
      .getAllLogs()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (logs) => {
          this.recentLogs = logs.slice(0, 5);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading logs:', err);
          this.error = 'Failed to load recent activity. Please try again.';
          this.isLoading = false;
        },
      });
  }

  /**
   * Refresh dashboard data.
   */
  onRefresh(): void {
    this.loadDashboardData();
  }
}
