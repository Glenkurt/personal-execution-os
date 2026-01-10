# Task 08: Créer le composant Projects List

## Overview

Développer le composant Angular qui affiche la liste de tous les projets existants avec la possibilité d'activer un projet. Chaque projet doit afficher son nom, son objectif, un badge "ACTIVE" si actif, et un bouton "Activate" si inactif.

## Estimate (days)

1 jour

## Component

Angular Component (Feature)

## Dependencies

- Task 01 (Initialiser le projet Angular) complétée
- Task 02 (Créer les modèles TypeScript) complétée

## API Contract

N/A (composant de présentation, reçoit données via @Input et émet événement via @Output)

## Acceptance criteria

- [ ] Composant `ProjectsListComponent` créé dans `src/app/features/dashboard/components/projects-list/`
- [ ] Syntaxe standalone
- [ ] Input pour recevoir la liste: `@Input() projects: ProjectResponse[]`
- [ ] Output pour activation: `@Output() activateProject: EventEmitter<string>` (émet l'ID du projet)
- [ ] Affichage conditionnel:
  - Si `projects` vide: afficher "No projects yet"
  - Si `projects` non vide: afficher liste triée (actifs en premier, puis alphabétique)
- [ ] Pour chaque projet:
  - Nom du projet
  - Objectif (ou "No goal" si null)
  - Badge "ACTIVE" si `isActive = true`
  - Bouton "Activate" si `isActive = false` (désactivé si actif)
- [ ] Tri automatique: projets actifs en premier, puis par nom alphabétique
- [ ] Design responsive (liste verticale)
- [ ] Documentation JSDoc

## Required tests

### Unit tests (projects-list.component.spec.ts)

- [ ] Test: composant se crée sans erreur
- [ ] Test: affiche "No projects yet" quand liste vide
- [ ] Test: affiche tous les projets fournis
- [ ] Test: trie projets actifs en premier
- [ ] Test: affiche badge "ACTIVE" sur projet actif
- [ ] Test: bouton "Activate" désactivé pour projet actif
- [ ] Test: bouton "Activate" actif pour projet inactif
- [ ] Test: clic sur "Activate" émet événement avec bon ID
- [ ] Test: affiche "No goal" si goal est null
- [ ] Test: affiche goal si fourni

## Notes techniques

### Référence HTML actuel

Voir `wwwroot/index.html` lignes 43-48:

```html
<section class="dashboard-section">
  <h2>Projects</h2>
  <div id="projects-list" class="projects-list">
    <div class="no-activity">No projects yet</div>
  </div>
</section>
```

### Référence JavaScript actuel

Voir `wwwroot/js/dashboard.js` lignes 184-232 (fonction `displayProjects`)

```javascript
function displayProjects(projects) {
  const list = document.getElementById("projects-list");

  if (!list) {
    return;
  }

  if (!projects || projects.length === 0) {
    list.innerHTML = '<div class="no-activity">No projects yet</div>';
    return;
  }

  const rows = projects
    .slice()
    .sort((a, b) => {
      if (a.isActive === b.isActive) {
        return a.name.localeCompare(b.name);
      }
      return a.isActive ? -1 : 1;
    })
    .map((p) => {
      const activeBadge = p.isActive
        ? '<span class="project-active-badge">ACTIVE</span>'
        : "";
      const activateButton = p.isActive
        ? '<button class="btn btn-secondary" disabled>Active</button>'
        : `<button class="btn btn-secondary activate-project-btn" data-project-id="${escapeHtml(p.id)}">Activate</button>`;

      const goal = p.goal ? escapeHtml(p.goal) : "No goal";
      return `
        <div class="project-list-item">
          <div class="project-list-item-left">
            <div class="project-list-item-name">${escapeHtml(p.name)}</div>
            <div class="project-list-item-meta">${goal}</div>
          </div>
          <div class="project-list-item-actions">
            ${activeBadge}
            ${activateButton}
          </div>
        </div>
      `;
    })
    .join("");

  list.innerHTML = rows;

  list.querySelectorAll(".activate-project-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const projectId = button.dataset.projectId;
      activateProject(projectId);
    });
  });
}
```

### Structure du composant

```
src/app/features/dashboard/components/projects-list/
├── projects-list.component.ts
├── projects-list.component.html
├── projects-list.component.css
└── projects-list.component.spec.ts
```

## Quick examples

### projects-list.component.ts

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectResponse } from '../../../../models';

/**
 * Composant affichant la liste de tous les projets
 */
@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.css']
})
export class ProjectsListComponent {
  /**
   * Liste des projets à afficher
   */
  @Input() set projects(value: ProjectResponse[]) {
    this._projects = this.sortProjects(value || []);
  }
  get projects(): ProjectResponse[] {
    return this._projects;
  }
  private _projects: ProjectResponse[] = [];

  /**
   * Émis lorsqu'un utilisateur clique sur Activate pour un projet
   * Émet l'ID du projet à activer
   */
  @Output() activateProjectClicked = new EventEmitter<string>();

  /**
   * Retourne le texte de l'objectif à afficher
   */
  getGoalText(project: ProjectResponse): string {
    return project.goal || 'No goal';
  }

  /**
   * Gère le clic sur le bouton Activate
   */
  onActivateProject(projectId: string): void {
    this.activateProjectClicked.emit(projectId);
  }

  /**
   * Trie les projets: actifs en premier, puis par nom alphabétique
   */
  private sortProjects(projects: ProjectResponse[]): ProjectResponse[] {
    return [...projects].sort((a, b) => {
      // Actifs d'abord
      if (a.isActive !== b.isActive) {
        return a.isActive ? -1 : 1;
      }
      // Puis par nom alphabétique
      return a.name.localeCompare(b.name);
    });
  }
}
```

### projects-list.component.html

```html
<section class="projects-list-section">
  <h2>Projects</h2>

  <!-- Cas: aucun projet -->
  <div *ngIf="projects.length === 0" class="projects-list">
    <div class="no-activity">No projects yet</div>
  </div>

  <!-- Cas: projets existants -->
  <div *ngIf="projects.length > 0" class="projects-list">
    <div *ngFor="let project of projects" class="project-list-item">
      <div class="project-list-item-left">
        <div class="project-list-item-name">{{ project.name }}</div>
        <div class="project-list-item-meta">{{ getGoalText(project) }}</div>
      </div>
      <div class="project-list-item-actions">
        <span *ngIf="project.isActive" class="project-active-badge">
          ACTIVE
        </span>
        <button
          *ngIf="project.isActive"
          class="btn btn-secondary"
          disabled
          type="button">
          Active
        </button>
        <button
          *ngIf="!project.isActive"
          class="btn btn-secondary"
          (click)="onActivateProject(project.id)"
          type="button">
          Activate
        </button>
      </div>
    </div>
  </div>
</section>
```

### projects-list.component.css

```css
.projects-list-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
}

.projects-list-section h2 {
  font-size: 1.25rem;
  margin-bottom: 16px;
  color: #111827;
  font-weight: 600;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.no-activity {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.project-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.project-list-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.project-list-item-left {
  flex: 1;
  min-width: 0; /* Pour permettre text-overflow */
}

.project-list-item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-list-item-meta {
  font-size: 0.875rem;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-list-item-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.project-active-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #16a34a;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 4px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #111827;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 640px) {
  .project-list-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .project-list-item-actions {
    width: 100%;
    justify-content: space-between;
  }

  .btn {
    flex: 1;
  }
}
```

### projects-list.component.spec.ts

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectsListComponent } from './projects-list.component';
import { ProjectResponse } from '../../../../models';

describe('ProjectsListComponent', () => {
  let component: ProjectsListComponent;
  let fixture: ComponentFixture<ProjectsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display "No projects yet" when projects list is empty', () => {
    component.projects = [];
    fixture.detectChanges();

    const noActivity = fixture.nativeElement.querySelector('.no-activity');
    expect(noActivity).toBeTruthy();
    expect(noActivity.textContent.trim()).toBe('No projects yet');
  });

  it('should display all projects', () => {
    const mockProjects: ProjectResponse[] = [
      {
        id: '1',
        name: 'Project A',
        goal: 'Goal A',
        startDate: '2026-01-01',
        isActive: false,
        createdAt: '2026-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Project B',
        goal: 'Goal B',
        startDate: '2026-01-02',
        isActive: false,
        createdAt: '2026-01-02T00:00:00Z'
      }
    ];

    component.projects = mockProjects;
    fixture.detectChanges();

    const projectItems = fixture.nativeElement.querySelectorAll('.project-list-item');
    expect(projectItems.length).toBe(2);
  });

  it('should sort active projects first', () => {
    const mockProjects: ProjectResponse[] = [
      {
        id: '1',
        name: 'Project Z',
        goal: 'Goal Z',
        startDate: '2026-01-01',
        isActive: false,
        createdAt: '2026-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Project A',
        goal: 'Goal A',
        startDate: '2026-01-02',
        isActive: true,
        createdAt: '2026-01-02T00:00:00Z'
      }
    ];

    component.projects = mockProjects;
    fixture.detectChanges();

    const projectNames = fixture.nativeElement.querySelectorAll('.project-list-item-name');
    expect(projectNames[0].textContent.trim()).toBe('Project A'); // Active first
    expect(projectNames[1].textContent.trim()).toBe('Project Z');
  });

  it('should display ACTIVE badge for active project', () => {
    const mockProjects: ProjectResponse[] = [
      {
        id: '1',
        name: 'Active Project',
        goal: 'Goal',
        startDate: '2026-01-01',
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z'
      }
    ];

    component.projects = mockProjects;
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.project-active-badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent.trim()).toBe('ACTIVE');
  });

  it('should disable Activate button for active project', () => {
    const mockProjects: ProjectResponse[] = [
      {
        id: '1',
        name: 'Active Project',
        goal: 'Goal',
        startDate: '2026-01-01',
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z'
      }
    ];

    component.projects = mockProjects;
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const disabledButton = Array.from(buttons).find((btn: any) => 
      btn.textContent.trim() === 'Active'
    ) as HTMLButtonElement;
    
    expect(disabledButton).toBeTruthy();
    expect(disabledButton.disabled).toBe(true);
  });

  it('should show Activate button for inactive project', () => {
    const mockProjects: ProjectResponse[] = [
      {
        id: '1',
        name: 'Inactive Project',
        goal: 'Goal',
        startDate: '2026-01-01',
        isActive: false,
        createdAt: '2026-01-01T00:00:00Z'
      }
    ];

    component.projects = mockProjects;
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const activateButton = Array.from(buttons).find((btn: any) => 
      btn.textContent.trim() === 'Activate'
    ) as HTMLButtonElement;
    
    expect(activateButton).toBeTruthy();
    expect(activateButton.disabled).toBe(false);
  });

  it('should emit activateProjectClicked when Activate button is clicked', () => {
    const mockProjects: ProjectResponse[] = [
      {
        id: 'test-id-123',
        name: 'Inactive Project',
        goal: 'Goal',
        startDate: '2026-01-01',
        isActive: false,
        createdAt: '2026-01-01T00:00:00Z'
      }
    ];

    spyOn(component.activateProjectClicked, 'emit');

    component.projects = mockProjects;
    fixture.detectChanges();

    const activateButton = fixture.nativeElement.querySelector('button');
    activateButton.click();

    expect(component.activateProjectClicked.emit).toHaveBeenCalledWith('test-id-123');
  });

  it('should display "No goal" when goal is null', () => {
    const mockProjects: ProjectResponse[] = [
      {
        id: '1',
        name: 'Project',
        goal: null,
        startDate: '2026-01-01',
        isActive: false,
        createdAt: '2026-01-01T00:00:00Z'
      }
    ];

    component.projects = mockProjects;
    fixture.detectChanges();

    const metaText = fixture.nativeElement.querySelector('.project-list-item-meta');
    expect(metaText.textContent.trim()).toBe('No goal');
  });

  it('should display goal when provided', () => {
    const mockProjects: ProjectResponse[] = [
      {
        id: '1',
        name: 'Project',
        goal: 'Complete MVP',
        startDate: '2026-01-01',
        isActive: false,
        createdAt: '2026-01-01T00:00:00Z'
      }
    ];

    component.projects = mockProjects;
    fixture.detectChanges();

    const metaText = fixture.nativeElement.querySelector('.project-list-item-meta');
    expect(metaText.textContent.trim()).toBe('Complete MVP');
  });
});
```

## Handoff checklist

- [ ] Composant créé et compile sans erreurs
- [ ] Affichage conditionnel fonctionne (liste vide vs. projets)
- [ ] Tri automatique correct (actifs en premier, puis alphabétique)
- [ ] Badge "ACTIVE" affiché uniquement pour projets actifs
- [ ] Boutons "Activate" fonctionnels et bien désactivés
- [ ] Événement `activateProjectClicked` émis avec bon ID
- [ ] Gestion de goal null (affiche "No goal")
- [ ] Tests unitaires écrits et passent (100% coverage)
- [ ] Design responsive testé (mobile et desktop)
