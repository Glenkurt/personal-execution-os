import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsSummary } from '@models/index';

/**
 * MetricsGridComponent - Displays dashboard metrics in a 4-card grid.
 * Shows total hours, active projects, monthly, and weekly stats.
 */
@Component({
  selector: 'app-metrics-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section metrics-section" *ngIf="metrics">
      <h2>Quick Metrics</h2>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">⏰</div>
          <div class="metric-value">{{ metrics.allProjectsHours | number: '1.1-1' }}</div>
          <div class="metric-label">Total Hours</div>
          <div class="metric-subtitle">All projects combined</div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">📊</div>
          <div class="metric-value">{{ metrics.activeProjectsCount }}</div>
          <div class="metric-label">Active Projects</div>
          <div class="metric-subtitle">Currently running</div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">📅</div>
          <div class="metric-value">{{ metrics.thisMonthHours | number: '1.1-1' }}</div>
          <div class="metric-label">This Month</div>
          <div class="metric-subtitle">Hours logged</div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">📈</div>
          <div class="metric-value">{{ metrics.thisWeekHours | number: '1.1-1' }}</div>
          <div class="metric-label">This Week</div>
          <div class="metric-subtitle">Hours logged</div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .metrics-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .metrics-section h2 {
      margin: 0 0 1.5rem 0;
      font-size: 1.5rem;
      color: #333;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .metric-card {
      padding: 1.5rem;
      background: linear-gradient(135deg, #f0f6ff 0%, #f5f9ff 100%);
      border-radius: 8px;
      border-left: 4px solid var(--primary-color, #2563eb);
      transition: all 0.3s ease;
      text-align: center;
    }

    .metric-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(37, 99, 235, 0.15);
    }

    .metric-icon {
      font-size: 2rem;
      margin-bottom: 0.75rem;
      display: inline-block;
    }

    .metric-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: var(--primary-color, #2563eb);
      margin-bottom: 0.5rem;
      line-height: 1;
    }

    .metric-label {
      font-size: 1rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .metric-subtitle {
      font-size: 0.85rem;
      color: #666;
      margin: 0;
    }

    @media (max-width: 640px) {
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      .metric-card {
        padding: 1rem;
      }

      .metric-value {
        font-size: 1.8rem;
      }

      .metric-label {
        font-size: 0.9rem;
      }

      .metric-subtitle {
        font-size: 0.75rem;
      }
    }
  `],
})
export class MetricsGridComponent {
  @Input() metrics: MetricsSummary | null = null;
}
