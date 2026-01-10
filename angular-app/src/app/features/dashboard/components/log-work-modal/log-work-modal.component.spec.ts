import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LogWorkModalComponent } from './log-work-modal.component';
import { ProjectResponse } from '@models/index';

describe('LogWorkModalComponent', () => {
  let component: LogWorkModalComponent;
  let fixture: ComponentFixture<LogWorkModalComponent>;

  const mockProjects: ProjectResponse[] = [
    {
      id: 1,
      name: 'Project 1',
      description: 'Project 1 description',
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-10T00:00:00Z',
    },
    {
      id: 2,
      name: 'Project 2',
      description: 'Project 2 description',
      isActive: false,
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-09T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogWorkModalComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LogWorkModalComponent);
    component = fixture.componentInstance;
    component.projects = mockProjects;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display modal when isOpen is false', () => {
    component.isOpen = false;
    fixture.detectChanges();
    const modal = fixture.nativeElement.querySelector('.modal-overlay');
    expect(modal).toBeFalsy();
  });

  it('should display modal when isOpen is true', () => {
    component.isOpen = true;
    fixture.detectChanges();
    const modal = fixture.nativeElement.querySelector('.modal-overlay');
    expect(modal).toBeTruthy();
  });

  it('should initialize form with today date', () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const expectedDate = `${year}-${month}-${day}`;

    expect(component.logForm.get('logDate')?.value).toBe(expectedDate);
  });

  it('should validate form as invalid when empty', () => {
    component.logForm.reset();
    expect(component.logForm.valid).toBe(false);
  });

  it('should validate form as invalid when projectId is not selected', () => {
    component.logForm.patchValue({
      projectId: '',
      hoursWorked: 8,
      description: 'This is a valid description',
    });
    expect(component.logForm.get('projectId')?.invalid).toBe(true);
  });

  it('should validate form as invalid when hours are less than 0.5', () => {
    component.logForm.patchValue({ hoursWorked: 0.25 });
    expect(component.logForm.get('hoursWorked')?.invalid).toBe(true);
  });

  it('should validate form as invalid when hours are more than 24', () => {
    component.logForm.patchValue({ hoursWorked: 25 });
    expect(component.logForm.get('hoursWorked')?.invalid).toBe(true);
  });

  it('should validate form as valid when all fields are filled correctly', () => {
    component.logForm.patchValue({
      projectId: 1,
      hoursWorked: 8,
      description: 'This is a valid description of work done',
    });
    expect(component.logForm.valid).toBe(true);
  });

  it('should emit submit event when form submitted', (done) => {
    spyOn(component.submitted, 'emit');
    component.logForm.patchValue({
      projectId: 1,
      hoursWorked: 8,
      description: 'This is a valid description of work done',
    });
    component.onSubmit();

    expect(component.submitted.emit).toHaveBeenCalled();
    done();
  });

  it('should emit cancel event when cancel button clicked', (done) => {
    spyOn(component.cancelled, 'emit');
    component.onCancel();

    expect(component.cancelled.emit).toHaveBeenCalled();
    done();
  });

  it('should reset form when cancelled', () => {
    component.logForm.patchValue({
      projectId: 1,
      hoursWorked: 8,
      description: 'Some description',
    });
    component.onCancel();

    expect(component.logForm.get('projectId')?.value).toBeNull();
    expect(component.logForm.get('hoursWorked')?.value).toBeNull();
  });

  it('should disable submit button when form is invalid', () => {
    component.isOpen = true;
    fixture.detectChanges();
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable submit button when form is valid', () => {
    component.isOpen = true;
    component.logForm.patchValue({
      projectId: 1,
      hoursWorked: 8,
      description: 'This is a valid description of work done',
    });
    fixture.detectChanges();
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBe(false);
  });
});
