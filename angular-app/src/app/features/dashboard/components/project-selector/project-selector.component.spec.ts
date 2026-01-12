import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectSelectorComponent } from './project-selector.component';
import { ProjectResponse } from '@models/index';

describe('ProjectSelectorComponent', () => {
  let component: ProjectSelectorComponent;
  let fixture: ComponentFixture<ProjectSelectorComponent>;

  const mockProjects: ProjectResponse[] = [
    {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      name: 'Project A',
      description: 'First project',
      goal: null,
      startDate: '2025-01-01',
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'a47ac10b-58cc-4372-a567-0e02b2c3d480',
      name: 'Project B',
      description: 'Second project',
      goal: null,
      startDate: '2025-01-02',
      isActive: false,
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectSelectorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all projects in dropdown', () => {
    component.projects = mockProjects;
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('option');
    expect(options.length).toBe(3); // 1 empty + 2 projects
  });

  it('should emit projectSelected when project is selected', () => {
    component.projects = mockProjects;
    spyOn(component.projectSelected, 'emit');
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = mockProjects[0].id;
    select.dispatchEvent(new Event('change'));

    expect(component.projectSelected.emit).toHaveBeenCalledWith(mockProjects[0].id);
  });

  it('should update selectedProjectId when project changes', () => {
    component.projects = mockProjects;
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = mockProjects[1].id;
    select.dispatchEvent(new Event('change'));

    expect(component.selectedProjectId).toBe(mockProjects[1].id);
  });

  it('should disable dropdown when no projects available', () => {
    component.projects = [];
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.disabled).toBe(true);
  });

  it('should show correct selected value', () => {
    component.projects = mockProjects;
    component.selectedProjectId = mockProjects[0].id;
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe(mockProjects[0].id);
  });
});
