import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { ILogger } from '../../../core/interfaces/logger.interface';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../../../models/project.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-project-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './project-modal.component.html',
  styleUrls: ['./project-modal.component.css']
})
export class ProjectModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() project: Project | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Project>();

  projectForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  readonly today = new Date().toISOString().split('T')[0];
  readonly minDate = '2020-01-01';

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private logger: ILogger
  ) {
    this.projectForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.project) {
      this.populateForm(this.project);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isEditMode(): boolean {
    return this.project !== null;
  }

  get modalTitle(): string {
    return this.isEditMode ? 'Edit Project' : 'Create New Project';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Update Project' : 'Create Project';
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      goal: ['', [Validators.maxLength(500)]],
      startDate: ['', Validators.required]
    });
  }

  private populateForm(project: Project): void {
    this.projectForm.patchValue({
      name: project.name,
      description: project.description || '',
      goal: project.goal || '',
      startDate: project.startDate
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.markFormGroupTouched(this.projectForm);
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    if (this.isEditMode) {
      this.handleUpdate();
    } else {
      this.handleCreate();
    }
  }

  private handleCreate(): void {
    const formValue = this.projectForm.value;
    const request: CreateProjectRequest = {
      name: formValue.name.trim(),
      description: formValue.description?.trim() || '',
      goal: formValue.goal?.trim() || '',
      startDate: formValue.startDate
    };

    this.projectService
      .createProject(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (project) => {
          this.logger.info('Project created successfully', { projectId: project.id });
          this.saved.emit(project);
          this.closeModal();
        },
        error: (err) => {
          this.logger.error('Failed to create project', { error: err });
          this.error = err?.message || 'Failed to create project. Please try again.';
          this.isSubmitting = false;
        }
      });
  }

  private handleUpdate(): void {
    if (!this.project) {
      this.error = 'Project not found';
      this.isSubmitting = false;
      return;
    }

    const formValue = this.projectForm.value;
    const request: UpdateProjectRequest = {
      name: formValue.name.trim(),
      description: formValue.description?.trim() || '',
      goal: formValue.goal?.trim() || ''
    };

    this.projectService
      .updateProject(this.project.id, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedProject) => {
          this.logger.info('Project updated successfully', { projectId: updatedProject.id });
          this.saved.emit(updatedProject);
          this.closeModal();
        },
        error: (err) => {
          this.logger.error('Failed to update project', { error: err });
          this.error = err?.message || 'Failed to update project. Please try again.';
          this.isSubmitting = false;
        }
      });
  }

  closeModal(): void {
    this.projectForm.reset();
    this.error = null;
    this.isSubmitting = false;
    this.close.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.projectForm.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;
    if (errors['required']) return `${this.formatFieldName(fieldName)} is required`;
    if (errors['minlength']) return `${this.formatFieldName(fieldName)} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `${this.formatFieldName(fieldName)} must not exceed ${errors['maxlength'].requiredLength} characters`;

    return 'Invalid value';
  }

  private formatFieldName(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }
}
