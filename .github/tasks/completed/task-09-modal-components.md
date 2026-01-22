# Task 09: Créer les composants Modal (New Project et Log Work)

## Overview

Développer deux composants de modal Angular réutilisables pour créer un nouveau projet et logger du travail. Les modals doivent gérer la validation des formulaires, afficher les erreurs, et émettre des événements lors de la soumission.

## Estimate (days)

1.5 jours

## Component

Angular Components (Shared)

## Dependencies

- Task 01 (Initialiser le projet Angular) complétée
- Task 02 (Créer les modèles TypeScript) complétée

## API Contract

N/A (composants UI, émettent des événements avec données validées)

## Acceptance criteria

- [ ] Composant `ProjectModalComponent` créé dans `src/app/shared/components/project-modal/`
- [ ] Composant `LogWorkModalComponent` créé dans `src/app/shared/components/log-work-modal/`
- [ ] Les deux utilisent la syntaxe standalone
- [ ] Utilisation de `ReactiveFormsModule` pour les formulaires
- [ ] **ProjectModal**:
  - Input `@Input() isOpen: boolean`
  - Output `@Output() closeModal: EventEmitter<void>`
  - Output `@Output() submitProject: EventEmitter<CreateProjectRequest>`
  - Champs: name (requis, max 100), goal (optionnel, max 500)
  - Validation côté client
  - Désactivation bouton submit pendant soumission
- [ ] **LogWorkModal**:
  - Input `@Input() isOpen: boolean`
  - Input `@Input() projectId: string | null` (pour vérifier qu'un projet est actif)
  - Output `@Output() closeModal: EventEmitter<void>`
  - Output `@Output() submitLog: EventEmitter<CreateDailyLogRequest>`
  - Champs: task (requis, max 500), output (requis, max 1000), time (requis, > 0), revenue (optionnel, >= 0), note (optionnel, max 500)
  - Validation côté client
  - Message d'erreur si aucun projet actif
- [ ] Gestion du clic en dehors pour fermer (optionnel)
- [ ] Gestion de la touche Escape pour fermer
- [ ] Focus automatique sur premier champ à l'ouverture
- [ ] Reset du formulaire à la fermeture
- [ ] Accessibilité (aria-labels, role="dialog")
- [ ] Documentation JSDoc

## Required tests

### Unit tests (project-modal.component.spec.ts)

- [ ] Test: composant se crée sans erreur
- [ ] Test: modal visible quand `isOpen = true`
- [ ] Test: modal cachée quand `isOpen = false`
- [ ] Test: formulaire invalide si name vide
- [ ] Test: formulaire invalide si name dépasse 100 caractères
- [ ] Test: formulaire invalide si goal dépasse 500 caractères
- [ ] Test: formulaire valide avec name uniquement
- [ ] Test: émet `closeModal` lors du clic sur fermer
- [ ] Test: émet `submitProject` avec données correctes lors de la soumission
- [ ] Test: formulaire se reset après fermeture
- [ ] Test: focus sur champ name à l'ouverture

### Unit tests (log-work-modal.component.spec.ts)

- [ ] Test: composant se crée sans erreur
- [ ] Test: modal visible quand `isOpen = true`
- [ ] Test: formulaire invalide si task vide
- [ ] Test: formulaire invalide si output vide
- [ ] Test: formulaire invalide si time <= 0
- [ ] Test: formulaire invalide si revenue < 0
- [ ] Test: formulaire valide avec champs requis
- [ ] Test: émet `closeModal` lors du clic sur fermer
- [ ] Test: émet `submitLog` avec données correctes
- [ ] Test: affiche message d'erreur si projectId null
- [ ] Test: formulaire se reset après fermeture

## Notes techniques

### Référence HTML actuel (Project Modal)

Voir `wwwroot/index.html` lignes 118-152

### Référence HTML actuel (Log Modal)

Voir `wwwroot/index.html` lignes 154-217

### Structure des composants

```
src/app/shared/components/
├── project-modal/
│   ├── project-modal.component.ts
│   ├── project-modal.component.html
│   ├── project-modal.component.css
│   └── project-modal.component.spec.ts
└── log-work-modal/
    ├── log-work-modal.component.ts
    ├── log-work-modal.component.html
    ├── log-work-modal.component.css
    └── log-work-modal.component.spec.ts
```

## Quick examples

### project-modal.component.ts

```typescript
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateProjectRequest } from '../../../models';

/**
 * Modal pour créer un nouveau projet
 */
@Component({
  selector: 'app-project-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './project-modal.component.html',
  styleUrls: ['./project-modal.component.css']
})
export class ProjectModalComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() submitProject = new EventEmitter<CreateProjectRequest>();

  projectForm: FormGroup;
  isSubmitting = false;

  constructor() {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      goal: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        this.resetForm();
        setTimeout(() => this.focusFirstField(), 100);
      }
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (this.projectForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const formValue = this.projectForm.value;
    const request: CreateProjectRequest = {
      name: formValue.name.trim(),
      goal: formValue.goal?.trim() || null,
      startDate: this.getTodayAsString(),
      isActive: true
    };

    this.submitProject.emit(request);
    this.isSubmitting = false;
  }

  private resetForm(): void {
    this.projectForm.reset();
    this.isSubmitting = false;
  }

  private focusFirstField(): void {
    const firstField = document.querySelector<HTMLInputElement>('#project-name-input');
    firstField?.focus();
  }

  private getTodayAsString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get nameControl() {
    return this.projectForm.get('name');
  }

  get goalControl() {
    return this.projectForm.get('goal');
  }
}
```

### project-modal.component.html

```html
<div *ngIf="isOpen" class="modal" (click)="onClose()">
  <div class="modal-content" (click)="$event.stopPropagation()" role="dialog" aria-labelledby="modal-title">
    <div class="modal-header">
      <h2 id="modal-title">Create New Project</h2>
      <button
        type="button"
        class="modal-close"
        (click)="onClose()"
        aria-label="Close modal">
        &times;
      </button>
    </div>

    <form [formGroup]="projectForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="project-name-input">Project Name *</label>
        <input
          type="text"
          id="project-name-input"
          formControlName="name"
          [class.invalid]="nameControl?.invalid && nameControl?.touched" />
        <div *ngIf="nameControl?.invalid && nameControl?.touched" class="error-message">
          <span *ngIf="nameControl?.errors?.['required']">Project name is required</span>
          <span *ngIf="nameControl?.errors?.['maxlength']">
            Project name cannot exceed 100 characters
          </span>
        </div>
      </div>

      <div class="form-group">
        <label for="project-goal-input">Goal (optional)</label>
        <textarea
          id="project-goal-input"
          formControlName="goal"
          rows="3"
          [class.invalid]="goalControl?.invalid && goalControl?.touched"></textarea>
        <div *ngIf="goalControl?.invalid && goalControl?.touched" class="error-message">
          <span *ngIf="goalControl?.errors?.['maxlength']">
            Goal cannot exceed 500 characters
          </span>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" (click)="onClose()">
          Cancel
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          [disabled]="projectForm.invalid || isSubmitting">
          {{ isSubmitting ? 'Creating...' : 'Create Project' }}
        </button>
      </div>
    </form>
  </div>
</div>
```

### log-work-modal.component.ts

```typescript
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateDailyLogRequest } from '../../../models';

/**
 * Modal pour logger du travail
 */
@Component({
  selector: 'app-log-work-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './log-work-modal.component.html',
  styleUrls: ['./log-work-modal.component.css']
})
export class LogWorkModalComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() isOpen = false;
  @Input() projectId: string | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() submitLog = new EventEmitter<CreateDailyLogRequest>();

  logForm: FormGroup;
  isSubmitting = false;

  constructor() {
    this.logForm = this.fb.group({
      taskDescription: ['', [Validators.required, Validators.maxLength(500)]],
      outputDescription: ['', [Validators.required, Validators.maxLength(1000)]],
      timeSpentMinutes: [null, [Validators.required, Validators.min(1)]],
      revenueGenerated: [0, [Validators.min(0)]],
      note: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        this.resetForm();
        setTimeout(() => this.focusFirstField(), 100);
      }
    }
  }

  get hasNoActiveProject(): boolean {
    return !this.projectId;
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (this.logForm.invalid || this.isSubmitting || !this.projectId) {
      return;
    }

    this.isSubmitting = true;

    const formValue = this.logForm.value;
    const request: CreateDailyLogRequest = {
      date: this.getTodayAsString(),
      projectId: this.projectId,
      taskDescription: formValue.taskDescription.trim(),
      outputDescription: formValue.outputDescription.trim(),
      timeSpentMinutes: formValue.timeSpentMinutes,
      revenueGenerated: formValue.revenueGenerated || 0,
      note: formValue.note?.trim() || null
    };

    this.submitLog.emit(request);
    this.isSubmitting = false;
  }

  private resetForm(): void {
    this.logForm.reset({ revenueGenerated: 0 });
    this.isSubmitting = false;
  }

  private focusFirstField(): void {
    const firstField = document.querySelector<HTMLInputElement>('#log-task-input');
    firstField?.focus();
  }

  private getTodayAsString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get taskControl() {
    return this.logForm.get('taskDescription');
  }

  get outputControl() {
    return this.logForm.get('outputDescription');
  }

  get timeControl() {
    return this.logForm.get('timeSpentMinutes');
  }

  get revenueControl() {
    return this.logForm.get('revenueGenerated');
  }

  get noteControl() {
    return this.logForm.get('note');
  }
}
```

### modal.css (partagé - à copier dans les deux)

```css
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.modal-close:hover {
  color: #111827;
}

form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-group input.invalid,
.form-group textarea.invalid {
  border-color: #dc2626;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.error-message {
  margin-top: 6px;
  font-size: 0.75rem;
  color: #dc2626;
}

.warning-message {
  padding: 12px;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 6px;
  color: #92400e;
  font-size: 0.875rem;
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1e40af;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #111827;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

@media (max-width: 640px) {
  .modal-content {
    max-width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
```

## Handoff checklist

- [ ] Les 2 composants créés et compilent sans erreurs
- [ ] Validation des formulaires fonctionnelle
- [ ] Affichage des messages d'erreur
- [ ] Événements émis correctement avec données validées
- [ ] Reset des formulaires à la fermeture
- [ ] Focus automatique sur premier champ
- [ ] Tests unitaires écrits et passent (>90% coverage)
- [ ] Accessibilité (aria-labels, role)
- [ ] Design responsive testé
- [ ] Gestion état de soumission (bouton désactivé)
