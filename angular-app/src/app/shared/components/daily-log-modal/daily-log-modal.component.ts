import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DailyLogService } from '../../../core/services/daily-log.service';
import { ILogger } from '../../../core/interfaces/logger.interface';
import { DailyLogResponse, CreateDailyLogRequest, UpdateDailyLogRequest } from '../../../models/daily-log.model';
import { Project } from '../../../models/project.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-daily-log-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './daily-log-modal.component.html',
  styleUrls: ['./daily-log-modal.component.css']
})
export class DailyLogModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() log: DailyLogResponse | null = null;
  @Input() projects: Project[] = [];
  @Input() selectedProjectId: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<DailyLogResponse>();

  logForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  readonly today = new Date().toISOString().split('T')[0];
  readonly minDate = '2020-01-01';

  constructor(
    private fb: FormBuilder,
    private dailyLogService: DailyLogService,
    private logger: ILogger
  ) {
    this.logForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.log) {
      this.populateForm(this.log);
    } else if (this.selectedProjectId) {
      this.logForm.patchValue({ projectId: this.selectedProjectId });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isEditMode(): boolean {
    return this.log !== null;
  }

  get modalTitle(): string {
    return this.isEditMode ? 'Edit Daily Log' : 'Log Work';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Update Log' : 'Log Work';
  }

  private createForm(): FormGroup {
    return this.fb.group({
      date: ['', Validators.required],
      projectId: ['', Validators.required],
      taskDescription: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      timeSpentMinutes: ['', [Validators.required, Validators.min(1), Validators.max(1440)]],
      outputDescription: ['', [Validators.maxLength(1000)]],
      revenueGenerated: ['', [Validators.min(0)]],
      note: ['', [Validators.maxLength(500)]]
    });
  }

  private populateForm(log: DailyLogResponse): void {
    this.logForm.patchValue({
      date: log.date,
      projectId: log.projectId,
      taskDescription: log.taskDescription,
      timeSpentMinutes: log.timeSpentMinutes,
      outputDescription: log.outputDescription || '',
      revenueGenerated: log.revenueGenerated || 0,
      note: log.note || ''
    });
  }

  onSubmit(): void {
    if (this.logForm.invalid) {
      this.markFormGroupTouched(this.logForm);
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
    const formValue = this.logForm.value;
    const request: CreateDailyLogRequest = {
      projectId: formValue.projectId,
      date: formValue.date,
      taskDescription: formValue.taskDescription.trim(),
      timeSpentMinutes: parseInt(formValue.timeSpentMinutes, 10),
      outputDescription: formValue.outputDescription?.trim() || '',
      revenueGenerated: formValue.revenueGenerated ? parseFloat(formValue.revenueGenerated) : 0,
      note: formValue.note?.trim() || ''
    };

    this.dailyLogService
      .createLog(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (log) => {
          this.logger.info('Daily log created successfully', { logId: log.id });
          this.saved.emit(log);
          this.closeModal();
        },
        error: (err) => {
          this.logger.error('Failed to create daily log', { error: err });
          this.error = err?.message || 'Failed to log work. Please try again.';
          this.isSubmitting = false;
        }
      });
  }

  private handleUpdate(): void {
    if (!this.log) {
      this.error = 'Log not found';
      this.isSubmitting = false;
      return;
    }

    const formValue = this.logForm.value;
    const request: UpdateDailyLogRequest = {
      taskDescription: formValue.taskDescription.trim(),
      timeSpentMinutes: parseInt(formValue.timeSpentMinutes, 10),
      outputDescription: formValue.outputDescription?.trim() || '',
      revenueGenerated: formValue.revenueGenerated ? parseFloat(formValue.revenueGenerated) : 0,
      note: formValue.note?.trim() || ''
    };

    this.dailyLogService
      .updateLog(this.log.id, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedLog) => {
          this.logger.info('Daily log updated successfully', { logId: updatedLog.id });
          this.saved.emit(updatedLog);
          this.closeModal();
        },
        error: (err) => {
          this.logger.error('Failed to update daily log', { error: err });
          this.error = err?.message || 'Failed to update log. Please try again.';
          this.isSubmitting = false;
        }
      });
  }

  closeModal(): void {
    this.logForm.reset();
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
    const control = this.logForm.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;
    if (errors['required']) return `${this.formatFieldName(fieldName)} is required`;
    if (errors['minlength']) return `${this.formatFieldName(fieldName)} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `${this.formatFieldName(fieldName)} must not exceed ${errors['maxlength'].requiredLength} characters`;
    if (errors['min']) return `${this.formatFieldName(fieldName)} must be at least ${errors['min'].min}`;
    if (errors['max']) return `${this.formatFieldName(fieldName)} must not exceed ${errors['max'].max}`;

    return 'Invalid value';
  }

  private formatFieldName(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  getProjectName(projectId: string): string {
    const project = this.projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  }
}
