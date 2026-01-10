import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActiveProjectCardComponent } from './active-project-card.component';
import { ProjectResponse } from '@models/index';

describe('ActiveProjectCardComponent', () => {
  let component: ActiveProjectCardComponent;
  let fixture: ComponentFixture<ActiveProjectCardComponent>;

  const mockProject: ProjectResponse = {
    id: 1,
    name: 'Test Project',
    description: 'A test project',
    isActive: true,
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveProjectCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveProjectCardComponent);
    component = fixture.componentInstance;
    component.project = mockProject;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display project name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Project');
  });

  it('should display project description', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('A test project');
  });

  it('should display active status', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Active');
  });

  it('should emit edit event when edit button clicked', (done) => {
    spyOn(component.edit, 'emit');
    const editButton = fixture.nativeElement.querySelectorAll('.btn-secondary')[0];
    editButton.click();

    expect(component.edit.emit).toHaveBeenCalledWith(mockProject);
    done();
  });

  it('should emit activate event when activate button clicked', (done) => {
    spyOn(component.activate, 'emit');
    const activateButton = fixture.nativeElement.querySelectorAll('.btn-secondary')[1];
    activateButton.click();

    expect(component.activate.emit).toHaveBeenCalledWith(mockProject.id);
    done();
  });

  it('should not display section when project is null', () => {
    component.project = null;
    fixture.detectChanges();
    const section = fixture.nativeElement.querySelector('.active-project-section');
    expect(section).toBeFalsy();
  });

  it('should display default description when project has no description', () => {
    component.project = { ...mockProject, description: '' };
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No description provided');
  });
});
