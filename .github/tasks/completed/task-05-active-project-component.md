# Task 05: Créer le composant Active Project

## Overview

Développer le composant Angular qui affiche le projet actuellement actif avec son nom, son objectif et sa date de démarrage. Le composant doit gérer l'état "aucun projet actif" et afficher un message approprié.

## Estimate (days)

0.5 jour

## Component

Angular Component (Feature)

## Dependencies

- Task 01 (Initialiser le projet Angular) complétée
- Task 02 (Créer les modèles TypeScript) complétée

## API Contract

N/A (composant de présentation uniquement, reçoit les données via @Input)

## Acceptance criteria

- [ ] Composant `ActiveProjectComponent` créé dans `src/app/features/dashboard/components/active-project/`
- [ ] Syntaxe standalone
- [ ] Input pour recevoir le projet actif: `@Input() project: ProjectResponse | null`
- [ ] Affichage conditionnel:
  - Si `project` existe: afficher nom, objectif, date de début
  - Si `project` est null: afficher "No active project"
- [ ] Format de date localisé (ex: "Jan 6, 2026")
- [ ] Gestion de l'objectif optionnel (afficher "No goal set" si null)
- [ ] Design fidèle au style actuel (card avec gradient)
- [ ] Responsive
- [ ] Documentation JSDoc

## Required tests

### Unit tests (active-project.component.spec.ts)

- [ ] Test: composant se crée sans erreur
- [ ] Test: affiche "No active project" quand project est null
- [ ] Test: affiche le nom du projet quand fourni
- [ ] Test: affiche "No goal set" quand goal est null
- [ ] Test: affiche l'objectif quand fourni
- [ ] Test: formate correctement la date de début
- [ ] Test: gère projet avec toutes les données

## Notes techniques

### Référence HTML actuel

Voir `wwwroot/index.html` lignes 30-40:

```html
<section class="dashboard-section">
  <h2>Active Project</h2>
  <div id="active-project" class="project-card">
    <div class="card-content">
      <h3 id="project-name">No active project</h3>
      <p id="project-goal" class="project-goal"></p>
      <p id="project-dates" class="project-dates"></p>
    </div>
  </div>
</section>
```

### Référence JavaScript actuel

Voir `wwwroot/js/dashboard.js` lignes 169-182 (fonction `displayActiveProject`)

### Référence CSS

Voir `wwwroot/css/dashboard.css` pour les classes `.project-card`, `.card-content`, `.project-goal`, `.project-dates`

### Structure du composant

```
src/app/features/dashboard/components/active-project/
├── active-project.component.ts
├── active-project.component.html
├── active-project.component.css
└── active-project.component.spec.ts
```

## Quick examples

### active-project.component.ts

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ProjectResponse } from '../../../../models';

/**
 * Composant affichant le projet actuellement actif
 */
@Component({
  selector: 'app-active-project',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './active-project.component.html',
  styleUrls: ['./active-project.component.css']
})
export class ActiveProjectComponent {
  /**
   * Projet actif à afficher (null si aucun projet actif)
   */
  @Input() project: ProjectResponse | null = null;

  /**
   * Retourne le texte de l'objectif à afficher
   */
  get goalText(): string {
    return this.project?.goal || 'No goal set';
  }
}
```

### active-project.component.html

```html
<section class="active-project-section">
  <h2>Active Project</h2>
  
  <!-- Cas: aucun projet actif -->
  <div *ngIf="!project" class="project-card">
    <div class="card-content no-active-project">
      <p>No active project</p>
    </div>
  </div>

  <!-- Cas: projet actif existant -->
  <div *ngIf="project" class="project-card">
    <div class="card-content">
      <h3 class="project-name">{{ project.name }}</h3>
      <p class="project-goal">{{ goalText }}</p>
      <p class="project-dates">
        Started: {{ project.startDate | date: 'mediumDate' }}
      </p>
    </div>
  </div>
</section>
```

### active-project.component.css

```css
.active-project-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
}

.active-project-section h2 {
  font-size: 1.25rem;
  margin-bottom: 16px;
  color: #111827;
  font-weight: 600;
}

.project-card {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.card-content {
  padding: 20px;
}

.project-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
}

.project-goal {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.project-dates {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.no-active-project {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 40px 20px;
}

/* Responsive */
@media (max-width: 640px) {
  .project-name {
    font-size: 1.25rem;
  }
}
```

### active-project.component.spec.ts

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActiveProjectComponent } from './active-project.component';
import { ProjectResponse } from '../../../../models';

describe('ActiveProjectComponent', () => {
  let component: ActiveProjectComponent;
  let fixture: ComponentFixture<ActiveProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveProjectComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveProjectComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display "No active project" when project is null', () => {
    component.project = null;
    fixture.detectChanges();

    const noProjectText = fixture.nativeElement.querySelector('.no-active-project');
    expect(noProjectText).toBeTruthy();
    expect(noProjectText.textContent).toContain('No active project');
  });

  it('should display project name when project is provided', () => {
    const mockProject: ProjectResponse = {
      id: '123',
      name: 'Test Project',
      goal: 'Test Goal',
      startDate: '2026-01-06',
      isActive: true,
      createdAt: '2026-01-06T00:00:00Z'
    };

    component.project = mockProject;
    fixture.detectChanges();

    const projectName = fixture.nativeElement.querySelector('.project-name');
    expect(projectName.textContent).toBe('Test Project');
  });

  it('should display "No goal set" when goal is null', () => {
    const mockProject: ProjectResponse = {
      id: '123',
      name: 'Test Project',
      goal: null,
      startDate: '2026-01-06',
      isActive: true,
      createdAt: '2026-01-06T00:00:00Z'
    };

    component.project = mockProject;
    fixture.detectChanges();

    const goalText = fixture.nativeElement.querySelector('.project-goal');
    expect(goalText.textContent.trim()).toBe('No goal set');
  });

  it('should display goal when provided', () => {
    const mockProject: ProjectResponse = {
      id: '123',
      name: 'Test Project',
      goal: 'Complete MVP',
      startDate: '2026-01-06',
      isActive: true,
      createdAt: '2026-01-06T00:00:00Z'
    };

    component.project = mockProject;
    fixture.detectChanges();

    const goalText = fixture.nativeElement.querySelector('.project-goal');
    expect(goalText.textContent.trim()).toBe('Complete MVP');
  });

  it('should format start date correctly', () => {
    const mockProject: ProjectResponse = {
      id: '123',
      name: 'Test Project',
      goal: 'Test Goal',
      startDate: '2026-01-06',
      isActive: true,
      createdAt: '2026-01-06T00:00:00Z'
    };

    component.project = mockProject;
    fixture.detectChanges();

    const dateText = fixture.nativeElement.querySelector('.project-dates');
    expect(dateText.textContent).toContain('Started:');
    expect(dateText.textContent).toContain('Jan'); // Vérifie que le mois est formaté
  });

  it('should return correct goal text', () => {
    component.project = null;
    expect(component.goalText).toBe('No goal set');

    component.project = {
      id: '123',
      name: 'Test',
      goal: null,
      startDate: '2026-01-06',
      isActive: true,
      createdAt: '2026-01-06T00:00:00Z'
    };
    expect(component.goalText).toBe('No goal set');

    component.project = {
      ...component.project,
      goal: 'Real Goal'
    };
    expect(component.goalText).toBe('Real Goal');
  });
});
```

## Handoff checklist

- [ ] Composant créé et compile sans erreurs
- [ ] Affichage conditionnel fonctionne (projet actif vs. aucun projet)
- [ ] Formatage de date correct
- [ ] Gestion de l'objectif optionnel
- [ ] Tests unitaires écrits et passent (100% coverage)
- [ ] Design responsive testé
- [ ] Styles fidèles au design actuel
