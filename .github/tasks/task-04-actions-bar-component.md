# Task 04: Créer le composant Actions (bandeau en haut)

## Overview

Développer le composant Angular standalone qui affiche le bandeau d'actions en haut de page avec les boutons Refresh, Log Work, et New Project. Ce composant doit émettre des événements pour déclencher les actions appropriées.

## Estimate (days)

0.5 jour

## Component

Angular Component (Shared)

## Dependencies

- Task 01 (Initialiser le projet Angular) complétée
- Task 02 (Créer les modèles TypeScript) complétée

## API Contract

N/A (composant UI uniquement, pas d'appels API directs)

## Acceptance criteria

- [ ] Composant `ActionsBarComponent` créé dans `src/app/shared/components/actions-bar/`
- [ ] Utilisation de la syntaxe standalone (pas de NgModule)
- [ ] Trois boutons implémentés:
  - "↻ Refresh" (bouton primaire)
  - "+ Log Work" (bouton secondaire)
  - "+ New Project" (bouton secondaire)
- [ ] Événements Output pour chaque action:
  - `@Output() refreshClicked: EventEmitter<void>`
  - `@Output() logWorkClicked: EventEmitter<void>`
  - `@Output() newProjectClicked: EventEmitter<void>`
- [ ] Design responsive (mobile-first)
- [ ] Styles CSS encapsulés (ViewEncapsulation.Emulated par défaut)
- [ ] Accessibilité: boutons avec aria-labels appropriés
- [ ] État de chargement optionnel (input) qui désactive les boutons
- [ ] Documentation JSDoc pour les inputs/outputs

## Required tests

### Unit tests (actions-bar.component.spec.ts)

- [ ] Test: composant se crée sans erreur
- [ ] Test: les 3 boutons sont rendus
- [ ] Test: clic sur "Refresh" émet `refreshClicked`
- [ ] Test: clic sur "Log Work" émet `logWorkClicked`
- [ ] Test: clic sur "New Project" émet `newProjectClicked`
- [ ] Test: boutons désactivés quand `isLoading = true`
- [ ] Test: aria-labels présents sur tous les boutons

## Notes techniques

### Référence du HTML actuel

Voir `wwwroot/index.html` lignes 100-115:

```html
<section class="dashboard-section">
  <h2>Actions</h2>
  <div class="actions">
    <button onclick="refreshDashboard()" class="btn btn-primary">
      ↻ Refresh
    </button>
    <button onclick="openNewLogModal()" class="btn btn-secondary">
      + Log Work
    </button>
    <button onclick="openProjectModal()" class="btn btn-secondary">
      + New Project
    </button>
  </div>
</section>
```

### Référence styles CSS

Voir `wwwroot/css/dashboard.css` pour les classes `.btn`, `.btn-primary`, `.btn-secondary`, `.actions`

### Structure du composant

```
src/app/shared/components/actions-bar/
├── actions-bar.component.ts
├── actions-bar.component.html
├── actions-bar.component.css
└── actions-bar.component.spec.ts
```

## Quick examples

### actions-bar.component.ts

```typescript
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Composant de barre d'actions avec boutons Refresh, Log Work, et New Project
 */
@Component({
  selector: 'app-actions-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './actions-bar.component.html',
  styleUrls: ['./actions-bar.component.css']
})
export class ActionsBarComponent {
  /**
   * Indique si une opération est en cours (désactive les boutons)
   */
  @Input() isLoading = false;

  /**
   * Émis lorsque l'utilisateur clique sur Refresh
   */
  @Output() refreshClicked = new EventEmitter<void>();

  /**
   * Émis lorsque l'utilisateur clique sur Log Work
   */
  @Output() logWorkClicked = new EventEmitter<void>();

  /**
   * Émis lorsque l'utilisateur clique sur New Project
   */
  @Output() newProjectClicked = new EventEmitter<void>();

  onRefresh(): void {
    this.refreshClicked.emit();
  }

  onLogWork(): void {
    this.logWorkClicked.emit();
  }

  onNewProject(): void {
    this.newProjectClicked.emit();
  }
}
```

### actions-bar.component.html

```html
<section class="actions-bar">
  <h2>Actions</h2>
  <div class="actions">
    <button
      class="btn btn-primary"
      [disabled]="isLoading"
      (click)="onRefresh()"
      aria-label="Refresh dashboard"
      type="button">
      ↻ Refresh
    </button>
    <button
      class="btn btn-secondary"
      [disabled]="isLoading"
      (click)="onLogWork()"
      aria-label="Log work"
      type="button">
      + Log Work
    </button>
    <button
      class="btn btn-secondary"
      [disabled]="isLoading"
      (click)="onNewProject()"
      aria-label="Create new project"
      type="button">
      + New Project
    </button>
  </div>
</section>
```

### actions-bar.component.css

```css
.actions-bar {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
}

.actions-bar h2 {
  font-size: 1.25rem;
  margin-bottom: 16px;
  color: #111827;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1e40af;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #111827;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

/* Responsive */
@media (max-width: 640px) {
  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
```

### actions-bar.component.spec.ts

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionsBarComponent } from './actions-bar.component';

describe('ActionsBarComponent', () => {
  let component: ActionsBarComponent;
  let fixture: ComponentFixture<ActionsBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionsBarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ActionsBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render three buttons', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(3);
  });

  it('should emit refreshClicked when refresh button is clicked', () => {
    spyOn(component.refreshClicked, 'emit');
    
    const refreshButton = fixture.nativeElement.querySelector('.btn-primary');
    refreshButton.click();
    
    expect(component.refreshClicked.emit).toHaveBeenCalledWith();
  });

  it('should emit logWorkClicked when log work button is clicked', () => {
    spyOn(component.logWorkClicked, 'emit');
    
    const buttons = fixture.nativeElement.querySelectorAll('.btn-secondary');
    buttons[0].click();
    
    expect(component.logWorkClicked.emit).toHaveBeenCalledWith();
  });

  it('should emit newProjectClicked when new project button is clicked', () => {
    spyOn(component.newProjectClicked, 'emit');
    
    const buttons = fixture.nativeElement.querySelectorAll('.btn-secondary');
    buttons[1].click();
    
    expect(component.newProjectClicked.emit).toHaveBeenCalledWith();
  });

  it('should disable buttons when isLoading is true', () => {
    component.isLoading = true;
    fixture.detectChanges();
    
    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons.forEach((button: HTMLButtonElement) => {
      expect(button.disabled).toBe(true);
    });
  });

  it('should have aria-labels on all buttons', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons.forEach((button: HTMLButtonElement) => {
      expect(button.getAttribute('aria-label')).toBeTruthy();
    });
  });
});
```

## Handoff checklist

- [ ] Composant créé et compile sans erreurs
- [ ] Les 3 boutons fonctionnent et émettent les bons événements
- [ ] Design responsive testé sur mobile
- [ ] Tests unitaires écrits et passent (100% coverage)
- [ ] Accessibilité validée (aria-labels)
- [ ] État de chargement fonctionnel
