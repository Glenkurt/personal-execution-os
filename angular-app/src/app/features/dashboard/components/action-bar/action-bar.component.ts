import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ActionBarComponent - Displays action buttons for dashboard operations.
 * Emits events for: refresh, log work, create project.
 */
@Component({
  selector: 'app-action-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="action-bar">
      <button class="btn btn-primary" (click)="onRefresh()" [disabled]="isLoading">
        <span *ngIf="!isLoading">🔄 Refresh</span>
        <span *ngIf="isLoading">Loading...</span>
      </button>
      <button class="btn btn-secondary" (click)="onLogWork()">
        <span>📝 Log Work</span>
      </button>
      <button class="btn btn-secondary" (click)="onNewProject()">
        <span>➕ New Project</span>
      </button>
    </section>
  `,
  styles: [`
    .action-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 8px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.95rem;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--primary-color, #2563eb);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
    }

    .btn-secondary {
      background: white;
      color: var(--primary-color, #2563eb);
      border: 2px solid var(--primary-color, #2563eb);
    }

    .btn-secondary:hover:not(:disabled) {
      background: var(--primary-color, #2563eb);
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
    }

    @media (max-width: 640px) {
      .action-bar {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `],
})
export class ActionBarComponent {
  @Output() refresh = new EventEmitter<void>();
  @Output() logWork = new EventEmitter<void>();
  @Output() newProject = new EventEmitter<void>();

  isLoading = false;

  /**
   * Handle refresh button click.
   */
  onRefresh(): void {
    this.isLoading = true;
    this.refresh.emit();
    // Simulate loading completion after a delay
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  /**
   * Handle log work button click.
   */
  onLogWork(): void {
    this.logWork.emit();
  }

  /**
   * Handle new project button click.
   */
  onNewProject(): void {
    this.newProject.emit();
  }
}
