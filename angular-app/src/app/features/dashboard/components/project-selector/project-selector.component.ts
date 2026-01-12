import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectResponse } from '@models/index';

/**
 * ProjectSelector component - Allows selecting from a list of projects.
 * Emits selection change events to parent.
 */
@Component({
  selector: 'app-project-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="project-selector">
      <label for="project-dropdown" class="selector-label">Project:</label>
      <select
        id="project-dropdown"
        class="project-dropdown"
        [value]="selectedProjectId || ''"
        (change)="onProjectChange($event)"
        [disabled]="!projects || projects.length === 0"
      >
        <option value="">
          {{ projects && projects.length > 0 ? 'Select a project...' : 'No projects available' }}
        </option>
        <option *ngFor="let project of projects" [value]="project.id">
          {{ project.name }}
        </option>
      </select>
    </div>
  `,
  styles: [`
    .project-selector {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .selector-label {
      font-weight: 500;
      color: #333;
    }

    .project-dropdown {
      padding: 0.5rem 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      background: white;
      color: #333;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .project-dropdown:hover:not(:disabled) {
      border-color: var(--primary-color, #2563eb);
    }

    .project-dropdown:focus {
      outline: none;
      ring: 2px;
      ring-color: var(--primary-color, #2563eb);
    }

    .project-dropdown:disabled {
      background: #f5f5f5;
      color: #999;
      cursor: not-allowed;
    }
  `],
})
export class ProjectSelectorComponent implements OnInit {
  @Input() projects: ProjectResponse[] | null = null;
  @Input() selectedProjectId: string | null = null;
  @Output() projectSelected = new EventEmitter<string>();

  ngOnInit(): void {
    // Initialize if needed
  }

  onProjectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    if (select.value) {
      this.selectedProjectId = select.value;
      this.projectSelected.emit(select.value);
    }
  }
}
