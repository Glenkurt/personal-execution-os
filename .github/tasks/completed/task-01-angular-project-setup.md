# Task 01: Initialiser le projet Angular moderne

## Overview

Créer un nouveau projet Angular standalone utilisant les syntaxes modernes (standalone components, signals, inject) pour remplacer le front-end vanilla HTML/JS/CSS actuel.

## Estimate (days)

0.5 jour

## Component

Angular Project Setup / Configuration

## Dependencies

- Aucune dépendance

## API Contract

N/A (tâche de configuration)

## Acceptance criteria

- [ ] Projet Angular créé avec la version la plus récente (v19+)
- [ ] Configuration standalone (pas de NgModule)
- [ ] Structure de dossiers suivant les best practices Angular:
  - `src/app/core/` pour services, guards, interceptors
  - `src/app/shared/` pour composants, pipes, directives réutilisables
  - `src/app/features/` pour les features modules
  - `src/app/models/` pour les interfaces TypeScript
- [ ] Configuration TypeScript stricte activée
- [ ] ESLint et Prettier configurés
- [ ] Configuration du proxy pour le backend ASP.NET (port 5000 ou selon configuration)
- [ ] Fichier `angular.json` configuré avec:
  - outputPath: `wwwroot` (pour intégration avec ASP.NET)
  - styles globaux importés
- [ ] Script npm pour build et watch
- [ ] `README.md` avec instructions de démarrage

## Required tests

Aucun test nécessaire pour cette tâche de configuration.

## Notes techniques

### Commande de création

```bash
# Installer Angular CLI si nécessaire
npm install -g @angular/cli@latest

# Créer le projet dans un sous-dossier temporaire
ng new personal-execution-os-client --standalone --routing --style=css --skip-git

# Configuration à choisir pendant la création:
# - Standalone: Yes
# - Routing: Yes
# - Stylesheet: CSS
```

### Structure de dossiers attendue

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   ├── interceptors/
│   │   └── guards/
│   ├── shared/
│   │   ├── components/
│   │   ├── directives/
│   │   └── pipes/
│   ├── features/
│   │   └── dashboard/
│   │       ├── components/
│   │       └── dashboard.component.ts
│   ├── models/
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── assets/
├── environments/
└── styles.css
```

### Configuration du proxy (proxy.conf.json)

```json
{
  "/api": {
    "target": "http://localhost:5000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

### Configuration angular.json (extraits importants)

```json
{
  "projects": {
    "personal-execution-os-client": {
      "architect": {
        "build": {
          "options": {
            "outputPath": "wwwroot"
          }
        },
        "serve": {
          "options": {
            "proxyConfig": "proxy.conf.json"
          }
        }
      }
    }
  }
}
```

### Configuration TypeScript stricte (tsconfig.json)

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

## Quick examples

### Structure app.config.ts moderne

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient()
  ]
};
```

## Handoff checklist

- [ ] Projet Angular créé et démarre sans erreurs (`ng serve`)
- [ ] Configuration proxy fonctionnelle
- [ ] Structure de dossiers créée
- [ ] ESLint et Prettier fonctionnent
- [ ] Documentation du projet dans README.md
