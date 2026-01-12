import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyLogResponse } from '../../../models/daily-log.model';

@Component({
  selector: 'app-logs-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logs-list.component.html',
  styleUrls: ['./logs-list.component.css']
})
export class LogsListComponent {
  @Input() logs: DailyLogResponse[] = [];
  @Input() emptyMessage = 'No logs found';

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  formatHours(minutes: number): string {
    if (!minutes || minutes <= 0) return '0h';
    const hours = minutes / 60;
    return hours.toFixed(1) + 'h';
  }

  formatCurrency(amount: number | undefined | null): string {
    if (!amount || amount <= 0) return '$0';
    return '$' + amount.toFixed(2);
  }
}
