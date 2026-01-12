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
import {
  StatsCardComponent,
  ProjectSelectorComponent,
  LogsListComponent,
  MetricsPanelComponent,
  ProjectModalComponent,
  DailyLogModalComponent,
} from './components/index';

/**
 * Dashboard component - Main feature component for the Personal Execution OS.
 * Displays active project, metrics, projects list, and recent activity.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    StatsCardComponent,
    ProjectSelectorComponent,
    LogsListComponent,
    MetricsPanelComponent,
    ProjectModalComponent,
    DailyLogModalComponent,
  ],
  template: `
    <!-- Skip to main content link for screen readers -->
    <a href="#main-content" class="skip-to-main">Skip to main content</a>

    <div class="dashboard-container">
      <!-- Header -->
      <header class="dashboard-header" role="banner">
        <div class="header-content">
          <h1>Personal Execution OS</h1>
          <p class="subtitle">Track your projects and log your work</p>
        </div>
      </header>

      <!-- Controls Section -->
      <section class="controls-section" role="region" aria-label="Dashboard controls">
        <div class="controls-left">
          <app-project-selector
            [projects]="projects"
            [selectedProjectId]="activeProject?.id ?? null"
            (projectSelected)="onProjectSelected($event)"
            aria-label="Select active project"
          ></app-project-selector>
        </div>
        <div class="controls-right">
          <button 
            class="btn btn-secondary" 
            (click)="onRefresh()" 
            [disabled]="isLoading"
            aria-label="Refresh dashboard data">
            <span *ngIf="!isLoading">🔄 Refresh</span>
            <span *ngIf="isLoading">⏳ Loading...</span>
          </button>
          <button 
            class="btn btn-secondary" 
            (click)="openLogWorkModal()"
            aria-label="Create new daily log entry">📝 Log Work</button>
          <button 
            class="btn btn-primary" 
            (click)="openNewProjectModal()"
            aria-label="Create new project">➕ New Project</button>
        </div>
      </section>

      <!-- Loading Overlay -->
      <div 
        *ngIf="isLoading" 
        class="loading-overlay"
        role="status"
        aria-live="polite"
        aria-label="Loading dashboard content">
        <div class="spinner" aria-hidden="true"></div>
        <p>Loading dashboard...</p>
      </div>

      <!-- Error Alert -->
      <div 
        *ngIf="error" 
        class="error-alert"
        role="alert"
        aria-live="assertive"
        aria-label="Error notification">
        <div class="error-content">
          <span class="error-icon" aria-hidden="true">⚠️</span>
          <span class="error-text">{{ error }}</span>
          <button class="btn btn-sm btn-secondary" (click)="onRefresh()" aria-label="Retry failed operation">Retry</button>
        </div>
      </div>

      <!-- Main Content (Hidden during loading) -->
      <main id="main-content" *ngIf="!isLoading" class="dashboard-content">
        <!-- Active Project Section -->
        <section class="section active-project-section" *ngIf="activeProject">
          <div class="section-header">
            <h2>📌 Active Project</h2>
          </div>
          <div class="active-project-card">
            <div class="project-header">
              <h3>{{ activeProject.name }}</h3>
              <span class="badge badge-active">Active</span>
            </div>
            <p class="project-desc">{{ activeProject.description }}</p>
            <div class="project-meta">
              <span class="meta-item">
                <span class="meta-label">Updated:</span>
                <span class="meta-value">{{ activeProject.updatedAt | date: 'short' }}</span>
              </span>
            </div>
          </div>
        </section>

        <!-- Metrics Section -->
        <section class="section metrics-section" *ngIf="dashboardMetrics">
          <div class="section-header">
            <h2>📊 Quick Metrics</h2>
          </div>
          <app-metrics-panel [metrics]="dashboardMetrics"></app-metrics-panel>
        </section>

        <!-- Recent Activity Section -->
        <section class="section activity-section" *ngIf="recentLogs && recentLogs.length > 0">
          <div class="section-header">
            <h2>📋 Recent Activity</h2>
            <div class="activity-summary">
              <span class="summary-badge">
                <span class="summary-value">{{ totalLogsHours | number: '1.1-1' }}</span>
                <span class="summary-label">hours</span>
              </span>
              <span class="summary-badge">
                <span class="summary-value">{{ recentLogs.length }}</span>
                <span class="summary-label">logs</span>
              </span>
            </div>
          </div>
          <app-logs-list [logs]="recentLogs" emptyMessage="No logs available"></app-logs-list>
        </section>

        <!-- All Projects Section -->
        <section class="section projects-section" *ngIf="projects && projects.length > 0">
          <div class="section-header">
            <h2>📁 All Projects</h2>
            <span class="count-badge">{{ projects.length }}</span>
          </div>
          <div class="projects-list">
            <div class="project-item" *ngFor="let project of projects" [class.active-project]="project.id === activeProject?.id">
              <div class="project-header">
                <span class="project-name">{{ project.name }}</span>
                <span [class.active]="project.isActive" class="status-badge">
                  {{ project.isActive ? '✓ Active' : 'Inactive' }}
                </span>
              </div>
              <p class="project-desc">{{ project.description }}</p>
            </div>
          </div>
        </section>

        <!-- Empty States -->
        <section *ngIf="projects && projects.length === 0 && !activeProject" class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>No Projects Yet</h3>
          <p>Create your first project to get started tracking your work.</p>
          <button class="btn btn-primary">➕ Create Project</button>
        </section>

        <section *ngIf="activeProject && recentLogs.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>No Activity</h3>
          <p>No work logged in the last 7 days. Start logging your tasks!</p>
          <button class="btn btn-primary">📝 Log First Task</button>
        </section>
      </main>
    </div>

    <!-- Project Modal -->
    <app-project-modal
      [isOpen]="isProjectModalOpen"
      [project]="selectedProjectForEdit"
      (close)="isProjectModalOpen = false"
      (saved)="onProjectSaved($event)"
    ></app-project-modal>

    <!-- Daily Log Modal -->
    <app-daily-log-modal
      [isOpen]="isLogModalOpen"
      [log]="selectedLogForEdit"
      [projects]="projects"
      [selectedProjectId]="activeProject?.id ?? null"
      (close)="isLogModalOpen = false"
      (saved)="onLogSaved($event)"
    ></app-daily-log-modal>
  `,
  styles: [`
    :host {
      --primary-color: #2563eb;
      --success-color: #059669;
      --warning-color: #d97706;
      --error-color: #dc2626;
      --gray-50: #f9fafb;
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
      --gray-300: #d1d5db;
      --gray-500: #6b7280;
      --gray-700: #374151;
      --gray-900: #111827;
    }

    * {
      box-sizing: border-box;
    }

    /* Accessibility */
    .skip-to-main {
      position: absolute;
      top: -40px;
      left: 0;
      background: var(--primary-color);
      color: white;
      padding: 8px;
      text-decoration: none;
      border-radius: 0 0 4px 0;
      z-index: 100;
    }

    .skip-to-main:focus {
      top: 0;
    }

    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1.5rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: var(--gray-900);
    }

    /* Header Section */
    .dashboard-header {
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 3px solid var(--primary-color);
    }

    .header-content h1 {
      font-size: 2.5rem;
      margin: 0 0 0.5rem 0;
      color: var(--primary-color);
      font-weight: 700;
    }

    .subtitle {
      margin: 0;
      color: var(--gray-500);
      font-size: 1rem;
    }

    /* Controls Section */
    .controls-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
      margin-bottom: 2rem;
      padding: 1rem;
      background: var(--gray-50);
      border-radius: 8px;
      flex-wrap: wrap;
    }

    .controls-left {
      flex: 0 1 auto;
      min-width: 200px;
    }

    .controls-right {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    /* Buttons */
    .btn {
      padding: 0.625rem 1.25rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.9rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap;
      outline: none;
    }

    .btn:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--primary-color);
      color: white;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
    }

    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
      box-shadow: 0 6px 12px rgba(37, 99, 235, 0.3);
      transform: translateY(-2px);
    }

    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
    }

    .btn-secondary {
      background: white;
      color: var(--primary-color);
      border: 1px solid var(--gray-200);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .btn-secondary:hover:not(:disabled) {
      background: var(--gray-50);
      border-color: var(--primary-color);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .btn-secondary:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
    }

    /* Loading Overlay */
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 100;
      gap: 1.5rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--gray-200);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
      from { 
        opacity: 0; 
        transform: translateY(10px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    /* Error Alert */
    .error-alert {
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .error-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 100%;
      flex-wrap: wrap;
    }

    .error-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .error-text {
      color: var(--error-color);
      flex: 1;
      min-width: 200px;
    }

    /* Content */
    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .section {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .section:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid var(--gray-200);
      flex-wrap: wrap;
      gap: 1rem;
    }

    .section-header h2 {
      margin: 0;
      font-size: 1.3rem;
      color: var(--gray-900);
      font-weight: 600;
    }

    .count-badge {
      background: var(--gray-100);
      color: var(--gray-700);
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    /* Active Project Card */
    .active-project-section {
      background: white;
    }

    .active-project-card {
      padding: 1.5rem;
      background: linear-gradient(135deg, var(--primary-color) 0%, #1e40af 100%);
      color: white;
      border-radius: 6px;
      margin: 0 1.5rem 1.5rem;
      animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 16px rgba(37, 99, 235, 0.2);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .active-project-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(37, 99, 235, 0.3);
    }

    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .project-header h3 {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 600;
      flex: 1;
    }

    .badge {
      padding: 0.375rem 0.75rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .badge-active {
      background: rgba(255, 255, 255, 0.25);
      color: white;
    }

    .project-desc {
      margin: 0 0 1rem 0;
      opacity: 0.95;
      line-height: 1.5;
    }

    .project-meta {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      font-size: 0.85rem;
      opacity: 0.9;
    }

    .meta-label {
      font-weight: 600;
      opacity: 0.7;
      margin-bottom: 0.25rem;
    }

    .meta-value {
      font-weight: 500;
    }

    /* Metrics Section */
    .metrics-section {
      padding: 1.5rem;
    }

    /* Projects List */
    .projects-section {
      padding: 1.5rem;
    }

    .projects-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
      margin: 0;
    }

    .project-item {
      padding: 1rem;
      border: 1px solid var(--gray-200);
      border-radius: 6px;
      background: var(--gray-50);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: fadeIn 0.4s ease-out;
      cursor: pointer;
    }

    .project-item:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: var(--primary-color);
      background: white;
      transform: translateY(-2px);
    }

    .project-item:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }

    .project-item.active-project {
      border-color: var(--primary-color);
      background: #eff6ff;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
      animation: slideUp 0.3s ease-out;
    }

    .project-name {
      font-weight: 600;
      color: var(--gray-900);
      font-size: 1rem;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.625rem;
      border-radius: 3px;
      font-size: 0.75rem;
      font-weight: 600;
      background: var(--gray-200);
      color: var(--gray-700);
    }

    .status-badge.active {
      background: #d1fae5;
      color: #065f46;
    }

    /* Activity Section */
    .activity-section {
      padding: 1.5rem;
    }

    .activity-summary {
      display: flex;
      gap: 1rem;
    }

    .summary-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.5rem 1rem;
      background: var(--gray-100);
      border-radius: 4px;
    }

    .summary-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    .summary-label {
      font-size: 0.75rem;
      color: var(--gray-500);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem 1.5rem;
      background: var(--gray-50);
      border: 2px dashed var(--gray-200);
      border-radius: 8px;
      color: var(--gray-500);
      animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .empty-state:hover {
      border-color: var(--primary-color);
      background: #f0f4ff;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      animation: scaleIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: var(--gray-900);
      font-size: 1.2rem;
    }

    .empty-state p {
      margin: 0 0 1.5rem 0;
      color: var(--gray-500);
    }

    /* Responsiveness */
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .header-content h1 {
        font-size: 1.8rem;
      }

      .controls-section {
        flex-direction: column;
        align-items: stretch;
      }

      .controls-left,
      .controls-right {
        width: 100%;
      }

      .projects-list {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .activity-summary {
        flex-direction: row;
      }
    }

    @media (max-width: 640px) {
      .dashboard-container {
        padding: 0.75rem;
      }

      .header-content h1 {
        font-size: 1.5rem;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }

      .controls-right {
        flex-direction: column;
      }

      .active-project-card {
        margin: 0 0 1rem 0;
      }
    }
  `]
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
  totalLogsHours = 0;
  isLoading = false;
  error: string | null = null;

  // Modal state
  isProjectModalOpen = false;
  isLogModalOpen = false;
  selectedProjectForEdit: Project | null = null;
  selectedLogForEdit: DailyLogResponse | null = null;

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

    // Load active project specifically
    this.projectService
      .getActiveProject()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (project) => {
          this.activeProject = project;
          // Load logs for the active project if available
          if (project) {
            this.loadLogsForProject(project.id);
          } else {
            this.loadAllLogs();
          }
        },
        error: (err) => {
          console.warn('No active project found:', err);
          this.activeProject = null;
          // Fall back to loading all logs
          this.loadAllLogs();
        },
      });

    // Load all projects for the list
    this.projectService
      .getAllProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (projects) => {
          this.projects = projects;
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
          // Metrics error is non-blocking
        },
      });
  }

  /**
   * Load logs for a specific project (7-day window).
   */
  private loadLogsForProject(projectId: string): void {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const startDate = this.formatDate(sevenDaysAgo);
    const endDate = this.formatDate(today);

    this.dailyLogService
      .getLogsByProjectAndDateRange(projectId, startDate, endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (logRange) => {
          this.recentLogs = logRange.logs.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          this.totalLogsHours = logRange.logs.reduce(
            (sum, log) => sum + log.timeSpentMinutes / 60,
            0
          );
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading logs:', err);
          // Fall back to loading all logs
          this.loadAllLogs();
        },
      });
  }

  /**
   * Load all logs (fallback).
   */
  private loadAllLogs(): void {
    this.dailyLogService
      .getAllLogs()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (logs) => {
          // Get the 5 most recent logs
          this.recentLogs = logs
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
          this.totalLogsHours = this.recentLogs.reduce(
            (sum, log) => sum + log.timeSpentMinutes / 60,
            0
          );
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
   * Format date to ISO 8601 (YYYY-MM-DD) format.
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Refresh dashboard data.
   */
  onRefresh(): void {
    this.loadDashboardData();
  }

  /**
   * Handle project selection from ProjectSelector component.
   */
  onProjectSelected(projectId: string): void {
    const selected = this.projects.find((p) => p.id === projectId);
    if (selected) {
      this.activeProject = selected;
      this.loadLogsForProject(projectId);
    }
  }

  /**
   * Open project modal for creating new project.
   */
  openNewProjectModal(): void {
    this.selectedProjectForEdit = null;
    this.isProjectModalOpen = true;
  }

  /**
   * Open project modal for editing existing project.
   */
  openEditProjectModal(project: Project): void {
    this.selectedProjectForEdit = project;
    this.isProjectModalOpen = true;
  }

  /**
   * Handle project save from ProjectModalComponent.
   */
  onProjectSaved(project: Project): void {
    this.loadDashboardData();
  }

  /**
   * Open daily log modal for creating new log.
   */
  openLogWorkModal(): void {
    this.selectedLogForEdit = null;
    this.isLogModalOpen = true;
  }

  /**
   * Open daily log modal for editing existing log.
   */
  openEditLogModal(log: DailyLogResponse): void {
    this.selectedLogForEdit = log;
    this.isLogModalOpen = true;
  }

  /**
   * Handle daily log save from DailyLogModalComponent.
   */
  onLogSaved(log: DailyLogResponse): void {
    this.loadDashboardData();
  }
}
