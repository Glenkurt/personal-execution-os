import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectResponse } from '@models/index';

/**
 * ActiveProjectCardComponent - Displays the currently active project.
 * Shows project details and provides edit/activate actions.
 */
@Component({
  selector: 'app-active-project-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section active-project-section" *ngIf="project">
      <h2>Active Project</h2>
      <div class="active-project-card">
        <div class="card-header">
          <h3>{{ project.name }}</h3>
          <span class="badge badge-active">Active</span>
        </div>
        <p class="description">{{ project.description || 'No description provided' }}</p>
        <div class="project-meta">
          <div class="meta-item">
            <span class="meta-label">Status:</span>
            <span class="meta-value">{{ project.isActive ? 'Active' : 'Inactive' }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Updated:</span>
            <span class="meta-value">{{ project.updatedAt | date: 'short' }}</span>
          </div>
        </div>
        <div class="action-buttons">
          <button class="btn btn-secondary" (click)="onEdit()">
            <span>✏️ Edit</span>
          </button>
          <button class="btn btn-secondary" (click)="onActivate()">
            <span>📌 Set Active</span>
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .active-project-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .active-project-section h2 {
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
      color: #333;
    }

    .active-project-card {
      padding: 1.5rem;
      background: linear-gradient(135deg, var(--primary-color, #2563eb) 0%, #1e40af 100%);
      color: white;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      gap: 1rem;
    }

    .card-header h3 {
      margin: 0;
      font-size: 1.5rem;
      flex: 1;
    }

    .badge {
      padding: 0.5rem 1rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .badge-active {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .description {
      margin: 0 0 1rem 0;
      font-size: 0.95rem;
      opacity: 0.95;
      line-height: 1.5;
    }

    .project-meta {
      display: flex;
      gap: 2rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .meta-label {
      font-size: 0.875rem;
      opacity: 0.8;
      font-weight: 500;
    }

    .meta-value {
      font-size: 0.95rem;
      font-weight: 600;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .btn-secondary {
      background: white;
      color: var(--primary-color, #2563eb);
      border: 2px solid white;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.9);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 640px) {
      .card-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .project-meta {
        flex-direction: column;
        gap: 1rem;
      }

      .action-buttons {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `],
})
export class ActiveProjectCardComponent {
  @Input() project: ProjectResponse | null = null;
  @Output() edit = new EventEmitter<ProjectResponse>();
  @Output() activate = new EventEmitter<number>();

  /**
   * Handle edit button click.
   */
  onEdit(): void {
    if (this.project) {
      this.edit.emit(this.project);
    }
  }

  /**
   * Handle activate button click.
   */
  onActivate(): void {
    if (this.project) {
      this.activate.emit(this.project.id);
    }
  }
}
