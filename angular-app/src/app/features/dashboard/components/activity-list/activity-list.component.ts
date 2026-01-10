import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyLogResponse } from '@models/index';

/**
 * ActivityListComponent - Displays recent activity logs in timeline format.
 * Shows hours worked, description, and project association.
 */
@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section activity-section" *ngIf="logs && logs.length > 0">
      <h2>Recent Activity</h2>
      <div class="activity-list">
        <div class="activity-item" *ngFor="let log of logs; let i = index">
          <div class="activity-timeline">
            <div class="timeline-dot" [class.first]="i === 0"></div>
            <div *ngIf="i < logs.length - 1" class="timeline-line"></div>
          </div>
          <div class="activity-content">
            <div class="activity-header">
              <div class="activity-hours">{{ log.hoursWorked }}h</div>
              <div class="activity-date">{{ log.logDate | date: 'short' }}</div>
            </div>
            <div class="activity-description">{{ log.description }}</div>
            <div class="activity-project" *ngIf="log.projectId">
              <span class="project-badge">Project #{{ log.projectId }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section *ngIf="!logs || logs.length === 0" class="section empty-activity">
      <p>No activity yet. Start logging your work!</p>
    </section>
  `,
  styles: [`
    .activity-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .activity-section h2 {
      margin: 0 0 1.5rem 0;
      font-size: 1.5rem;
      color: #333;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .activity-item {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      border-bottom: 1px solid #e5e7eb;
      transition: background-color 0.2s;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-item:hover {
      background-color: #f9fafb;
    }

    .activity-timeline {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 30px;
      padding-top: 0.25rem;
    }

    .timeline-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--primary-color, #2563eb);
      border: 3px solid white;
      box-shadow: 0 0 0 2px var(--primary-color, #2563eb);
      z-index: 10;
    }

    .timeline-dot.first {
      width: 16px;
      height: 16px;
      border-width: 4px;
    }

    .timeline-line {
      position: absolute;
      top: 24px;
      width: 2px;
      flex: 1;
      background: #d1d5db;
      height: calc(100% - 24px);
    }

    .activity-content {
      flex: 1;
      min-width: 0;
    }

    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
      gap: 1rem;
    }

    .activity-hours {
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--primary-color, #2563eb);
    }

    .activity-date {
      font-size: 0.85rem;
      color: #999;
      white-space: nowrap;
    }

    .activity-description {
      font-size: 0.95rem;
      color: #333;
      margin-bottom: 0.75rem;
      line-height: 1.4;
    }

    .activity-project {
      display: flex;
    }

    .project-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: #f0f6ff;
      color: var(--primary-color, #2563eb);
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      border: 1px solid var(--primary-color, #2563eb);
    }

    .empty-activity {
      text-align: center;
      padding: 2rem 1rem;
      color: #666;
    }

    @media (max-width: 640px) {
      .activity-item {
        padding: 1rem;
        gap: 0.75rem;
      }

      .activity-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .activity-hours {
        font-size: 1rem;
      }
    }
  `],
})
export class ActivityListComponent {
  @Input() logs: DailyLogResponse[] | null = null;
}
