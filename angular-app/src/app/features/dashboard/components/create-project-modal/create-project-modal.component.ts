import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateProjectRequest } from '@models/index';

/**
 * CreateProjectModalComponent - Modal form for creating new projects.
 * Provides form validation, error handling, and submit functionality.
 */
@Component({
  selector: 'app-create-project-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onCancel()" role="presentation">
      <div class="modal-dialog" (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h2>Create New Project</h2>
          <button class="btn-close" (click)="onCancel()" (keydown.escape)="onCancel()" type="button" aria-label="Close modal">
            ✕
          </button>
        </div>

        <form [formGroup]="projectForm" (ngSubmit)="onSubmit()" class="modal-body">
          <div class="form-group">
            <label for="projectName">Project Name</label>
            <input
              id="projectName"
              type="text"
              formControlName="name"
              placeholder="Enter project name"
              class="form-input"
              [class.error]="isFieldInvalid('name')"
            />
            <span class="error-message" *ngIf="isFieldInvalid('name')">
              Project name is required (3-100 characters)
            </span>
          </div>

          <div class="form-group">
            <label for="projectDescription">Description</label>
            <textarea
              id="projectDescription"
              formControlName="description"
              placeholder="Enter project description"
              class="form-textarea"
              rows="4"
              [class.error]="isFieldInvalid('description')"
            ></textarea>
            <span class="error-message" *ngIf="isFieldInvalid('description')">
              Description is required (10-500 characters)
            </span>
          </div>

          <div class="form-error" *ngIf="errorMessage">
            <p>{{ errorMessage }}</p>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="onCancel()" [disabled]="isSubmitting">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="!projectForm.valid || isSubmitting">
              {{ isSubmitting ? 'Creating...' : 'Create Project' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-dialog {
      background: white;
      border-radius: 8px;
      box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #333;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .btn-close:hover {
      background: #f5f5f5;
      color: #333;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
      font-size: 0.95rem;
    }

    .form-input,
    .form-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 6px;
      font-family: inherit;
      font-size: 0.95rem;
      transition: border-color 0.2s;
    }

    .form-input:focus,
    .form-textarea:focus {
      outline: none;
      border-color: var(--primary-color, #2563eb);
    }

    .form-input.error,
    .form-textarea.error {
      border-color: #dc2626;
    }

    .error-message {
      display: block;
      color: #dc2626;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }

    .form-error {
      background: #fee2e2;
      color: #991b1b;
      padding: 0.75rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }

    .form-error p {
      margin: 0;
      font-size: 0.9rem;
    }

    .modal-footer {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
      flex: 1;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--primary-color, #2563eb);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
    }

    .btn-secondary {
      background: white;
      color: var(--primary-color, #2563eb);
      border: 2px solid var(--primary-color, #2563eb);
    }

    .btn-secondary:hover:not(:disabled) {
      background: var(--primary-color, #2563eb);
      color: white;
    }
  `],
})
export class CreateProjectModalComponent {
  @Input() isOpen = false;
  @Output() submitted = new EventEmitter<CreateProjectRequest>();
  @Output() cancelled = new EventEmitter<void>();

  projectForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(private fb: FormBuilder) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    });
  }

  /**
   * Check if a form field is invalid and touched.
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.projectForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Handle form submission.
   */
  onSubmit(): void {
    if (this.projectForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.projectForm.value;
    this.submitted.emit(formValue as CreateProjectRequest);

    // Reset form and state
    setTimeout(() => {
      this.isSubmitting = false;
      this.projectForm.reset();
    }, 1000);
  }

  /**
   * Handle modal cancellation.
   */
  onCancel(): void {
    this.projectForm.reset();
    this.errorMessage = '';
    this.cancelled.emit();
  }
}
