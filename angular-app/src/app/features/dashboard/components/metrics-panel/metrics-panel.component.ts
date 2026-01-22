import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsCardComponent } from '../stats-card/stats-card.component';
import { MetricsSummary } from '@models/index';

/**
 * MetricsPanel component - Displays a grid of metric cards.
 * Wraps StatsCard components and organizes metrics display.
 */
@Component({
  selector: 'app-metrics-panel',
  standalone: true,
  imports: [CommonModule, StatsCardComponent],
  template: `
    <div class="metrics-panel-container" *ngIf="metrics">
      <div class="metrics-panel">
        <app-stats-card
          [value]="getTotalHours()"
          label="Total Hours"
          icon="⏰"
        ></app-stats-card>

        <app-stats-card
          [value]="getTotalRevenue()"
          label="Total Revenue"
          icon="💰"
        ></app-stats-card>

        <app-stats-card
          [value]="metrics!.currentStreakDays"
          label="Current Streak"
          icon="🔥"
        ></app-stats-card>

        <app-stats-card
          [value]="metrics!.longestStreakDays"
          label="Longest Streak"
          icon="🏆"
        ></app-stats-card>
      </div>
    </div>
  `,
  styles: [`
    .metrics-panel-container {
      width: 100%;
    }

    .metrics-panel {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    @media (max-width: 768px) {
      .metrics-panel {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }
  `],
})
export class MetricsPanelComponent {
  @Input() metrics: MetricsSummary | null = null;

  getTotalHours(): string {
    if (!this.metrics) return '0';
    return (Math.round(this.metrics.totalTimeHours * 10) / 10).toFixed(1);
  }

  getTotalRevenue(): string {
    if (!this.metrics || this.metrics.totalRevenue === undefined || this.metrics.totalRevenue === null) return '$0.00';
    return '$' + this.metrics.totalRevenue.toFixed(2);
  }
}
