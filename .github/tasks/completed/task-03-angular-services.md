# Task 03: Créer les services Angular pour l'API

## Overview

Développer les services Angular qui communiquent avec le backend ASP.NET Core en utilisant HttpClient. Les services doivent gérer les appels API, la normalisation des données (PascalCase/camelCase), et la gestion des erreurs.

## Estimate (days)

1.5 jours

## Component

Services (Angular Core)

## Dependencies

- Task 01 (Initialiser le projet Angular) complétée
- Task 02 (Créer les modèles TypeScript) complétée

## API Contract

### Endpoints à intégrer

**Projects API** (`/api/projects`)
- `GET /api/projects` → Liste tous les projets
- `GET /api/projects/{id}` → Récupère un projet par ID
- `GET /api/projects/active/current` → Récupère le projet actif actuel
- `POST /api/projects` → Crée un nouveau projet
- `POST /api/projects/{id}/activate` → Active un projet
- `PUT /api/projects/{id}` → Met à jour un projet
- `DELETE /api/projects/{id}` → Supprime un projet

**DailyLogs API** (`/api/dailylogs`)
- `GET /api/dailylogs/project/{projectId}` → Récupère tous les logs d'un projet
- `GET /api/dailylogs/project/{projectId}/range?startDate={start}&endDate={end}` → Logs par période
- `POST /api/dailylogs` → Crée un nouveau log
- `PUT /api/dailylogs/{id}` → Met à jour un log
- `DELETE /api/dailylogs/{id}` → Supprime un log

**Metrics API** (`/api/metrics`)
- `GET /api/metrics/{projectId}` → Récupère toutes les métriques d'un projet
- `GET /api/metrics/{projectId}/time` → Temps total
- `GET /api/metrics/{projectId}/revenue` → Revenu total
- `GET /api/metrics/{projectId}/streak` → Streak de travail

## Acceptance criteria

- [ ] Service `ProjectService` créé dans `src/app/core/services/project.service.ts`
- [ ] Service `DailyLogService` créé dans `src/app/core/services/daily-log.service.ts`
- [ ] Service `MetricsService` créé dans `src/app/core/services/metrics.service.ts`
- [ ] Toutes les méthodes retournent des `Observable<T>`
- [ ] Gestion d'erreur avec `catchError` et transformation en messages utilisateur
- [ ] Normalisation des données PascalCase → camelCase
- [ ] Configuration de base URL via `environment.ts`
- [ ] Utilisation de `inject()` function (pas de constructor injection)
- [ ] Documentation JSDoc pour chaque méthode publique
- [ ] Typage strict avec interfaces créées dans Task 02
- [ ] Fichier `index.ts` pour exports dans `src/app/core/services/`

## Required tests

### Unit tests (obligatoires)

**project.service.spec.ts:**
- [ ] Test: `getAllProjects()` retourne liste de projets
- [ ] Test: `getActiveProject()` retourne projet actif ou null
- [ ] Test: `createProject()` envoie requête correcte et retourne projet créé
- [ ] Test: `activateProject()` appelle bon endpoint
- [ ] Test: gestion erreur 404 sur `getProjectById()`
- [ ] Test: gestion erreur 400 sur `createProject()` avec données invalides

**daily-log.service.spec.ts:**
- [ ] Test: `getProjectLogs()` retourne logs filtrés par projet
- [ ] Test: `getLogsByDateRange()` génère URL avec query params corrects
- [ ] Test: `createDailyLog()` envoie payload correct
- [ ] Test: gestion erreur 404 si projet inexistant

**metrics.service.spec.ts:**
- [ ] Test: `getAllMetrics()` retourne métriques complètes
- [ ] Test: `getTotalTime()` retourne temps en minutes
- [ ] Test: `getCurrentStreak()` retourne streak correct

## Notes techniques

### Références backend pour les endpoints

- Controllers: `src/API/Controllers/ProjectsController.cs`, `DailyLogsController.cs`, `MetricsController.cs`
- Vérifier les codes de réponse HTTP dans les attributs `[ProducesResponseType]`
- Format des dates: backend utilise `DateOnly` qui se serialize en `"YYYY-MM-DD"`

### Gestion PascalCase/camelCase

Le backend .NET renvoie par défaut en PascalCase. Options:

**Option 1: Configurer le backend** (recommandé)
Modifier `Program.cs` pour retourner camelCase:

```csharp
builder.Services.AddControllers()
    .AddJsonOptions(options => {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });
```

**Option 2: Normaliser côté Angular** (si backend pas modifiable)
Créer des helper functions pour convertir les clés.

### Configuration environment

```typescript
// src/environments/environment.development.ts
export const environment = {
  production: false,
  apiBaseUrl: '/api' // Via proxy
};

// src/environments/environment.ts
export const environment = {
  production: true,
  apiBaseUrl: '/api'
};
```

## Quick examples

### project.service.ts (structure complète)

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  Project,
  ProjectResponse,
  CreateProjectRequest
} from '../../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/projects`;

  /**
   * Récupère tous les projets
   */
  getAllProjects(): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(this.baseUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Récupère le projet actif actuel
   * Retourne null si aucun projet actif (204 No Content)
   */
  getActiveProject(): Observable<ProjectResponse | null> {
    return this.http.get<ProjectResponse>(`${this.baseUrl}/active/current`, {
      observe: 'response'
    }).pipe(
      map(response => {
        if (response.status === 204) {
          return null;
        }
        return response.body;
      }),
      catchError(error => {
        if (error.status === 204) {
          return [null];
        }
        return this.handleError(error);
      })
    );
  }

  /**
   * Récupère un projet par son ID
   */
  getProjectById(id: string): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Crée un nouveau projet
   */
  createProject(request: CreateProjectRequest): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(this.baseUrl, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Active un projet (désactive tous les autres)
   */
  activateProject(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/activate`, null)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Supprime un projet
   */
  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Gestion centralisée des erreurs HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      if (error.error?.error) {
        errorMessage = error.error.error;
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.message}`;
      }
    }

    console.error('HTTP Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
```

### daily-log.service.ts (structure complète)

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  DailyLogResponse,
  CreateDailyLogRequest
} from '../../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DailyLogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/dailylogs`;

  /**
   * Récupère tous les logs d'un projet
   */
  getProjectLogs(projectId: string): Observable<DailyLogResponse[]> {
    return this.http.get<DailyLogResponse[]>(
      `${this.baseUrl}/project/${projectId}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère les logs par période
   * @param projectId ID du projet
   * @param startDate Format: "YYYY-MM-DD"
   * @param endDate Format: "YYYY-MM-DD"
   */
  getLogsByDateRange(
    projectId: string,
    startDate: string,
    endDate: string
  ): Observable<DailyLogResponse[]> {
    const url = `${this.baseUrl}/project/${projectId}/range?startDate=${startDate}&endDate=${endDate}`;
    return this.http.get<DailyLogResponse[]>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Crée un nouveau log
   */
  createDailyLog(request: CreateDailyLogRequest): Observable<DailyLogResponse> {
    return this.http.post<DailyLogResponse>(this.baseUrl, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    // ... même logique que ProjectService
  }
}
```

### metrics.service.ts (structure complète)

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MetricsResponse } from '../../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/metrics`;

  /**
   * Récupère toutes les métriques d'un projet
   */
  getAllMetrics(projectId: string): Observable<MetricsResponse> {
    return this.http.get<MetricsResponse>(`${this.baseUrl}/${projectId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Récupère le temps total passé (minutes)
   */
  getTotalTime(projectId: string): Observable<number> {
    return this.http.get<{ value: number }>(`${this.baseUrl}/${projectId}/time`)
      .pipe(
        map(response => response.value),
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    // ... même logique
  }
}
```

### Tests example (project.service.spec.ts)

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjectService } from './project.service';
import { ProjectResponse } from '../../models';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectService]
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should retrieve all projects', () => {
    const mockProjects: ProjectResponse[] = [
      {
        id: '123',
        name: 'Test Project',
        goal: 'Test Goal',
        startDate: '2026-01-01',
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z'
      }
    ];

    service.getAllProjects().subscribe(projects => {
      expect(projects.length).toBe(1);
      expect(projects[0].name).toBe('Test Project');
    });

    const req = httpMock.expectOne('/api/projects');
    expect(req.request.method).toBe('GET');
    req.flush(mockProjects);
  });

  it('should handle 404 error when project not found', () => {
    const projectId = 'non-existent-id';

    service.getProjectById(projectId).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.message).toContain('Server Error: 404');
      }
    });

    const req = httpMock.expectOne(`/api/projects/${projectId}`);
    req.flush({ error: 'Project not found' }, { status: 404, statusText: 'Not Found' });
  });
});
```

## Handoff checklist

- [ ] Les 3 services créés et compilent sans erreurs
- [ ] Tous les endpoints du backend sont couverts
- [ ] Gestion d'erreurs implémentée
- [ ] Tests unitaires écrits et passent (coverage > 80%)
- [ ] Documentation JSDoc complète
- [ ] Barrel export (`index.ts`) fonctionnel
