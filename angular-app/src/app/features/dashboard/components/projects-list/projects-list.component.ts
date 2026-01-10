import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectResponse } from '@models/index';

/**
 * ProjectsListComponent - Displays all projects in a grid with filtering.
 * Provides search, filter by status, and project selection.
 */
@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="section projects-section" *ngIf="projects && projects.length > 0">
      <h2>All Projects ({{ filteredProjects.length }})</h2>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="search-group">
          <input
            type="text"
            placeholder="Search projects..."
            [(ngModel)]="searchTerm"
            (input)="onSearchChange()"
            class="search-input"
          />
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statusFilter" (change)="onFilterChange()" class="filter-select">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <!-- Projects Grid -->
      <div class="projects-grid">
        <button
          class="project-card"
          *ngFor="let project of filteredProjects"
          (click)="onSelectProject(project)"
          [class.selected]="project.id === selectedProjectId"
          type="button"
        >
          <div class="card-header">
            <h3>{{ project.name }}</h3>
            <span
              [class.active]="project.isActive"
              class="status-badge"
            >
              {{ project.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <p class="description">{{ project.description || 'No description' }}</p>
          <div class="card-footer">
            <span class="date">{{ project.updatedAt | date: 'short' }}</span>
            <button class="btn-icon" (click)="onEditProject($event, project)" type="button" title="Edit project">
              ✏️
            </button>
          </div>
        </button>
      </div>

      <!-- Empty State -->
      <div *ngIf="filteredProjects.length === 0" class="empty-state">
        <p>No projects found matching your criteria.</p>
      </div>
    </section>
  `,
  styles: [`
    .projects-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .projects-section h2 {
      margin: 0 0 1.5rem 0;
      font-size: 1.5rem;
      color: #333;
    }

    .filter-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .search-group {
      flex: 1;
      min-width: 200px;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 6px;
      font-size: 0.95rem;
      transition: border-color 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary-color, #2563eb);
    }

    .filter-group {
      min-width: 150px;
    }

    .filter-select {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 6px;
      font-size: 0.95rem;
      background: white;
      cursor: pointer;
      transition: border-color 0.2s;
    }

    .filter-select:focus {
      outline: none;
      border-color: var(--primary-color, #2563eb);
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .project-card {
      padding: 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      background: white;
      text-align: left;
      font: inherit;
    }

    .project-card:hover {
      border-color: var(--primary-color, #2563eb);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
      transform: translateY(-2px);
    }

    .project-card:focus {
      outline: 2px solid var(--primary-color, #2563eb);
      outline-offset: 2px;
    }

    .project-card.selected {
      border-color: var(--primary-color, #2563eb);
      background: #f0f6ff;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }

    .card-header h3 {
      margin: 0;
      font-size: 1.1rem;
      color: #333;
      flex: 1;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #e5e7eb;
      color: #374151;
      white-space: nowrap;
    }

    .status-badge.active {
      background: #d1fae5;
      color: #065f46;
    }

    .description {
      font-size: 0.875rem;
      color: #666;
      margin: 0 0 0.75rem 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.75rem;
      border-top: 1px solid #e5e7eb;
    }

    .date {
      font-size: 0.8rem;
      color: #999;
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0.25rem;
      transition: transform 0.2s;
    }

    .btn-icon:hover {
      transform: scale(1.2);
    }

    .empty-state {
      text-align: center;
      padding: 2rem 1rem;
      color: #666;
    }

    @media (max-width: 640px) {
      .filter-bar {
        flex-direction: column;
      }

      .search-group {
        min-width: 100%;
      }

      .filter-group {
        min-width: 100%;
      }

      .projects-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class ProjectsListComponent implements OnInit {
  @Input() projects: ProjectResponse[] = [];
  @Input() selectedProjectId: number | null = null;
  @Output() projectSelected = new EventEmitter<ProjectResponse>();
  @Output() projectEdit = new EventEmitter<ProjectResponse>();

  filteredProjects: ProjectResponse[] = [];
  searchTerm = '';
  statusFilter = '';

  ngOnInit(): void {
    this.updateFilteredProjects();
  }

  /**
   * Handle search term change.
   */
  onSearchChange(): void {
    this.updateFilteredProjects();
  }

  /**
   * Handle status filter change.
   */
  onFilterChange(): void {
    this.updateFilteredProjects();
  }

  /**
   * Update filtered projects based on current filters.
   */
  private updateFilteredProjects(): void {
    this.filteredProjects = this.projects.filter((project) => {
      const matchesSearch =
        this.searchTerm === '' ||
        project.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (project.description &&
          project.description.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesStatus =
        this.statusFilter === '' ||
        (this.statusFilter === 'active' && project.isActive) ||
        (this.statusFilter === 'inactive' && !project.isActive);

      return matchesSearch && matchesStatus;
    });
  }

  /**
   * Handle project selection.
   */
  onSelectProject(project: ProjectResponse): void {
    this.selectedProjectId = project.id;
    this.projectSelected.emit(project);
  }

  /**
   * Handle edit project button click.
   */
  onEditProject(event: Event, project: ProjectResponse): void {
    event.stopPropagation();
    this.projectEdit.emit(project);
  }
}
