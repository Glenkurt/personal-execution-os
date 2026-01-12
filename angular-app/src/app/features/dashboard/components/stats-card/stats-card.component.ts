import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * StatsCard component - Displays a single metric/stat in a card format.
 * Reusable across different dashboard sections.
 */
@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card">
      <div class="stat-value">{{ value }}</div>
      <div class="stat-label">{{ label }}</div>
      <div class="stat-icon" *ngIf="icon">{{ icon }}</div>
    </div>
  `,
  styles: [`
    .stat-card {
      padding: 1.5rem;
      background: #f9fafb;
      border-radius: 6px;
      text-align: center;
      border-left: 4px solid var(--primary-color, #2563eb);
      position: relative;
      transition: all 0.2s;
    }

    .stat-card:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: var(--primary-color, #2563eb);
      margin-bottom: 0.5rem;
      word-break: break-word;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #666;
      margin-bottom: 0.5rem;
    }

    .stat-icon {
      position: absolute;
      top: 1rem;
      right: 1rem;
      font-size: 1.5rem;
      opacity: 0.3;
    }
  `],
})
export class StatsCardComponent {
  @Input() value: string | number = 0;
  @Input() label: string = '';
  @Input() icon: string | null = null;
}
