# Task 13: Créer les tests unitaires et d'intégration pour l'application Angular

## Overview

Écrire des tests unitaires complets pour tous les services et composants Angular, et créer des tests d'intégration end-to-end pour valider les workflows utilisateur complets. Assurer une couverture de tests > 80%.

## Estimate (days)

2 jours

## Component

Tests (Unit + Integration)

## Dependencies

- Toutes les tâches précédentes (01-12) doivent être complétées
- Tous les composants et services doivent être implémentés

## API Contract

N/A (tests uniquement)

## Acceptance criteria

### Tests unitaires (Jasmine/Karma)

- [ ] Tous les services testés (ProjectService, DailyLogService, MetricsService)
- [ ] Tous les composants testés (Actions, ActiveProject, Metrics, LastActivity, ProjectsList, Modals, Dashboard)
- [ ] Couverture de code > 80% (vérifier avec `ng test --code-coverage`)
- [ ] Utilisation de `HttpClientTestingModule` pour mocker les appels HTTP
- [ ] Tests des cas de succès ET des cas d'erreur
- [ ] Tests des validations de formulaires
- [ ] Tests des événements @Output
- [ ] Tests des propriétés @Input
- [ ] Tests de la logique conditionnelle (ngIf, affichage/masquage)

### Tests d'intégration (optionnels mais recommandés)

- [ ] Test: Workflow complet création de projet
- [ ] Test: Workflow complet activation de projet
- [ ] Test: Workflow complet log de travail
- [ ] Test: Refresh dashboard charge toutes les données
- [ ] Test: Gestion d'erreur API affiche message

### Configuration

- [ ] Configuration Karma correcte dans `karma.conf.js`
- [ ] Scripts npm pour lancer tests et coverage
- [ ] CI/CD configuration (optionnel - GitHub Actions)

## Required tests

### Services

**project.service.spec.ts** (déjà partiellement fourni dans Task 03)
- [ ] getAllProjects() retourne liste
- [ ] getActiveProject() retourne projet actif
- [ ] getActiveProject() retourne null si 204
- [ ] getProjectById() retourne projet
- [ ] createProject() envoie requête POST avec bon payload
- [ ] activateProject() envoie requête POST
- [ ] deleteProject() envoie requête DELETE
- [ ] Gestion erreur 404
- [ ] Gestion erreur 400 avec message

**daily-log.service.spec.ts**
- [ ] getProjectLogs() retourne logs
- [ ] getLogsByDateRange() génère URL correcte
- [ ] createDailyLog() envoie payload correct
- [ ] Gestion erreur 404 projet inexistant

**metrics.service.spec.ts**
- [ ] getAllMetrics() retourne métriques
- [ ] getTotalTime() retourne nombre
- [ ] Gestion erreur 404

### Composants (déjà partiellement fournis dans tasks précédentes)

**actions-bar.component.spec.ts**
**active-project.component.spec.ts**
**metrics.component.spec.ts**
**last-activity.component.spec.ts**
**projects-list.component.spec.ts**
**project-modal.component.spec.ts**
**log-work-modal.component.spec.ts**

### Dashboard (tests critiques)

**dashboard.component.spec.ts**
- [ ] Initialisation: appelle refreshDashboard()
- [ ] refreshDashboard() appelle tous les services
- [ ] Affiche projet actif quand disponible
- [ ] Affiche "No active project" quand null
- [ ] Ouvre modal projet au clic
- [ ] Ouvre modal log au clic
- [ ] Active projet et refresh dashboard
- [ ] Crée projet et refresh dashboard
- [ ] Crée log et refresh dashboard
- [ ] Affiche erreur si API échoue
- [ ] Ferme modals après soumission réussie

## Notes techniques

### Configuration Karma

```javascript
// karma.conf.js
module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        random: false // Pour reproductibilité
      },
      clearContext: false
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly' }
      ],
      check: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80
        }
      }
    },
    reporters: ['progress', 'kjhtml', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true
  });
};
```

### Scripts package.json

```json
{
  "scripts": {
    "test": "ng test",
    "test:ci": "ng test --watch=false --browsers=ChromeHeadless",
    "test:coverage": "ng test --code-coverage --watch=false --browsers=ChromeHeadless",
    "test:watch": "ng test --code-coverage"
  }
}
```

## Quick examples

### dashboard.component.spec.ts (exemple complet)

```typescript
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { ProjectService } from '../../core/services/project.service';
import { DailyLogService } from '../../core/services/daily-log.service';
import { MetricsService } from '../../core/services/metrics.service';
import { ProjectResponse, MetricsResponse, DailyLogResponse } from '../../models';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let projectService: jasmine.SpyObj<ProjectService>;
  let dailyLogService: jasmine.SpyObj<DailyLogService>;
  let metricsService: jasmine.SpyObj<MetricsService>;

  const mockProject: ProjectResponse = {
    id: '123',
    name: 'Test Project',
    goal: 'Test Goal',
    startDate: '2026-01-06',
    isActive: true,
    createdAt: '2026-01-06T00:00:00Z'
  };

  const mockMetrics: MetricsResponse = {
    projectId: '123',
    totalTimeMinutes: 120,
    totalRevenue: 300,
    revenuePerHour: 150,
    daysWorked: 2,
    currentStreak: 3
  };

  const mockLog: DailyLogResponse = {
    id: 'log-123',
    date: '2026-01-06',
    projectId: '123',
    taskDescription: 'Test task',
    outputDescription: 'Test output',
    timeSpentMinutes: 60,
    revenueGenerated: 100,
    note: null,
    createdAt: '2026-01-06T00:00:00Z'
  };

  beforeEach(async () => {
    const projectServiceSpy = jasmine.createSpyObj('ProjectService', [
      'getActiveProject',
      'getAllProjects',
      'createProject',
      'activateProject'
    ]);
    const dailyLogServiceSpy = jasmine.createSpyObj('DailyLogService', [
      'getLogsByDateRange',
      'createDailyLog'
    ]);
    const metricsServiceSpy = jasmine.createSpyObj('MetricsService', [
      'getAllMetrics'
    ]);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: DailyLogService, useValue: dailyLogServiceSpy },
        { provide: MetricsService, useValue: metricsServiceSpy }
      ]
    }).compileComponents();

    projectService = TestBed.inject(ProjectService) as jasmine.SpyObj<ProjectService>;
    dailyLogService = TestBed.inject(DailyLogService) as jasmine.SpyObj<DailyLogService>;
    metricsService = TestBed.inject(MetricsService) as jasmine.SpyObj<MetricsService>;

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call refreshDashboard on init', fakeAsync(() => {
    // Arrange
    projectService.getActiveProject.and.returnValue(of(mockProject));
    projectService.getAllProjects.and.returnValue(of([mockProject]));
    metricsService.getAllMetrics.and.returnValue(of(mockMetrics));
    dailyLogService.getLogsByDateRange.and.returnValue(of([mockLog]));

    // Act
    fixture.detectChanges(); // triggers ngOnInit
    tick();

    // Assert
    expect(projectService.getActiveProject).toHaveBeenCalled();
    expect(projectService.getAllProjects).toHaveBeenCalled();
  }));

  it('should load and display active project', fakeAsync(() => {
    // Arrange
    projectService.getActiveProject.and.returnValue(of(mockProject));
    projectService.getAllProjects.and.returnValue(of([mockProject]));
    metricsService.getAllMetrics.and.returnValue(of(mockMetrics));
    dailyLogService.getLogsByDateRange.and.returnValue(of([mockLog]));

    // Act
    component.refreshDashboard();
    tick();
    fixture.detectChanges();

    // Assert
    expect(component.activeProject()).toEqual(mockProject);
  }));

  it('should display "No active project" when project is null', fakeAsync(() => {
    // Arrange
    projectService.getActiveProject.and.returnValue(of(null));
    projectService.getAllProjects.and.returnValue(of([]));

    // Act
    component.refreshDashboard();
    tick();
    fixture.detectChanges();

    // Assert
    expect(component.activeProject()).toBeNull();
    expect(component.metrics()).toBeNull();
  }));

  it('should open project modal when openProjectModal is called', () => {
    // Act
    component.openProjectModal();

    // Assert
    expect(component.isProjectModalOpen()).toBe(true);
  });

  it('should open log modal when openLogModal is called and project exists', fakeAsync(() => {
    // Arrange
    projectService.getActiveProject.and.returnValue(of(mockProject));
    projectService.getAllProjects.and.returnValue(of([mockProject]));
    metricsService.getAllMetrics.and.returnValue(of(mockMetrics));
    dailyLogService.getLogsByDateRange.and.returnValue(of([mockLog]));

    component.refreshDashboard();
    tick();

    // Act
    component.openLogModal();

    // Assert
    expect(component.isLogModalOpen()).toBe(true);
  }));

  it('should show error message when openLogModal is called without active project', () => {
    // Arrange
    component.activeProject.set(null);

    // Act
    component.openLogModal();

    // Assert
    expect(component.isLogModalOpen()).toBe(false);
    expect(component.errorMessage()).toContain('create or activate a project');
  });

  it('should activate project and refresh dashboard', fakeAsync(() => {
    // Arrange
    projectService.activateProject.and.returnValue(of(undefined));
    projectService.getActiveProject.and.returnValue(of(mockProject));
    projectService.getAllProjects.and.returnValue(of([mockProject]));
    metricsService.getAllMetrics.and.returnValue(of(mockMetrics));
    dailyLogService.getLogsByDateRange.and.returnValue(of([mockLog]));

    // Act
    component.handleActivateProject('123');
    tick();

    // Assert
    expect(projectService.activateProject).toHaveBeenCalledWith('123');
    expect(projectService.getActiveProject).toHaveBeenCalled();
  }));

  it('should create project, close modal, and refresh dashboard', fakeAsync(() => {
    // Arrange
    const createRequest = {
      name: 'New Project',
      goal: 'New Goal',
      startDate: '2026-01-10',
      isActive: true
    };

    projectService.createProject.and.returnValue(of(mockProject));
    projectService.getActiveProject.and.returnValue(of(mockProject));
    projectService.getAllProjects.and.returnValue(of([mockProject]));
    metricsService.getAllMetrics.and.returnValue(of(mockMetrics));
    dailyLogService.getLogsByDateRange.and.returnValue(of([mockLog]));

    component.isProjectModalOpen.set(true);

    // Act
    component.handleCreateProject(createRequest);
    tick();

    // Assert
    expect(projectService.createProject).toHaveBeenCalledWith(createRequest);
    expect(component.isProjectModalOpen()).toBe(false);
    expect(projectService.getActiveProject).toHaveBeenCalled();
  }));

  it('should display error message when API call fails', fakeAsync(() => {
    // Arrange
    projectService.getActiveProject.and.returnValue(
      throwError(() => new Error('API Error'))
    );

    // Act
    component.refreshDashboard();
    tick();

    // Assert
    expect(component.errorMessage()).toContain('API Error');
  }));

  it('should dismiss error message', () => {
    // Arrange
    component.errorMessage.set('Test error');

    // Act
    component.dismissError();

    // Assert
    expect(component.errorMessage()).toBeNull();
  });
});
```

### CI/CD - GitHub Actions (optionnel)

```yaml
# .github/workflows/angular-tests.yml
name: Angular Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests with coverage
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
        flags: angular
        name: angular-coverage
```

## Handoff checklist

- [ ] Tous les services ont des tests unitaires (>80% coverage)
- [ ] Tous les composants ont des tests unitaires (>80% coverage)
- [ ] Dashboard component testé avec tous ses workflows
- [ ] Tests passent sans erreurs (`ng test --watch=false`)
- [ ] Coverage globale > 80% (`ng test --code-coverage`)
- [ ] Tests reproductibles (pas de flakiness)
- [ ] Mocks et spies correctement utilisés
- [ ] Tests des cas d'erreur implémentés
- [ ] Tests de validation de formulaires OK
- [ ] Documentation des tests complexes
- [ ] CI/CD configuré (optionnel)
