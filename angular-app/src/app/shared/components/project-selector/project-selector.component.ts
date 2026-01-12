import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../../models/project.model';

@Component({
  selector: 'app-project-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-selector.component.html',
  styleUrls: ['./project-selector.component.css']
})
export class ProjectSelectorComponent {
  @Input() projects: Project[] = [];
  @Input() selectedProjectId: string | null = null;
  @Output() projectSelected = new EventEmitter<string>();

  onProjectSelect(projectId: string): void {
    if (projectId) {
      this.projectSelected.emit(projectId);
    }
  }
}
