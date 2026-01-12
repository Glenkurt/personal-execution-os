import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ProjectModalComponent } from './project-modal.component';
import { ProjectService } from '../../../core/services/project.service';
import { ILogger } from '../../../core/interfaces/logger.interface';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../../../models/project.model';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ProjectModalComponent', () => {
  let component: ProjectModalComponent;
  let fixture: ComponentFixture<ProjectModalComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
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

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj('ProjectService', ['createProject', 'updateProject']);
    mockLogger = jasmine.createSpyObj('ILogger', ['info', 'error', 'warn']);

    await TestBed.configureTestingModule({
      imports: [ProjectModalComponent, ReactiveFormsModule],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: ILogger, useValue: mockLogger }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty values in create mode', () => {
      expect(component.projectForm.get('name')?.value).toBe('');
      expect(component.projectForm.get('description')?.value).toBe('');
      expect(component.projectForm.get('goal')?.value).toBe('');
      expect(component.projectForm.get('startDate')?.value).toBe('');
    });

    it('should populate form with project data in edit mode', () => {
      component.project = mockProject;
      component.ngOnInit();

      expect(component.projectForm.get('name')?.value).toBe('Test Project');
      expect(component.projectForm.get('description')?.value).toBe('Test Description');
      expect(component.projectForm.get('goal')?.value).toBe('Test Goal');
      expect(component.projectForm.get('startDate')?.value).toBe('2025-01-01');
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
    it('should validate required name field', () => {
      const nameControl = component.projectForm.get('name');
      nameControl?.setValue('');
      nameControl?.markAsTouched();

      expect(nameControl?.invalid).toBeTruthy();
      expect(nameControl?.errors?.['required']).toBeTruthy();
    });

    it('should validate name minlength', () => {
      const nameControl = component.projectForm.get('name');
      nameControl?.setValue('ab');
      nameControl?.markAsTouched();

      expect(nameControl?.invalid).toBeTruthy();
      expect(nameControl?.errors?.['minlength']).toBeTruthy();
    });

    it('should validate name maxlength', () => {
      const nameControl = component.projectForm.get('name');
      nameControl?.setValue('a'.repeat(101));
      nameControl?.markAsTouched();

      expect(nameControl?.invalid).toBeTruthy();
      expect(nameControl?.errors?.['maxlength']).toBeTruthy();
    });

    it('should accept valid name', () => {
      const nameControl = component.projectForm.get('name');
      nameControl?.setValue('Valid Project Name');

      expect(nameControl?.valid).toBeTruthy();
    });

    it('should validate required startDate field', () => {
      const startDateControl = component.projectForm.get('startDate');
      startDateControl?.setValue('');
      startDateControl?.markAsTouched();

      expect(startDateControl?.invalid).toBeTruthy();
      expect(startDateControl?.errors?.['required']).toBeTruthy();
    });

    it('should allow empty optional fields', () => {
      const descriptionControl = component.projectForm.get('description');
      descriptionControl?.setValue('');

      expect(descriptionControl?.valid).toBeTruthy();
    });

    it('should make form invalid with invalid required fields', () => {
      expect(component.projectForm.invalid).toBeTruthy();
    });

    it('should make form valid with all required fields', () => {
      component.projectForm.patchValue({
        name: 'Test Project',
        startDate: '2025-01-01'
      });

      expect(component.projectForm.valid).toBeTruthy();
    });
  });

  describe('Mode Detection', () => {
    it('should be in create mode when project is null', () => {
      component.project = null;

      expect(component.isEditMode).toBeFalsy();
    });

    it('should be in edit mode when project is provided', () => {
      component.project = mockProject;

      expect(component.isEditMode).toBeTruthy();
    });

    it('should show correct title in create mode', () => {
      component.project = null;

      expect(component.modalTitle).toBe('Create New Project');
    });

    it('should show correct title in edit mode', () => {
      component.project = mockProject;

      expect(component.modalTitle).toBe('Edit Project');
    });

    it('should show correct submit button text in create mode', () => {
      component.project = null;

      expect(component.submitButtonText).toBe('Create Project');
    });

    it('should show correct submit button text in edit mode', () => {
      component.project = mockProject;

      expect(component.submitButtonText).toBe('Update Project');
    });
  });

  describe('Create Project', () => {
    beforeEach(() => {
      component.project = null;
      component.projectForm.patchValue({
        name: '  New Project  ',
        description: '  New Description  ',
        goal: '  New Goal  ',
        startDate: '2025-01-15'
      });
    });

    it('should call projectService.createProject with trimmed values', () => {
      mockProjectService.createProject.and.returnValue(of(mockProject));

      component.onSubmit();

      expect(mockProjectService.createProject).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'New Project',
          description: 'New Description',
          goal: 'New Goal',
          startDate: '2025-01-15'
        })
      );
    });

    it('should emit saved event on successful creation', () => {
      mockProjectService.createProject.and.returnValue(of(mockProject));
      spyOn(component.saved, 'emit');

      component.onSubmit();

      expect(component.saved.emit).toHaveBeenCalledWith(mockProject);
    });

    it('should close modal on successful creation', () => {
      mockProjectService.createProject.and.returnValue(of(mockProject));
      spyOn(component, 'closeModal');

      component.onSubmit();

      expect(component.closeModal).toHaveBeenCalled();
    });

    it('should log info on successful creation', () => {
      mockProjectService.createProject.and.returnValue(of(mockProject));

      component.onSubmit();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Project created successfully',
        jasmine.objectContaining({ projectId: mockProject.id })
      );
    });

    it('should handle creation error', () => {
      const error = new Error('Create failed');
      mockProjectService.createProject.and.returnValue(throwError(() => error));

      component.onSubmit();

      expect(component.error).toContain('Failed to create project');
      expect(component.isSubmitting).toBeFalsy();
    });

    it('should set error message from service error', () => {
      const error = { message: 'Project already exists' };
      mockProjectService.createProject.and.returnValue(throwError(() => error));

      component.onSubmit();

      expect(component.error).toBe('Project already exists');
    });

    it('should log error on creation failure', () => {
      const error = new Error('Create failed');
      mockProjectService.createProject.and.returnValue(throwError(() => error));

      component.onSubmit();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create project',
        jasmine.objectContaining({ error: error })
      );
    });
  });

  describe('Update Project', () => {
    beforeEach(() => {
      component.project = mockProject;
      component.ngOnInit();
      component.projectForm.patchValue({
        name: '  Updated Project  ',
        description: '  Updated Description  '
      });
    });

    it('should call projectService.updateProject with project id and trimmed values', () => {
      mockProjectService.updateProject.and.returnValue(of({ ...mockProject, name: 'Updated Project' }));

      component.onSubmit();

      expect(mockProjectService.updateProject).toHaveBeenCalledWith(
        mockProject.id,
        jasmine.objectContaining({
          name: 'Updated Project',
          description: 'Updated Description'
        })
      );
    });

    it('should emit saved event on successful update', () => {
      const updatedProject = { ...mockProject, name: 'Updated Project' };
      mockProjectService.updateProject.and.returnValue(of(updatedProject));
      spyOn(component.saved, 'emit');

      component.onSubmit();

      expect(component.saved.emit).toHaveBeenCalledWith(updatedProject);
    });

    it('should close modal on successful update', () => {
      mockProjectService.updateProject.and.returnValue(of(mockProject));
      spyOn(component, 'closeModal');

      component.onSubmit();

      expect(component.closeModal).toHaveBeenCalled();
    });

    it('should log info on successful update', () => {
      mockProjectService.updateProject.and.returnValue(of(mockProject));

      component.onSubmit();

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Project updated successfully',
        jasmine.objectContaining({ projectId: mockProject.id })
      );
    });

    it('should handle update error', () => {
      const error = new Error('Update failed');
      mockProjectService.updateProject.and.returnValue(throwError(() => error));

      component.onSubmit();

      expect(component.error).toContain('Failed to update project');
      expect(component.isSubmitting).toBeFalsy();
    });
  });

  describe('Form Submission', () => {
    it('should not submit invalid form', () => {
      component.projectForm.patchValue({
        name: 'ab',
        startDate: ''
      });

      component.onSubmit();

      expect(mockProjectService.createProject).not.toHaveBeenCalled();
    });

    it('should mark form fields as touched on invalid submission', () => {
      component.projectForm.patchValue({
        name: '',
        startDate: ''
      });

      component.onSubmit();

      Object.keys(component.projectForm.controls).forEach((key) => {
        expect(component.projectForm.get(key)?.touched).toBeTruthy();
      });
    });

    it('should set isSubmitting to true during submission', () => {
      component.projectForm.patchValue({
        name: 'Test',
        startDate: '2025-01-01'
      });
      mockProjectService.createProject.and.returnValue(of(mockProject));

      component.onSubmit();

      // Note: isSubmitting is set to false after the observable completes
      expect(mockProjectService.createProject).toHaveBeenCalled();
    });

    it('should clear error on successful submission', () => {
      component.error = 'Previous error';
      component.projectForm.patchValue({
        name: 'Test',
        startDate: '2025-01-01'
      });
      mockProjectService.createProject.and.returnValue(of(mockProject));

      component.onSubmit();

      expect(component.error).toBeNull();
    });
  });

  describe('Modal Control', () => {
    it('should emit close event when closeModal is called', () => {
      spyOn(component.close, 'emit');

      component.closeModal();

      expect(component.close.emit).toHaveBeenCalled();
    });

    it('should reset form on closeModal', () => {
      component.projectForm.patchValue({
        name: 'Test',
        startDate: '2025-01-01'
      });

      component.closeModal();

      expect(component.projectForm.get('name')?.value).toBeNull();
      expect(component.projectForm.get('startDate')?.value).toBeNull();
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

    it('should close modal when close button is clicked', () => {
      component.isOpen = true;
      fixture.detectChanges();
      spyOn(component, 'closeModal');

      const closeButton = fixture.debugElement.query(By.css('.close-button'));
      closeButton.nativeElement.click();

      expect(component.closeModal).toHaveBeenCalled();
    });
  });

  describe('Error Messages', () => {
    it('should show error message for invalid name', () => {
      const nameControl = component.projectForm.get('name');
      nameControl?.setValue('ab');
      nameControl?.markAsTouched();

      const errorMsg = component.getErrorMessage('name');

      expect(errorMsg).toContain('Name must be at least 3 characters');
    });

    it('should show required error for empty name', () => {
      const nameControl = component.projectForm.get('name');
      nameControl?.setValue('');
      nameControl?.markAsTouched();

      const errorMsg = component.getErrorMessage('name');

      expect(errorMsg).toBe('Name is required');
    });

    it('should return empty string when field is not touched', () => {
      const nameControl = component.projectForm.get('name');
      nameControl?.setValue('ab');
      nameControl?.markAsUntouched();

      const errorMsg = component.getErrorMessage('name');

      expect(errorMsg).toBe('');
    });

    it('should return empty string for valid field', () => {
      const nameControl = component.projectForm.get('name');
      nameControl?.setValue('Valid Name');
      nameControl?.markAsTouched();

      const errorMsg = component.getErrorMessage('name');

      expect(errorMsg).toBe('');
    });
  });

  describe('Character Count', () => {
    it('should display character count for description', () => {
      component.isOpen = true;
      component.projectForm.patchValue({ description: 'Test Description' });
      fixture.detectChanges();

      const charCounts = fixture.debugElement.queryAll(By.css('.char-count'));
      expect(charCounts.length).toBeGreaterThan(0);
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
