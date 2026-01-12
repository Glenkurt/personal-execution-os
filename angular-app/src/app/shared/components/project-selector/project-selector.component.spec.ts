import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectSelectorComponent } from './project-selector.component';
import { Project } from '../../../models/project.model';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ProjectSelectorComponent', () => {
  let component: ProjectSelectorComponent;
  let fixture: ComponentFixture<ProjectSelectorComponent>;

  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'Project 1',
      description: 'Desc 1',
      goal: 'Goal 1',
      startDate: '2025-01-01',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Project 2',
      description: 'Desc 2',
      goal: 'Goal 2',
      startDate: '2025-01-02',
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectSelectorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render select element', () => {
    const selectElement = fixture.debugElement.query(By.css('.selector-input'));
    expect(selectElement).toBeTruthy();
  });

  it('should display provided projects in select', () => {
    component.projects = mockProjects;
    fixture.detectChanges();

    const options = fixture.debugElement.queryAll(By.css('.selector-input option'));
    // +1 for the default "-- All Projects --" option
    expect(options.length).toBe(mockProjects.length + 1);
  });

  it('should emit projectSelected event when project is selected', () => {
    component.projects = mockProjects;
    spyOn(component.projectSelected, 'emit');
    fixture.detectChanges();

    const selectElement: HTMLSelectElement = fixture.debugElement.query(
      By.css('.selector-input')
    ).nativeElement;
    selectElement.value = '1';
    selectElement.dispatchEvent(new Event('change'));

    expect(component.projectSelected.emit).toHaveBeenCalledWith('1');
  });

  it('should update selected value when selectedProjectId changes', () => {
    component.projects = mockProjects;
    component.selectedProjectId = '1';
    fixture.detectChanges();

    const selectElement: HTMLSelectElement = fixture.debugElement.query(
      By.css('.selector-input')
    ).nativeElement;
    expect(selectElement.value).toBe('1');
  });

  it('should display default option', () => {
    const selectElement = fixture.debugElement.query(By.css('.selector-input'));
    const firstOption = selectElement.nativeElement.querySelector('option');
    expect(firstOption.textContent).toContain('-- All Projects --');
  });

  it('should not emit event when empty value is selected', () => {
    component.projects = mockProjects;
    spyOn(component.projectSelected, 'emit');
    fixture.detectChanges();

    const selectElement: HTMLSelectElement = fixture.debugElement.query(
      By.css('.selector-input')
    ).nativeElement;
    selectElement.value = '';
    selectElement.dispatchEvent(new Event('change'));

    expect(component.projectSelected.emit).not.toHaveBeenCalled();
  });
});
