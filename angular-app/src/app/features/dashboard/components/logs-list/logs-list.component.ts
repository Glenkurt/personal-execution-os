import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyLogResponse } from '@models/index';

/**
 * LogsList component - Displays a list of daily log entries.
 * Reusable component for showing activity logs.
 */
@Component({
  selector: 'app-logs-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logs-list-container">
      <div class="logs-list" *ngIf="logs && logs.length > 0">
        <div class="log-item" *ngFor="let log of logs">
          <div class="log-date">{{ log.date | date: 'MMM dd, yyyy' }}</div>
          <div class="log-content">
            <div class="log-description">{{ log.taskDescription }}</div>
            <div class="log-meta">
              <span class="log-hours">{{ (log.timeSpentMinutes / 60) | number: '1.1-1' }}h</span>
              <span class="log-output" *ngIf="log.outputDescription">{{ log.outputDescription }}</span>
            </div>
            <div class="log-revenue" *ngIf="log.revenueGenerated && log.revenueGenerated > 0">
              💰 \${{ log.revenueGenerated | number: '1.2-2' }}
            </div>
          </div>
        </div>
      </div>

      <div class="empty-logs" *ngIf="!logs || logs.length === 0">
        <p>{{ emptyMessage }}</p>
      </div>
    </div>
  `,
  styles: [`
    .logs-list-container {
      width: 100%;
    }

    .logs-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .log-item {
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      background: white;
      transition: all 0.2s;
    }

    .log-item:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-color: var(--primary-color, #2563eb);
    }

    .log-date {
      font-size: 0.75rem;
      color: #999;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .log-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .log-description {
      font-weight: 500;
      color: #333;
      line-height: 1.4;
    }

    .log-meta {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      font-size: 0.875rem;
      color: #666;
    }

    .log-hours {
      font-weight: 600;
      color: var(--primary-color, #2563eb);
    }

    .log-output {
      color: #666;
      font-style: italic;
    }

    .log-revenue {
      font-size: 0.875rem;
      color: #059669;
      font-weight: 600;
    }

    .empty-logs {
      padding: 2rem;
      text-align: center;
      color: #999;
      background: #f9fafb;
      border-radius: 6px;
      border: 1px dashed #e5e7eb;
    }

    .empty-logs p {
      margin: 0;
    }
  `],
})
export class LogsListComponent {
  @Input() logs: DailyLogResponse[] | null = null;
  @Input() emptyMessage: string = 'No logs found. Start logging your work!';
}
