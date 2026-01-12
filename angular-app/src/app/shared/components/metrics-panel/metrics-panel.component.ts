import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsCardComponent } from '../stats-card/stats-card.component';
import { MetricsSummary } from '../../../models/metrics.model';

@Component({
  selector: 'app-metrics-panel',
  standalone: true,
  imports: [CommonModule, StatsCardComponent],
  templateUrl: './metrics-panel.component.html',
  styleUrls: ['./metrics-panel.component.css']
})
export class MetricsPanelComponent {
  @Input() metrics: MetricsSummary | null = null;

  getTotalHours(): string {
    if (!this.metrics) return '0h';
    const hours = this.metrics.totalTimeHours;
    return hours.toFixed(1) + 'h';
  }

  getTotalRevenue(): string {
    if (!this.metrics) return '$0';
    const revenue = this.metrics.totalRevenue;
    return '$' + revenue.toFixed(2);
  }
}
