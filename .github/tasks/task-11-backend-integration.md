# Task 11: Configurer le proxy et l'intégration avec le backend ASP.NET

## Overview

Configurer Angular pour communiquer avec le backend ASP.NET Core, mettre en place le proxy de développement, configurer les routes Angular, et intégrer le build Angular dans le pipeline ASP.NET pour le déploiement en production.

## Estimate (days)

1 jour

## Component

Configuration (Angular + ASP.NET Integration)

## Dependencies

- Task 01 (Initialiser le projet Angular) complétée
- Task 10 (Dashboard intégré) complétée
- Backend ASP.NET Core fonctionnel

## API Contract

N/A (configuration uniquement)

## Acceptance criteria

### Configuration Angular

- [ ] Fichier `proxy.conf.json` créé et configuré pour pointer vers le backend
- [ ] `angular.json` configuré avec:
  - `outputPath: "../wwwroot"` (ou chemin approprié vers wwwroot ASP.NET)
  - Proxy configuré dans `serve.options`
- [ ] Routes Angular configurées dans `app.routes.ts`
- [ ] Route par défaut vers Dashboard
- [ ] Route wildcard pour 404 (optionnel)
- [ ] `environment.ts` et `environment.development.ts` correctement configurés
- [ ] Scripts npm pour build et watch définis dans `package.json`

### Configuration Backend ASP.NET

- [ ] `Program.cs` modifié pour servir les fichiers statiques Angular
- [ ] Middleware pour fallback vers `index.html` (SPA routing)
- [ ] Configuration CORS si nécessaire (pour développement)
- [ ] JSON serialization en camelCase configurée
- [ ] `wwwroot` comme OutputPath du build Angular

### Déploiement et Build

- [ ] Script de build pour production
- [ ] Vérification que `dotnet run` sert correctement l'app Angular
- [ ] Documentation dans README.md pour:
  - Démarrer en développement (Angular dev server + ASP.NET)
  - Builder pour production
  - Déployer l'application complète

## Required tests

### Tests manuels (à documenter)

- [ ] Test: `ng serve` démarre Angular avec proxy vers backend
- [ ] Test: API calls fonctionnent depuis Angular vers backend
- [ ] Test: `dotnet run` démarre backend et sert Angular compilé
- [ ] Test: Routes Angular fonctionnent (refresh page ne donne pas 404)
- [ ] Test: Build production (`ng build --configuration production`) réussit
- [ ] Test: Application complète fonctionne en production

## Notes techniques

### Référence backend

- Fichier principal: `Program.cs` (configuration ASP.NET)
- Dossier statique: `wwwroot/` (doit contenir les fichiers Angular compilés)

### Ports par défaut

- Backend ASP.NET: `http://localhost:5000` (ou selon configuration)
- Angular dev server: `http://localhost:4200`

### Structure attendue

```
ProjectRoot/
├── src/app/                      # Angular source
├── wwwroot/                      # Angular compiled output
│   ├── index.html
│   ├── main.js
│   ├── styles.css
│   └── ...
├── Program.cs                    # ASP.NET entry point
├── angular.json
├── proxy.conf.json
└── package.json
```

## Quick examples

### proxy.conf.json

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

### angular.json (extraits importants)

```json
{
  "projects": {
    "personal-execution-os-client": {
      "architect": {
        "build": {
          "options": {
            "outputPath": "wwwroot",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "assets": [
              "src/favicon.ico",
              "src/assets"
            ],
            "styles": [
              "src/styles.css"
            ],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kb",
                  "maximumError": "1mb"
                }
              ],
              "outputHashing": "all"
            },
            "development": {
              "buildOptimizer": false,
              "optimization": false,
              "vendorChunk": true,
              "extractLicenses": false,
              "sourceMap": true,
              "namedChunks": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "options": {
            "proxyConfig": "proxy.conf.json"
          },
          "configurations": {
            "production": {
              "buildTarget": "personal-execution-os-client:build:production"
            },
            "development": {
              "buildTarget": "personal-execution-os-client:build:development"
            }
          },
          "defaultConfiguration": "development"
        }
      }
    }
  }
}
```

### src/environments/environment.development.ts

```typescript
export const environment = {
  production: false,
  apiBaseUrl: '/api' // Via proxy
};
```

### src/environments/environment.ts

```typescript
export const environment = {
  production: true,
  apiBaseUrl: '/api' // Même serveur en production
};
```

### src/app/app.routes.ts

```typescript
import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  // Future routes...
  // {
  //   path: '**',
  //   component: NotFoundComponent
  // }
];
```

### src/main.ts

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
```

### src/app/app.config.ts

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

### Program.cs (backend ASP.NET) - Configuration SPA

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers()
    .AddJsonOptions(options => {
        // Configure camelCase serialization for Angular
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add your repositories, services, DbContext, etc.
// ...

var app = builder.Build();

// Configure middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    
    // Enable CORS for Angular dev server
    app.UseCors(policy => policy
        .WithOrigins("http://localhost:4200")
        .AllowAnyMethod()
        .AllowAnyHeader());
}

app.UseHttpsRedirection();

// Serve static files from wwwroot (Angular app)
app.UseStaticFiles();

// API routes
app.UseRouting();
app.UseAuthorization();
app.MapControllers();

// SPA fallback: serve index.html for any non-API routes
app.MapFallbackToFile("index.html");

app.Run();
```

### package.json (scripts)

```json
{
  "name": "personal-execution-os-client",
  "version": "1.0.0",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "build:prod": "ng build --configuration production",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "test:coverage": "ng test --code-coverage",
    "lint": "ng lint"
  },
  "dependencies": {
    "@angular/animations": "^19.0.0",
    "@angular/common": "^19.0.0",
    "@angular/compiler": "^19.0.0",
    "@angular/core": "^19.0.0",
    "@angular/forms": "^19.0.0",
    "@angular/platform-browser": "^19.0.0",
    "@angular/platform-browser-dynamic": "^19.0.0",
    "@angular/router": "^19.0.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.14.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^19.0.0",
    "@angular/cli": "^19.0.0",
    "@angular/compiler-cli": "^19.0.0",
    "@types/jasmine": "~5.1.0",
    "jasmine-core": "~5.1.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.1.0",
    "typescript": "~5.5.0"
  }
}
```

### README.md (section développement)

```markdown
# Personal Execution OS

## Développement

### Prérequis

- .NET 10 SDK
- Node.js 18+ et npm
- Angular CLI (`npm install -g @angular/cli`)

### Démarrage en développement

**Terminal 1 - Backend ASP.NET:**
```bash
dotnet run
```
Le backend démarre sur `http://localhost:5000`

**Terminal 2 - Frontend Angular:**
```bash
npm install  # Premier lancement uniquement
ng serve
```
L'application est accessible sur `http://localhost:4200`

Le proxy Angular redirige automatiquement `/api/*` vers le backend.

### Build pour production

```bash
# Builder Angular
npm run build:prod

# Démarrer l'application complète
dotnet run
```

L'application complète est accessible sur `http://localhost:5000`

### Tests

```bash
# Tests Angular
npm test

# Tests ASP.NET
dotnet test
```
```

### .gitignore (ajouts pour Angular)

```gitignore
# Angular
node_modules/
dist/
.angular/
npm-debug.log*

# Keep wwwroot for production but ignore Angular build artifacts
wwwroot/**
!wwwroot/index.html
```

## Handoff checklist

- [ ] Proxy configuré et fonctionnel en développement
- [ ] Angular build output va dans wwwroot
- [ ] Backend sert correctement les fichiers statiques Angular
- [ ] SPA fallback configuré (pas de 404 sur refresh)
- [ ] JSON serialization en camelCase configurée
- [ ] Scripts npm pour build et watch définis
- [ ] CORS configuré pour développement
- [ ] Documentation README.md complète
- [ ] Tests manuels effectués (dev + prod)
- [ ] Application complète démarre sans erreurs
- [ ] Routes Angular fonctionnent après refresh
