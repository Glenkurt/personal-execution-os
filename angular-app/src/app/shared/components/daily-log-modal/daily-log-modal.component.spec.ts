import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { DailyLogModalComponent } from './daily-log-modal.component';
import { DailyLogService } from '../../../core/services/daily-log.service';
import { ILogger } from '../../../core/interfaces/logger.interface';
import { DailyLogResponse, CreateDailyLogRequest, UpdateDailyLogRequest } from '../../../models/daily-log.model';
import { Project } from '../../../models/project.model';
import { By } from '@angular/platform-browser';

describe('DailyLogModalComponent', () => {
  let component: DailyLogModalComponent;
  let fixture: ComponentFixture<DailyLogModalComponent>;
  let mockDailyLogService: jasmine.SpyObj<DailyLogService>;
  let mockLogger: jasmine.SpyObj<ILogger>;

  const mockProject: Project = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Test Project',
    description: 'Test Description',
    goal: 'Test Goal',
    startDate: '2025-01-01',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockLog: DailyLogResponse = {
    id: '660e8400-e29b-41d4-a716-446655440000',
    projectId: mockProject.id,
    date: '2025-01-15',
    taskDescription: 'Implemented feature X',
    timeSpentMinutes: 120,
    outputDescription: 'Feature completed',
    revenueGenerated: 100,
    note: 'Good progress',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(async () => {
    mockDailyLogService = jasmine.createSpyObj('DailyLogService', ['createLog', 'updateLog']);
    mockLogger = jasmine.createSpyObj('ILogger', ['info', 'error', 'warn']);

    await TestBed.configureTestingModule({
      imports: [DailyLogModalComponent, ReactiveFormsModule],
      providers: [
        { provide: DailyLogService, useValue: mockDailyLogService },
        { provide: ILogger, useValue: mockLogger }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DailyLogModalComponent);
    component = fixture.componentInstance;
    component.projects = [mockProject];
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty values in create mode', () => {
      expect(component.logForm.get('date')?.value).toBe('');
      expect(component.logForm.get('projectId')?.value).toBe('');
      expect(component.logForm.get('taskDescription')?.value).toBe('');
      expect(component.logForm.get('timeSpentMinutes')?.value).toBe('');
    });

    it('should populate form with log data in edit mode', () => {
      component.log = mockLog;
      component.ngOnInit();

      expect(component.logForm.get('date')?.value).toBe('2025-01-15');
      expect(component.logForm.get('projectId')?.value).toBe(mockProject.id);
      expect(component.logForm.get('taskDescription')?.value).toBe('Implemented feature X');
      expect(component.logForm.get('timeSpentMinutes')?.value).toBe(120);
    });

    it('should set projectId from selectedProjectId in create mode', () => {
      component.selectedProjectId = mockProject.id;
      component.ngOnInit();

      expect(component.logForm.get('projectId')?.value).toBe(mockProject.id);
    });

    it('should not be visible when isOpen is false', () => {
      component.isOpen = false;
      fixture.detectChanges();

      const overlay = fixture.debugElement.query(By.css('.modal-overlay'));
      expect(overlay).toBeNull();
    });

    it('should be visible when isOpen is true', () => {
      component.isOpen = true;
      fixture.detectChanges();

      const overlay = fixture.debugElement.query(By.css('.modal-overlay'));
      expect(overlay).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should validate required date field', () => {
      const dateControl = component.logForm.get('date');
      dateControl?.setValue('');
      dateControl?.markAsTouched();

      expect(dateControl?.invalid).toBeTruthy();
      expect(dateControl?.errors?.['required']).toBeTruthy();
    });

    it('should validate required projectId field', () => {
      const projectControl = component.logForm.get('projectId');
      projectControl?.setValue('');
      projectControl?.markAsTouched();

      expect(projectControl?.invalid).toBeTruthy();
    });

    it('should validate required taskDescription', () => {
      const taskControl = component.logForm.get('taskDescription');
      taskControl?.setValue('');
      taskControl?.markAsTouched();

      expect(taskControl?.invalid).toBeTruthy();
    });

    it('should validate taskDescription minlength', () => {
      const taskControl = component.logForm.get('taskDescription');
      taskControl?.setValue('task');
      taskControl?.markAsTouched();

      expect(taskControl?.invalid).toBeTruthy();
      expect(taskControl?.errors?.['minlength']).toBeTruthy();
    });

    it('should validate required timeSpentMinutes', () => {
      const timeControl = component.logForm.get('timeSpentMinutes');
      timeControl?.setValue('');
      timeControl?.markAsTouched();

      expect(timeControl?.invalid).toBeTruthy();
    });

    it('should validate timeSpentMinutes minimum', () => {
      const timeControl = component.logForm.get('timeSpentMinutes');
      timeControl?.setValue(0);
      timeControl?.markAsTouched();

      expect(timeControl?.invalid).toBeTruthy();
      expect(timeControl?.errors?.['min']).toBeTruthy();
    });

    it('should validate timeSpentMinutes maximum', () => {
      const timeControl = component.logForm.get('timeSpentMinutes');
      timeControl?.setValue(1441);
      timeControl?.markAsTouched();

      expect(timeControl?.invalid).toBeTruthy();
      expect(timeControl?.errors?.['max']).toBeTruthy();
    });

    it('should allow valid optional fields', () => {
      component.logForm.patchValue({
        date: '2025-01-15',
        projectId: mockProject.id,
        taskDescription: 'Valid task description',
        timeSpentMinutes: 120,
        outputDescription: '',
        revenueGenerated: '',
        note: ''
      });

      expect(component.logForm.valid).toBeTruthy();
    });

    it('should validate revenueGenerated minimum', () => {
      const revenueControl = component.logForm.get('revenueGenerated');
      revenueControl?.setValue(-10);
      revenueControl?.markAsTouched();

      expect(revenueControl?.invalid).toBeTruthy();
    });
  });

  describe('Mode Detection', () => {
    it('should be in create mode when log is null', () => {
      component.log = null;

      expect(component.isEditMode).toBeFalsy();
    });

    it('should be in edit mode when log is provided', () => {
      component.log = mockLog;

      expect(component.isEditMode).toBeTruthy();
    });

    it('should show correct title in create mode', () => {
      component.log = null;

      expect(component.modalTitle).toBe('Log Work');
    });

    it('should show correct title in edit mode', () => {
      component.log = mockLog;

      expect(component.modalTitle).toBe('Edit Daily Log');
    });

    it('should show correct submit button text in create mode', () => {
      component.log = null;

      expect(component.submitButtonText).toBe('Log Work');
    });

    it('should show correct submit button text in edit mode', () => {
      component.log = mockLog;

      expect(component.submitButtonText).toBe('Update Log');
    });
  });

  describe('Create Log', () => {
    beforeEach(() => {
      component.log = null;
      component.logForm.patchValue({
        date: '2025-01-15',
        projectId: mockProject.id,
        taskDescription: '  Valid task  ',
        timeSpentMinutes: '120',
        outputDescription: '  Output  ',
        revenueGenerated: '100.50',
        note: '  Note  '
      });
    });

    it('should call dailyLogService.createLog with trimmed values', () => {
      mockDailyLogService.createLog.and.returnValue(of(mockLog));

      component.onSubmit();

      expect(mockDailyLogService.createLog).toHaveBeenCalledWith(
        jasmine.objectContaining({
          projectId: mockProject.id,
          date: '2025-01-15',
          taskDescription: 'Valid task',
          timeSpentMinutes: 120,
          outputDescription: 'Output',
          revenueGenerated: 100.5,
          note: 'Note'
        })
      );
    });

    it('should emit saved event on successful creation', () => {
      mockDailyLogService.createLog.and.returnValue(of(mockLog));
      spyOn(component.saved, 'emit');

      component.onSubmit();

      expect(component.saved.emit).toHaveBeenCalledWith(mockLog);
    });

    it('should close modal on successful creation', () => {
      mockDailyLogService.createLog.and.returnValue(of(mockLog));
      spyOn(component, 'closeModal');

      component.onSubmit();

      expect(component.closeModal).toHaveBeenCalled();
    });

    it('should handle creation error', () => {
      const error = new Error('Create failed');
      mockDailyLogService.createLog.and.returnValue(throwError(() => error));

      component.onSubmit();

      expect(component.error).toContain('Failed to log work');
      expect(component.isSubmitting).toBeFalsy();
    });

    it('should handle default values for optional fields', () => {
      component.logForm.patchValue({
        revenueGenerated: '',
        note: ''
      });
      mockDailyLogService.createLog.and.returnValue(of(mockLog));

      component.onSubmit();

      expect(mockDailyLogService.createLog).toHaveBeenCalledWith(
        jasmine.objectContaining({
          revenueGenerated: 0,
          note: ''
        })
      );
    });
  });

  describe('Update Log', () => {
    beforeEach(() => {
      component.log = mockLog;
      component.ngOnInit();
      component.logForm.patchValue({
        taskDescription: '  Updated task  ',
        timeSpentMinutes: '180'
      });
    });

    it('should call dailyLogService.updateLog with log id and trimmed values', () => {
      mockDailyLogService.updateLog.and.returnValue(of(mockLog));

      component.onSubmit();

      expect(mockDailyLogService.updateLog).toHaveBeenCalledWith(
        mockLog.id,
        jasmine.objectContaining({
          projectId: mockProject.id,
          date: '2025-01-15',
          taskDescription: 'Updated task'
        })
      );
    });

    it('should emit saved event on successful update', () => {
      const updatedLog = { ...mockLog, taskDescription: 'Updated' };
      mockDailyLogService.updateLog.and.returnValue(of(updatedLog));
      spyOn(component.saved, 'emit');

      component.onSubmit();

      expect(component.saved.emit).toHaveBeenCalledWith(updatedLog);
    });

    it('should close modal on successful update', () => {
      mockDailyLogService.updateLog.and.returnValue(of(mockLog));
      spyOn(component, 'closeModal');

      component.onSubmit();

      expect(component.closeModal).toHaveBeenCalled();
    });

    it('should handle update error', () => {
      const error = new Error('Update failed');
      mockDailyLogService.updateLog.and.returnValue(throwError(() => error));

      component.onSubmit();

      expect(component.error).toContain('Failed to update log');
      expect(component.isSubmitting).toBeFalsy();
    });
  });

  describe('Form Submission', () => {
    it('should not submit invalid form', () => {
      component.logForm.patchValue({
        date: '',
        projectId: '',
        taskDescription: 'ab',
        timeSpentMinutes: 0
      });

      component.onSubmit();

      expect(mockDailyLogService.createLog).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched on invalid submission', () => {
      component.logForm.patchValue({
        date: '',
        projectId: '',
        taskDescription: '',
        timeSpentMinutes: ''
      });

      component.onSubmit();

      Object.keys(component.logForm.controls).forEach((key) => {
        expect(component.logForm.get(key)?.touched).toBeTruthy();
      });
    });

    it('should clear error on submission', () => {
      component.error = 'Previous error';
      component.logForm.patchValue({
        date: '2025-01-15',
        projectId: mockProject.id,
        taskDescription: 'Valid task',
        timeSpentMinutes: 120
      });
      mockDailyLogService.createLog.and.returnValue(of(mockLog));

      component.onSubmit();

      expect(component.error).toBeNull();
    });
  });

  describe('Modal Control', () => {
    it('should emit closed event when closeModal is called', () => {
      spyOn(component.closed, 'emit');

      component.closeModal();

      expect(component.closed.emit).toHaveBeenCalled();
    });

    it('should reset form on closeModal', () => {
      component.logForm.patchValue({
        date: '2025-01-15',
        taskDescription: 'Test'
      });

      component.closeModal();

      expect(component.logForm.get('date')?.value).toBeNull();
      expect(component.logForm.get('taskDescription')?.value).toBeNull();
    });

    it('should clear error on closeModal', () => {
      component.error = 'Some error';

      component.closeModal();

      expect(component.error).toBeNull();
    });

    it('should close modal when overlay is clicked', () => {
      component.isOpen = true;
      fixture.detectChanges();
      spyOn(component, 'closeModal');

      const overlay = fixture.debugElement.query(By.css('.modal-overlay'));
      overlay.nativeElement.click();

      expect(component.closeModal).toHaveBeenCalled();
    });

    it('should not close modal when modal content is clicked', () => {
      component.isOpen = true;
      fixture.detectChanges();
      spyOn(component, 'closeModal');

      const modalContent = fixture.debugElement.query(By.css('.modal-content'));
      modalContent.nativeElement.click();

      expect(component.closeModal).not.toHaveBeenCalled();
    });
  });

  describe('Error Messages', () => {
    it('should show required error for empty date', () => {
      const dateControl = component.logForm.get('date');
      dateControl?.setValue('');
      dateControl?.markAsTouched();

      const errorMsg = component.getErrorMessage('date');

      expect(errorMsg).toBe('Date is required');
    });

    it('should show minlength error for short task', () => {
      const taskControl = component.logForm.get('taskDescription');
      taskControl?.setValue('task');
      taskControl?.markAsTouched();

      const errorMsg = component.getErrorMessage('taskDescription');

      expect(errorMsg).toContain('must be at least 5 characters');
    });

    it('should return empty string when field is not touched', () => {
      const dateControl = component.logForm.get('date');
      dateControl?.setValue('');

      const errorMsg = component.getErrorMessage('date');

      expect(errorMsg).toBe('');
    });
  });

  describe('Project Name Resolution', () => {
    it('should return project name for valid project id', () => {
      const name = component.getProjectName(mockProject.id);

      expect(name).toBe('Test Project');
    });

    it('should return unknown project for invalid id', () => {
      const name = component.getProjectName('invalid-id');

      expect(name).toBe('Unknown Project');
    });
  });

  describe('Default Project Selection (Task 15)', () => {
    it('should pre-select active project on init when selectedProjectId is provided', () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174000';
      component.selectedProjectId = projectId;
      component.log = null; // Not in edit mode

      component.ngOnInit();

      expect(component.logForm.get('projectId')?.value).toBe(projectId);
    });

    it('should not pre-select when selectedProjectId is null', () => {
      component.selectedProjectId = null;
      component.log = null;

      component.ngOnInit();

      expect(component.logForm.get('projectId')?.value).toBe('');
    });

    it('should update projectId when selectedProjectId changes via ngOnChanges', () => {
      const newProjectId = '987e6543-e21b-12d3-a456-426614174999';
      component.selectedProjectId = null;
      component.log = null;
      component.ngOnInit();

      // Simulate input change
      const changes: any = {
        selectedProjectId: {
          currentValue: newProjectId,
          previousValue: null,
          firstChange: false,
          isFirstChange: () => false
        }
      };
      component.ngOnChanges(changes);

      expect(component.logForm.get('projectId')?.value).toBe(newProjectId);
    });

    it('should not override projectId in edit mode when selectedProjectId changes', () => {
      const existingLog: DailyLogResponse = {
        id: '111',
        projectId: 'original-project-id',
        date: '2025-01-15',
        taskDescription: 'Test',
        timeSpentMinutes: 60,
        outputDescription: 'Output',
        revenueGenerated: 0,
        note: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      component.log = existingLog;
      component.ngOnInit();

      const newProjectId = 'new-project-id';
      const changes: any = {
        selectedProjectId: {
          currentValue: newProjectId,
          previousValue: null,
          firstChange: false,
          isFirstChange: () => false
        }
      };
      component.ngOnChanges(changes);

      // Should keep original project from log
      expect(component.logForm.get('projectId')?.value).toBe('original-project-id');
    });

    it('should allow user to change pre-selected project after initialization', () => {
      component.selectedProjectId = mockProject.id;
      component.ngOnInit();

      expect(component.logForm.get('projectId')?.value).toBe(mockProject.id);

      // User changes the project selection
      const newProjectId = 'different-project-id';
      component.logForm.patchValue({ projectId: newProjectId });

      expect(component.logForm.get('projectId')?.value).toBe(newProjectId);
    });

    it('should still require project selection even with default', () => {
      component.selectedProjectId = mockProject.id;
      component.ngOnInit();

      // Clear the project selection
      component.logForm.patchValue({ projectId: '' });

      expect(component.logForm.get('projectId')?.invalid).toBe(true);
    });
  });

  describe('Optional Output Description (Task 16)', () => {
    it('should allow submission with empty outputDescription', () => {
      component.logForm.patchValue({
        projectId: mockProject.id,
        date: '2026-01-13',
        taskDescription: 'Completed task',
        timeSpentMinutes: 60,
        outputDescription: '', // Empty
        revenueGenerated: 0
      });

      expect(component.logForm.valid).toBe(true);
    });

    it('should create log with empty outputDescription', fakeAsync(() => {
      mockDailyLogService.createLog.and.returnValue(of(mockLog));

      component.logForm.patchValue({
        projectId: mockProject.id,
        date: '2026-01-13',
        taskDescription: 'Completed task',
        timeSpentMinutes: 60,
        outputDescription: '', // Empty
        revenueGenerated: 0
      });

      component.onSubmit();
      tick();

      expect(mockDailyLogService.createLog).toHaveBeenCalledWith(
        jasmine.objectContaining({ outputDescription: '' })
      );
    }));

    it('should not require outputDescription field', () => {
      component.logForm.patchValue({
        projectId: mockProject.id,
        date: '2026-01-13',
        taskDescription: 'Completed task',
        timeSpentMinutes: 60,
        revenueGenerated: 0
      });
      // Do NOT set outputDescription

      expect(component.logForm.valid).toBe(true);
    });

    it('should reject outputDescription exceeding max length', () => {
      const longString = 'a'.repeat(1001);
      component.logForm.patchValue({ outputDescription: longString });

      const control = component.logForm.get('outputDescription');
      expect(control?.hasError('maxlength')).toBe(true);
      expect(component.logForm.valid).toBe(false);
    });

    it('should allow outputDescription with exactly 1000 characters', () => {
      const maxString = 'a'.repeat(1000);
      component.logForm.patchValue({
        projectId: mockProject.id,
        date: '2026-01-13',
        taskDescription: 'Completed task',
        timeSpentMinutes: 60,
        outputDescription: maxString
      });

      const control = component.logForm.get('outputDescription');
      expect(control?.hasError('maxlength')).toBe(false);
      expect(component.logForm.valid).toBe(true);
    });

    it('should display optional indicator on outputDescription label', () => {
      component.isOpen = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const label = compiled.querySelector('label[for="outputDescription"]');
      expect(label?.textContent).toContain('(optional)');
      expect(label?.textContent).not.toContain('*');
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
});
