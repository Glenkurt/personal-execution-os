import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateProjectModalComponent } from './create-project-modal.component';

describe('CreateProjectModalComponent', () => {
  let component: CreateProjectModalComponent;
  let fixture: ComponentFixture<CreateProjectModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateProjectModalComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProjectModalComponent);
    component = fixture.componentInstance;
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

  it('should initialize form with empty values', () => {
    expect(component.projectForm.get('name')?.value).toBe('');
    expect(component.projectForm.get('description')?.value).toBe('');
  });

  it('should validate form as invalid when empty', () => {
    expect(component.projectForm.valid).toBe(false);
  });

  it('should validate form as invalid when name is too short', () => {
    component.projectForm.patchValue({ name: 'ab' });
    expect(component.projectForm.get('name')?.invalid).toBe(true);
  });

  it('should validate form as invalid when description is too short', () => {
    component.projectForm.patchValue({ description: 'short' });
    expect(component.projectForm.get('description')?.invalid).toBe(true);
  });

  it('should validate form as valid when all fields are filled correctly', () => {
    component.projectForm.patchValue({
      name: 'Test Project',
      description: 'This is a valid description for the project',
    });
    expect(component.projectForm.valid).toBe(true);
  });

  it('should emit submit event when form submitted', (done) => {
    spyOn(component.submitted, 'emit');
    component.projectForm.patchValue({
      name: 'Test Project',
      description: 'This is a valid description for the project',
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
    component.projectForm.patchValue({
      name: 'Test Project',
      description: 'Description',
    });
    component.onCancel();

    expect(component.projectForm.get('name')?.value).toBeNull();
    expect(component.projectForm.get('description')?.value).toBeNull();
  });

  it('should disable submit button when form is invalid', () => {
    component.isOpen = true;
    fixture.detectChanges();
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable submit button when form is valid', () => {
    component.isOpen = true;
    component.projectForm.patchValue({
      name: 'Test Project',
      description: 'This is a valid description for the project',
    });
    fixture.detectChanges();
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBe(false);
  });
});
