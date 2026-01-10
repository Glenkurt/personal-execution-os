# Task 02: Créer les modèles TypeScript (DTOs et Interfaces)

## Overview

Définir toutes les interfaces TypeScript qui correspondent aux DTOs et modèles du backend ASP.NET Core pour assurer un typage fort et éviter les erreurs de données.

## Estimate (days)

0.5 jour

## Component

Models / Interfaces

## Dependencies

- Task 01 (Initialiser le projet Angular) doit être complétée

## API Contract

N/A (définition des types uniquement)

## Acceptance criteria

- [ ] Interface `Project` créée dans `src/app/models/project.model.ts`
- [ ] Interface `DailyLog` créée dans `src/app/models/daily-log.model.ts`
- [ ] Interface `Metrics` créée dans `src/app/models/metrics.model.ts`
- [ ] Interfaces de requêtes créées:
  - `CreateProjectRequest` dans `src/app/models/create-project-request.model.ts`
  - `CreateDailyLogRequest` dans `src/app/models/create-daily-log-request.model.ts`
- [ ] Interfaces de réponses créées:
  - `ProjectResponse` dans `src/app/models/project-response.model.ts`
  - `DailyLogResponse` dans `src/app/models/daily-log-response.model.ts`
  - `MetricsResponse` dans `src/app/models/metrics-response.model.ts`
- [ ] Interface générique `ServiceResult<T>` créée dans `src/app/models/service-result.model.ts`
- [ ] Interface `ApiErrorResponse` créée dans `src/app/models/api-error-response.model.ts`
- [ ] Fichier `index.ts` pour exports centralisés dans `src/app/models/`
- [ ] Tous les champs correspondent exactement aux DTOs du backend (en camelCase)

## Required tests

Aucun test unitaire nécessaire pour les interfaces TypeScript pures. Validation par le compilateur TypeScript suffisante.

## Notes techniques

### Références backend

Les interfaces doivent correspondre aux DTOs et modèles du backend:

**Backend DTOs (références):**
- `src/Core/DTOs/CreateProjectRequest.cs`
- `src/Core/DTOs/CreateDailyLogRequest.cs`
- `src/Core/DTOs/ProjectResponse.cs`
- `src/Core/DTOs/DailyLogResponse.cs`
- `src/Core/Models/Project.cs`
- `src/Core/Models/DailyLog.cs`

**Backend Controllers (pour voir les réponses):**
- `src/API/Controllers/ProjectsController.cs`
- `src/API/Controllers/DailyLogsController.cs`
- `src/API/Controllers/MetricsController.cs`

### Convention de nommage

- Backend C# utilise PascalCase: `ProjectId`, `StartDate`, `IsActive`
- Frontend TypeScript utilise camelCase: `projectId`, `startDate`, `isActive`
- Les réponses API du backend retournent en PascalCase (JSON serialization par défaut .NET)
- Angular doit gérer les deux conventions (voir normalizers)

## Quick examples

### project.model.ts

```typescript
export interface Project {
  id: string; // Guid en backend
  name: string;
  goal: string | null;
  startDate: string; // DateOnly serialized as string "YYYY-MM-DD"
  isActive: boolean;
  createdAt?: string; // DateTime serialized as ISO string
}
```

### create-project-request.model.ts

```typescript
export interface CreateProjectRequest {
  name: string;
  goal?: string | null;
  startDate: string; // Format: "YYYY-MM-DD"
  isActive: boolean;
}
```

### project-response.model.ts

```typescript
export interface ProjectResponse {
  id: string;
  name: string;
  goal: string | null;
  startDate: string;
  isActive: boolean;
  createdAt: string;
}
```

### daily-log.model.ts

```typescript
export interface DailyLog {
  id: string;
  date: string; // DateOnly serialized as "YYYY-MM-DD"
  projectId: string;
  taskDescription: string;
  outputDescription: string;
  timeSpentMinutes: number;
  revenueGenerated: number;
  note: string | null;
  createdAt?: string;
}
```

### create-daily-log-request.model.ts

```typescript
export interface CreateDailyLogRequest {
  date: string; // Format: "YYYY-MM-DD"
  projectId: string;
  taskDescription: string;
  outputDescription: string;
  timeSpentMinutes: number;
  revenueGenerated: number;
  note?: string | null;
}
```

### daily-log-response.model.ts

```typescript
export interface DailyLogResponse {
  id: string;
  date: string;
  projectId: string;
  taskDescription: string;
  outputDescription: string;
  timeSpentMinutes: number;
  revenueGenerated: number;
  note: string | null;
  createdAt: string;
}
```

### metrics-response.model.ts

```typescript
export interface MetricsResponse {
  projectId: string;
  totalTimeMinutes: number;
  totalRevenue: number;
  revenuePerHour: number;
  daysWorked: number;
  currentStreak: number;
}
```

### service-result.model.ts

```typescript
export interface ServiceResult<T> {
  isSuccess: boolean;
  value?: T;
  error?: string;
}
```

### api-error-response.model.ts

```typescript
export interface ApiErrorResponse {
  error: string;
}
```

### index.ts (barrel export)

```typescript
export * from './project.model';
export * from './project-response.model';
export * from './create-project-request.model';
export * from './daily-log.model';
export * from './daily-log-response.model';
export * from './create-daily-log-request.model';
export * from './metrics-response.model';
export * from './service-result.model';
export * from './api-error-response.model';
```

## Handoff checklist

- [ ] Tous les fichiers modèles créés dans `src/app/models/`
- [ ] Correspondance exacte avec les DTOs backend
- [ ] Barrel export (`index.ts`) fonctionnel
- [ ] Aucune erreur de compilation TypeScript
- [ ] Documentation inline (JSDoc) pour champs complexes si nécessaire
