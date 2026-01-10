# Migration Angular - Plan de Tâches Complet

## 📋 Vue d'ensemble

Ce document décrit le plan complet pour migrer le front-end actuel (HTML/JS/CSS vanilla) vers une application Angular moderne utilisant les syntaxes les plus récentes (standalone components, signals, inject function).

**Objectif:** Créer une application Angular moderne qui reprend toutes les fonctionnalités actuelles du dashboard.

**Durée estimée totale:** 10-12 jours

---

## 🎯 Layout final

```
┌─────────────────────────────────────────────────┐
│             HEADER                               │
│   Personal Execution OS                          │
│   Track execution, focus, and output             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│   ACTIONS BAR (en haut)                          │
│   [↻ Refresh] [+ Log Work] [+ New Project]      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│   ACTIVE PROJECT                                 │
│   Nom | Objectif | Date de début                │
└─────────────────────────────────────────────────┘

┌────────────────────────┬────────────────────────┐
│   THIS WEEK'S METRICS  │   LAST ACTIVITY        │
│   [4 cartes métriques] │   Dernier log          │
└────────────────────────┴────────────────────────┘

┌─────────────────────────────────────────────────┐
│   PROJECTS (liste complète)                     │
│   Tous les projets avec bouton Activate         │
└─────────────────────────────────────────────────┘
```

---

## 📦 Tâches et Ordre d'Exécution

### Phase 1: Configuration et Fondations (2 jours)

#### ✅ Task 01: Initialiser le projet Angular
- **Fichier:** [`task-01-angular-project-setup.md`](./task-01-angular-project-setup.md)
- **Durée:** 0.5 jour
- **Description:** Créer le projet Angular avec architecture standalone, configuration TypeScript stricte, ESLint, Prettier, et proxy pour le backend.
- **Dépendances:** Aucune

#### ✅ Task 02: Créer les modèles TypeScript
- **Fichier:** [`task-02-typescript-models.md`](./task-02-typescript-models.md)
- **Durée:** 0.5 jour
- **Description:** Définir toutes les interfaces TypeScript (Project, DailyLog, Metrics, Request/Response DTOs).
- **Dépendances:** Task 01

#### ✅ Task 03: Créer les services Angular pour l'API
- **Fichier:** [`task-03-angular-services.md`](./task-03-angular-services.md)
- **Durée:** 1.5 jours
- **Description:** Développer ProjectService, DailyLogService, MetricsService avec gestion d'erreurs et tests unitaires.
- **Dépendances:** Task 01, Task 02

---

### Phase 2: Composants de Présentation (3 jours)

#### ✅ Task 04: Créer le composant Actions Bar
- **Fichier:** [`task-04-actions-bar-component.md`](./task-04-actions-bar-component.md)
- **Durée:** 0.5 jour
- **Description:** Bandeau d'actions avec 3 boutons (Refresh, Log Work, New Project).
- **Dépendances:** Task 01, Task 02

#### ✅ Task 05: Créer le composant Active Project
- **Fichier:** [`task-05-active-project-component.md`](./task-05-active-project-component.md)
- **Durée:** 0.5 jour
- **Description:** Affichage du projet actif avec nom, objectif, et date de début.
- **Dépendances:** Task 01, Task 02

#### ✅ Task 06: Créer le composant Metrics
- **Fichier:** [`task-06-metrics-component.md`](./task-06-metrics-component.md)
- **Durée:** 0.75 jour
- **Description:** Grid de 4 cartes métriques (Time, Revenue, Days, Streak).
- **Dépendances:** Task 01, Task 02

#### ✅ Task 07: Créer le composant Last Activity
- **Fichier:** [`task-07-last-activity-component.md`](./task-07-last-activity-component.md)
- **Durée:** 0.5 jour
- **Description:** Affichage de la dernière activité (dernier log).
- **Dépendances:** Task 01, Task 02

#### ✅ Task 08: Créer le composant Projects List
- **Fichier:** [`task-08-projects-list-component.md`](./task-08-projects-list-component.md)
- **Durée:** 1 jour
- **Description:** Liste de tous les projets avec badge ACTIVE et bouton Activate.
- **Dépendances:** Task 01, Task 02

---

### Phase 3: Composants Modaux (1.5 jours)

#### ✅ Task 09: Créer les composants Modal
- **Fichier:** [`task-09-modal-components.md`](./task-09-modal-components.md)
- **Durée:** 1.5 jours
- **Description:** ProjectModal et LogWorkModal avec formulaires réactifs, validation, et gestion d'erreurs.
- **Dépendances:** Task 01, Task 02

---

### Phase 4: Intégration et Configuration (3.25 jours)

#### ✅ Task 10: Intégrer tous les composants dans le Dashboard
- **Fichier:** [`task-10-dashboard-integration.md`](./task-10-dashboard-integration.md)
- **Durée:** 2 jours
- **Description:** Composant Dashboard principal orchestrant tous les composants enfants, gestion d'état avec signals, appels API, et workflows complets.
- **Dépendances:** Task 01 à Task 09

#### ✅ Task 11: Configurer le proxy et l'intégration backend
- **Fichier:** [`task-11-backend-integration.md`](./task-11-backend-integration.md)
- **Durée:** 1 jour
- **Description:** Configuration proxy Angular, intégration avec ASP.NET Core, SPA fallback, scripts de build, documentation.
- **Dépendances:** Task 01, Task 10

#### ✅ Task 12: Configurer le backend pour camelCase
- **Fichier:** [`task-12-configure-camelcase.md`](./task-12-configure-camelcase.md)
- **Durée:** 0.25 jour
- **Description:** Modifier Program.cs pour retourner JSON en camelCase, mettre à jour les tests d'intégration.
- **Dépendances:** Aucune (peut être fait en parallèle)

---

### Phase 5: Tests et Qualité (2 jours)

#### ✅ Task 13: Créer les tests unitaires et d'intégration
- **Fichier:** [`task-13-angular-tests.md`](./task-13-angular-tests.md)
- **Durée:** 2 jours
- **Description:** Tests unitaires complets (services + composants), tests d'intégration, couverture > 80%, CI/CD.
- **Dépendances:** Toutes les tâches précédentes

---

## 📊 Dépendances visuelles

```
Task 01 (Setup)
    ├─> Task 02 (Models)
    │       ├─> Task 03 (Services)
    │       ├─> Task 04 (Actions Bar)
    │       ├─> Task 05 (Active Project)
    │       ├─> Task 06 (Metrics)
    │       ├─> Task 07 (Last Activity)
    │       ├─> Task 08 (Projects List)
    │       └─> Task 09 (Modals)
    │               └─> Task 10 (Dashboard Integration)
    │                       ├─> Task 11 (Backend Integration)
    │                       └─> Task 13 (Tests)
    └─> Task 12 (camelCase) [Peut être fait en parallèle]
```

---

## ✨ Technologies et Syntaxes Modernes Utilisées

### Angular 16+
- ✅ **Standalone Components** (pas de NgModule)
- ✅ **Signals** pour état réactif
- ✅ **inject()** function au lieu de constructor injection
- ✅ **Reactive Forms** avec FormBuilder
- ✅ **HttpClient** avec observables
- ✅ **Angular Router** standalone
- ✅ **Typed Forms**

### TypeScript
- ✅ **Strict mode** activé
- ✅ **Interfaces** pour tous les modèles
- ✅ **Type inference**
- ✅ **Readonly** où approprié
- ✅ **Optional chaining** (?.)
- ✅ **Nullish coalescing** (??)

### Tests
- ✅ **Jasmine** pour tests unitaires
- ✅ **Karma** pour exécution tests
- ✅ **HttpClientTestingModule** pour mocks
- ✅ **Coverage > 80%**

---

## 🎯 Critères de succès

### Fonctionnalités
- [ ] Toutes les fonctionnalités actuelles reprises
- [ ] Layout respecte le brief (ordre des composants)
- [ ] Responsive sur mobile et desktop
- [ ] Gestion d'erreurs avec messages utilisateur

### Qualité du code
- [ ] Architecture standalone moderne
- [ ] Typage TypeScript strict
- [ ] Couverture tests > 80%
- [ ] Aucune erreur ESLint
- [ ] Code formaté avec Prettier

### Performance
- [ ] First Contentful Paint < 2s
- [ ] Bundle size optimisé (< 500KB gzip)
- [ ] Lazy loading si nécessaire

### Intégration
- [ ] Communication fluide avec backend ASP.NET
- [ ] Build production fonctionnel
- [ ] SPA routing sans 404

---

## 🚀 Démarrage

### Développement
```bash
# Terminal 1 - Backend
dotnet run

# Terminal 2 - Frontend
cd client-app
npm install
ng serve
```

### Production
```bash
cd client-app
npm run build:prod
cd ..
dotnet run
```

---

## 📚 Documentation

Chaque tâche contient:
- Vue d'ensemble détaillée
- Estimation de durée
- Dépendances
- Critères d'acceptation
- Tests requis
- Exemples de code complets
- Références au code existant
- Checklist de handoff

---

## 👥 Rôles

- **Planner Agent:** A créé ce plan et toutes les tâches
- **Developer Agent:** Exécutera les tâches une par une, suivant le principe TDD

---

## 📝 Notes importantes

1. **TDD obligatoire:** Écrire les tests avant ou en même temps que le code
2. **Atomic tasks:** Chaque tâche est indépendante et peut être complétée en 0.5-2 jours
3. **Pas de speculation:** Suivre exactement les spécifications de chaque tâche
4. **Clean code:** Respecter les principes SOLID, nommage explicite, fonctions courtes
5. **Documentation:** Chaque composant/service doit avoir JSDoc

---

## ✅ État d'avancement

- [ ] Task 01: Setup projet Angular
- [ ] Task 02: Modèles TypeScript
- [ ] Task 03: Services Angular
- [ ] Task 04: Composant Actions Bar
- [ ] Task 05: Composant Active Project
- [ ] Task 06: Composant Metrics
- [ ] Task 07: Composant Last Activity
- [ ] Task 08: Composant Projects List
- [ ] Task 09: Composants Modal
- [ ] Task 10: Dashboard Integration
- [ ] Task 11: Backend Integration
- [ ] Task 12: Configure camelCase
- [ ] Task 13: Tests Angular

---

**Dernière mise à jour:** 10 janvier 2026
**Créé par:** Planner Agent
