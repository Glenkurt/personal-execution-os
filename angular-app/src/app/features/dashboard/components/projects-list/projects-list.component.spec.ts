import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ProjectsListComponent } from './projects-list.component';
import { ProjectResponse } from '@models/index';

describe('ProjectsListComponent', () => {
  let component: ProjectsListComponent;
  let fixture: ComponentFixture<ProjectsListComponent>;

  const mockProjects: ProjectResponse[] = [
    {
      id: 1,
      name: 'Active Project',
      description: 'An active project',
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-10T00:00:00Z',
    },
    {
      id: 2,
      name: 'Inactive Project',
      description: 'An inactive project',
      isActive: false,
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-01-09T00:00:00Z',
    },
    {
      id: 3,
      name: 'Another Project',
      description: 'Another project description',
      isActive: true,
      createdAt: '2025-01-03T00:00:00Z',
      updatedAt: '2025-01-08T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsListComponent, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsListComponent);
    component = fixture.componentInstance;
    component.projects = mockProjects;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all projects initially', () => {
    expect(component.filteredProjects.length).toBe(3);
  });

  it('should filter projects by search term', () => {
    component.searchTerm = 'Active';
    component.onSearchChange();
    expect(component.filteredProjects.length).toBe(2);
  });

  it('should filter projects by active status', () => {
    component.statusFilter = 'active';
    component.onFilterChange();
    expect(component.filteredProjects.length).toBe(2);
  });

  it('should filter projects by inactive status', () => {
    component.statusFilter = 'inactive';
    component.onFilterChange();
    expect(component.filteredProjects.length).toBe(1);
  });

  it('should emit projectSelected event when project clicked', (done) => {
    spyOn(component.projectSelected, 'emit');
    component.onSelectProject(mockProjects[0]);
    expect(component.projectSelected.emit).toHaveBeenCalledWith(mockProjects[0]);
    done();
  });

  it('should emit projectEdit event when edit button clicked', (done) => {
    spyOn(component.projectEdit, 'emit');
    const event = new MouseEvent('click', { bubbles: true });
    component.onEditProject(event, mockProjects[0]);
    expect(component.projectEdit.emit).toHaveBeenCalledWith(mockProjects[0]);
    done();
  });

  it('should display project count', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('All Projects (3)');
  });

  it('should display empty state when no projects match filter', () => {
    component.searchTerm = 'NonExistent';
    component.onSearchChange();
    fixture.detectChanges();
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should display project names', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Active Project');
    expect(compiled.textContent).toContain('Inactive Project');
  });

  it('should update filtered projects when input changes', () => {
    component.searchTerm = 'Another';
    component.onSearchChange();
    fixture.detectChanges();
    expect(component.filteredProjects.length).toBe(1);
    expect(component.filteredProjects[0].name).toBe('Another Project');
  });
});
