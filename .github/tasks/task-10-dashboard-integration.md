# Task 10: Intégrer tous les composants dans le Dashboard principal

## Overview

Créer le composant Dashboard principal qui orchestre tous les composants enfants, gère l'état global de l'application, effectue les appels aux services API, et coordonne les interactions entre composants. C'est le "smart component" qui contient toute la logique métier.

## Estimate (days)

2 jours

## Component

Angular Component (Feature - Dashboard)

## Dependencies

- Task 01 à Task 09 doivent être complétées
- Tous les composants enfants doivent être créés
- Tous les services doivent être implémentés

## API Contract

N/A (composant d'orchestration utilisant les services)

## Acceptance criteria

- [ ] Composant `DashboardComponent` créé dans `src/app/features/dashboard/`
- [ ] Syntaxe standalone
- [ ] Import de tous les composants enfants (ActionsBar, ActiveProject, Metrics, LastActivity, ProjectsList, Modals)
- [ ] Utilisation de signals Angular pour l'état réactif (si Angular 16+) ou BehaviorSubject sinon
- [ ] État géré:
  - `isLoading: boolean`
  - `errorMessage: string | null`
  - `activeProject: ProjectResponse | null`
  - `allProjects: ProjectResponse[]`
  - `metrics: MetricsResponse | null`
  - `lastLog: DailyLogResponse | null`
  - `isProjectModalOpen: boolean`
  - `isLogModalOpen: boolean`
- [ ] Méthode `refreshDashboard()` pour charger toutes les données
- [ ] Méthode `handleActivateProject(projectId)` pour activer un projet
- [ ] Méthode `handleCreateProject(request)` pour créer un projet
- [ ] Méthode `handleCreateLog(request)` pour logger du travail
- [ ] Gestion des erreurs avec affichage à l'utilisateur
- [ ] Auto-refresh toutes les 30 secondes (optionnel, via interval)
- [ ] Layout avec ordre des composants selon le brief:
  1. Actions Bar (en haut)
  2. Active Project
  3. Metrics + Last Activity (côte à côte sur desktop)
  4. Projects List
- [ ] Header avec titre et sous-titre
- [ ] Styles globaux et layout responsive
- [ ] Documentation JSDoc

## Required tests

### Unit tests (dashboard.component.spec.ts)

- [ ] Test: composant se crée sans erreur
- [ ] Test: `refreshDashboard()` appelle tous les services
- [ ] Test: affiche le projet actif quand disponible
- [ ] Test: affiche "No active project" quand null
- [ ] Test: ouvre modal projet au clic sur "New Project"
- [ ] Test: ouvre modal log au clic sur "Log Work"
- [ ] Test: appelle `activateProject` lors de l'événement
- [ ] Test: appelle `createProject` lors de la soumission modal
- [ ] Test: appelle `createDailyLog` lors de la soumission modal
- [ ] Test: gère les erreurs API et les affiche
- [ ] Test: ferme les modals après soumission réussie
- [ ] Test: refresh dashboard après création projet/log

## Notes techniques

### Référence structure actuelle

- HTML: `wwwroot/index.html` (structure complète)
- JavaScript: `wwwroot/js/dashboard.js` (logique de refresh et état)
- CSS: `wwwroot/css/dashboard.css` (styles globaux)

### Layout requis

```
┌─────────────────────────────────────┐
│          HEADER                      │
│  Personal Execution OS               │
│  Track execution, focus, and output  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ACTIONS BAR                         │
│  [Refresh] [+ Log Work] [+ Project]  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ACTIVE PROJECT                      │
│  Project Name                        │
│  Goal                                │
│  Started: Date                       │
└─────────────────────────────────────┘

┌──────────────────┬──────────────────┐
│  THIS WEEK'S     │  LAST ACTIVITY   │
│  METRICS         │                  │
│  [4 metric cards]│  Date, Task...   │
└──────────────────┴──────────────────┘

┌─────────────────────────────────────┐
│  PROJECTS                            │
│  List of all projects...             │
└─────────────────────────────────────┘
```

### Structure du composant

```
src/app/features/dashboard/
├── dashboard.component.ts
├── dashboard.component.html
├── dashboard.component.css
├── dashboard.component.spec.ts
└── components/
    ├── active-project/
    ├── metrics/
    ├── last-activity/
    └── projects-list/
```

## Quick examples

### dashboard.component.ts

```typescript
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';

// Services
import { ProjectService } from '../../core/services/project.service';
import { DailyLogService } from '../../core/services/daily-log.service';
import { MetricsService } from '../../core/services/metrics.service';

// Models
import {
  ProjectResponse,
  DailyLogResponse,
  MetricsResponse,
  CreateProjectRequest,
  CreateDailyLogRequest
} from '../../models';

// Components
import { ActionsBarComponent } from '../../shared/components/actions-bar/actions-bar.component';
import { ActiveProjectComponent } from './components/active-project/active-project.component';
import { MetricsComponent } from './components/metrics/metrics.component';
import { LastActivityComponent } from './components/last-activity/last-activity.component';
import { ProjectsListComponent } from './components/projects-list/projects-list.component';
import { ProjectModalComponent } from '../../shared/components/project-modal/project-modal.component';
import { LogWorkModalComponent } from '../../shared/components/log-work-modal/log-work-modal.component';

/**
 * Composant principal du Dashboard
 * Orchestre tous les composants enfants et gère l'état global
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ActionsBarComponent,
    ActiveProjectComponent,
    MetricsComponent,
    LastActivityComponent,
    ProjectsListComponent,
    ProjectModalComponent,
    LogWorkModalComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly projectService = inject(ProjectService);
  private readonly dailyLogService = inject(DailyLogService);
  private readonly metricsService = inject(MetricsService);

  // État (using signals for Angular 16+)
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  activeProject = signal<ProjectResponse | null>(null);
  allProjects = signal<ProjectResponse[]>([]);
  metrics = signal<MetricsResponse | null>(null);
  lastLog = signal<DailyLogResponse | null>(null);
  isProjectModalOpen = signal(false);
  isLogModalOpen = signal(false);

  private refreshSubscription?: Subscription;

  ngOnInit(): void {
    this.refreshDashboard();
    
    // Auto-refresh every 30 seconds
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.refreshDashboard();
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  /**
   * Charge toutes les données du dashboard
   */
  async refreshDashboard(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // Charger projet actif
      await this.loadActiveProject();

      // Charger tous les projets
      await this.loadAllProjects();

      // Si projet actif existe, charger métriques et logs
      const currentActiveProject = this.activeProject();
      if (currentActiveProject) {
        await Promise.all([
          this.loadMetrics(currentActiveProject.id),
          this.loadLastActivity(currentActiveProject.id)
        ]);
      } else {
        this.metrics.set(null);
        this.lastLog.set(null);
      }
    } catch (error) {
      console.error('Dashboard refresh error:', error);
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Failed to refresh dashboard'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Charge le projet actif
   */
  private async loadActiveProject(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.projectService.getActiveProject().subscribe({
        next: (project) => {
          this.activeProject.set(project);
          resolve();
        },
        error: (error) => reject(error)
      });
    });
  }

  /**
   * Charge tous les projets
   */
  private async loadAllProjects(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.projectService.getAllProjects().subscribe({
        next: (projects) => {
          this.allProjects.set(projects);
          resolve();
        },
        error: (error) => reject(error)
      });
    });
  }

  /**
   * Charge les métriques d'un projet
   */
  private async loadMetrics(projectId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.metricsService.getAllMetrics(projectId).subscribe({
        next: (metrics) => {
          this.metrics.set(metrics);
          resolve();
        },
        error: (error) => reject(error)
      });
    });
  }

  /**
   * Charge la dernière activité d'un projet
   */
  private async loadLastActivity(projectId: string): Promise<void> {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const startDate = this.formatDateForAPI(weekAgo);
    const endDate = this.formatDateForAPI(today);

    return new Promise((resolve, reject) => {
      this.dailyLogService.getLogsByDateRange(projectId, startDate, endDate).subscribe({
        next: (logs) => {
          if (logs && logs.length > 0) {
            this.lastLog.set(logs[logs.length - 1]);
          } else {
            this.lastLog.set(null);
          }
          resolve();
        },
        error: (error) => reject(error)
      });
    });
  }

  /**
   * Gère l'activation d'un projet
   */
  async handleActivateProject(projectId: string): Promise<void> {
    try {
      await new Promise<void>((resolve, reject) => {
        this.projectService.activateProject(projectId).subscribe({
          next: () => resolve(),
          error: (error) => reject(error)
        });
      });

      await this.refreshDashboard();
    } catch (error) {
      console.error('Activate project error:', error);
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Failed to activate project'
      );
    }
  }

  /**
   * Gère la création d'un projet
   */
  async handleCreateProject(request: CreateProjectRequest): Promise<void> {
    try {
      await new Promise<void>((resolve, reject) => {
        this.projectService.createProject(request).subscribe({
          next: () => resolve(),
          error: (error) => reject(error)
        });
      });

      this.isProjectModalOpen.set(false);
      await this.refreshDashboard();
    } catch (error) {
      console.error('Create project error:', error);
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Failed to create project'
      );
    }
  }

  /**
   * Gère la création d'un log
   */
  async handleCreateLog(request: CreateDailyLogRequest): Promise<void> {
    try {
      await new Promise<void>((resolve, reject) => {
        this.dailyLogService.createDailyLog(request).subscribe({
          next: () => resolve(),
          error: (error) => reject(error)
        });
      });

      this.isLogModalOpen.set(false);
      await this.refreshDashboard();
    } catch (error) {
      console.error('Create log error:', error);
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Failed to create log'
      );
    }
  }

  /**
   * Ouvre la modal de création de projet
   */
  openProjectModal(): void {
    this.isProjectModalOpen.set(true);
  }

  /**
   * Ouvre la modal de log de travail
   */
  openLogModal(): void {
    const currentProject = this.activeProject();
    if (!currentProject) {
      this.errorMessage.set('Please create or activate a project first');
      return;
    }
    this.isLogModalOpen.set(true);
  }

  /**
   * Ferme la modal de projet
   */
  closeProjectModal(): void {
    this.isProjectModalOpen.set(false);
  }

  /**
   * Ferme la modal de log
   */
  closeLogModal(): void {
    this.isLogModalOpen.set(false);
  }

  /**
   * Dismiss le message d'erreur
   */
  dismissError(): void {
    this.errorMessage.set(null);
  }

  /**
   * Formate une date en string YYYY-MM-DD
   */
  private formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
```

### dashboard.component.html

```html
<div class="container">
  <!-- Header -->
  <header class="header">
    <h1>Personal Execution OS</h1>
    <p class="subtitle">Track execution, focus, and output</p>
  </header>

  <main class="dashboard">
    <!-- Loading State -->
    <div *ngIf="isLoading()" class="loading">
      <p>Loading dashboard...</p>
    </div>

    <!-- Error State -->
    <div *ngIf="errorMessage()" class="error-banner">
      <p>{{ errorMessage() }}</p>
      <button (click)="dismissError()">Dismiss</button>
    </div>

    <!-- Actions Bar -->
    <app-actions-bar
      [isLoading]="isLoading()"
      (refreshClicked)="refreshDashboard()"
      (logWorkClicked)="openLogModal()"
      (newProjectClicked)="openProjectModal()">
    </app-actions-bar>

    <!-- Active Project -->
    <app-active-project
      [project]="activeProject()">
    </app-active-project>

    <!-- Metrics and Last Activity (side by side on desktop) -->
    <div class="metrics-activity-row">
      <app-metrics [metrics]="metrics()"></app-metrics>
      <app-last-activity [lastLog]="lastLog()"></app-last-activity>
    </div>

    <!-- Projects List -->
    <app-projects-list
      [projects]="allProjects()"
      (activateProjectClicked)="handleActivateProject($event)">
    </app-projects-list>
  </main>
</div>

<!-- Modals -->
<app-project-modal
  [isOpen]="isProjectModalOpen()"
  (closeModal)="closeProjectModal()"
  (submitProject)="handleCreateProject($event)">
</app-project-modal>

<app-log-work-modal
  [isOpen]="isLogModalOpen()"
  [projectId]="activeProject()?.id || null"
  (closeModal)="closeLogModal()"
  (submitLog)="handleCreateLog($event)">
</app-log-work-modal>
```

### dashboard.component.css

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 8px;
  font-weight: 700;
}

.header .subtitle {
  font-size: 1rem;
  opacity: 0.9;
}

.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.loading {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 8px;
  color: #6b7280;
}

.error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-banner p {
  color: #dc2626;
  margin: 0;
  flex: 1;
}

.error-banner button {
  background: none;
  border: none;
  color: #dc2626;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 16px;
}

.error-banner button:hover {
  text-decoration: underline;
}

.metrics-activity-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

/* Responsive */
@media (max-width: 1024px) {
  .metrics-activity-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 2rem;
  }

  .header .subtitle {
    font-size: 0.875rem;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 12px;
  }

  .header {
    padding: 24px 16px;
    margin-bottom: 24px;
  }

  .header h1 {
    font-size: 1.75rem;
  }

  .dashboard {
    gap: 16px;
  }
}
```

## Handoff checklist

- [ ] Composant Dashboard créé et compile sans erreurs
- [ ] Tous les composants enfants intégrés
- [ ] État géré avec signals (ou state management)
- [ ] `refreshDashboard()` charge toutes les données
- [ ] Activation de projet fonctionnelle
- [ ] Création de projet fonctionnelle
- [ ] Création de log fonctionnelle
- [ ] Gestion des erreurs avec affichage
- [ ] Layout responsive correspond au brief
- [ ] Tests unitaires écrits et passent (>80% coverage)
- [ ] Auto-refresh optionnel implémenté
- [ ] Modals s'ouvrent/ferment correctement
