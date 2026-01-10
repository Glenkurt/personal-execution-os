# Personal Execution OS - Angular Client

> Modern Angular 17+ frontend for the Personal Execution OS application with standalone components, strict TypeScript, and reactive architecture.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Development](#development)
- [Build](#build)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Code Quality](#code-quality)
- [Configuration](#configuration)
- [API Integration](#api-integration)
- [Contributing](#contributing)

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.x or 20.x
- **npm**: 9.x or 10.x
- **ASP.NET Backend**: Running on `http://localhost:5000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The application will open at http://localhost:4200
```

## 🔧 Development

### Start Development Server

```bash
# With auto-open browser
npm run dev

# Without auto-open
npm start
```

The development server includes:
- **Hot Module Replacement (HMR)**: Automatic reloading on file changes
- **Proxy Configuration**: API calls to `/api/*` are proxied to `http://localhost:5000`
- **Source Maps**: Full TypeScript source maps for debugging

### Watch Mode (Continuous Build)

```bash
npm run watch
```

This rebuilds the application whenever source files change, useful for incremental development.

## 🏗️ Build

### Production Build

```bash
# Build for production
npm run build:prod

# Output: ../wwwroot/ (served by ASP.NET Core)
```

### Development Build

```bash
npm run build
```

### Output Directory

The Angular application is built to `../wwwroot/` for seamless ASP.NET Core integration:
- Angular CLI builds to `../wwwroot/`
- ASP.NET Core serves static files from `wwwroot/`
- No additional configuration needed

## 🧪 Testing

### Run Unit Tests (Watch Mode)

```bash
npm test
```

### Run Tests Once (CI Mode)

```bash
npm run test:ci
```

### Generate Coverage Report

```bash
npm run test:coverage
```

Coverage reports are generated in `coverage/` directory.

### Test Files Location

Test files are colocated with components:
- `dashboard.component.spec.ts` - Component tests
- `dashboard.service.spec.ts` - Service tests

## 📁 Project Structure

```
src/app/
├── core/
│   ├── services/
│   │   ├── project.service.ts
│   │   ├── daily-log.service.ts
│   │   └── metrics.service.ts
│   ├── interceptors/
│   │   └── api.interceptor.ts
│   └── guards/
│       └── /* Route guards */
│
├── shared/
│   ├── components/
│   │   ├── action-bar/
│   │   ├── active-project-card/
│   │   ├── metrics-grid/
│   │   ├── projects-list/
│   │   ├── last-activity/
│   │   └── modals/
│   ├── directives/
│   │   └── /* Custom directives */
│   └── pipes/
│       └── /* Custom pipes */
│
├── features/
│   └── dashboard/
│       ├── dashboard.component.ts
│       ├── dashboard.component.html
│       ├── dashboard.component.css
│       └── dashboard.component.spec.ts
│
├── models/
│   ├── project.model.ts
│   ├── daily-log.model.ts
│   ├── metrics.model.ts
│   ├── api-response.model.ts
│   └── index.ts
│
├── environments/
│   ├── environment.ts
│   ├── environment.development.ts
│   └── environment.production.ts
│
├── app.component.ts
├── app.config.ts
├── app.routes.ts
└── main.ts

tests/
├── unit/
├── integration/
└── fixtures/
```

## 🏛️ Architecture

### Design Patterns

**Standalone Components**
- No NgModule required
- Better code organization and tree-shaking
- Improved build performance

**Signals & Reactive Streams**
- RxJS Observables for async operations
- Angular Signals for fine-grained reactivity
- Explicit dependency management

**Service Layer**
- Centralized API communication
- Business logic separation
- Dependency injection

**Feature-Based Organization**
- Dashboard feature encapsulates all dashboard-related code
- Shared components for reusable UI elements
- Core services for cross-cutting concerns

### API Integration

The application communicates with the ASP.NET Core backend at:
- **Development**: `http://localhost:5000` (via proxy)
- **Production**: Same origin (no proxy needed)

#### Base URLs

| Environment | API Base |
|---|---|
| Development | `/api` (proxied to `http://localhost:5000/api`) |
| Production | `/api` |

#### Example API Calls

```typescript
// ProjectService makes requests to:
GET    /api/projects
POST   /api/projects
PUT    /api/projects/{id}
DELETE /api/projects/{id}
POST   /api/projects/{id}/activate

// DailyLogService makes requests to:
GET    /api/dailylogs
POST   /api/dailylogs
PUT    /api/dailylogs/{id}
GET    /api/dailylogs/project/{projectId}/range?startDate=...&endDate=...

// MetricsService makes requests to:
GET    /api/metrics/{projectId}
```

## 🎯 Code Quality

### Linting

Check TypeScript code for errors and style issues:

```bash
npm run lint
```

Configuration: `.eslintrc.json`

Enforced rules:
- No `any` types
- Explicit function return types
- const correctness
- No unused variables

### Code Formatting

Automatically format code with Prettier:

```bash
npm run format
```

Configuration: `.prettierrc`

Standards:
- Single quotes
- 100 character line length
- 2-space indentation
- Trailing commas

### TypeScript Strict Mode

The project enforces strict TypeScript configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## ⚙️ Configuration

### Environment Variables

Environment-specific configuration is in `src/environments/`:

```typescript
// environment.ts (development)
export const environment = {
  production: false,
  apiBaseUrl: '/api'
};

// environment.production.ts (production)
export const environment = {
  production: true,
  apiBaseUrl: '/api'
};
```

### Development Proxy

API requests are proxied in development via `proxy.conf.json`:

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

### Angular Configuration

Main Angular configuration: `angular.json`

Key settings:
- **outputPath**: `../wwwroot` (ASP.NET Core static files)
- **sourceMap**: `true` (for debugging)
- **proxy**: `proxy.conf.json` (for development)

## 📦 Dependencies

### Core

- **@angular/core**: ^17.0.0 - Angular framework
- **@angular/common**: ^17.0.0 - Common utilities
- **@angular/forms**: ^17.0.0 - Reactive forms
- **@angular/router**: ^17.0.0 - Routing
- **rxjs**: ^7.8.0 - Reactive extensions
- **zone.js**: ^0.14.0 - Angular zone management

### Development

- **typescript**: ^5.2.2 - TypeScript compiler
- **@angular-eslint/***: ^17.0.0 - Linting
- **eslint**: ^8.0.0 - JavaScript linting
- **prettier**: ^3.0.0 - Code formatting
- **karma/jasmine**: ^5.1.0 - Testing framework

## 🔄 Development Workflow

### 1. Start Backend

```bash
# In parent directory
dotnet run --project PersonalExecutionOS.csproj
# Runs on http://localhost:5000
```

### 2. Start Frontend

```bash
# In angular-app directory
npm run dev
# Opens http://localhost:4200
```

### 3. Make Changes

- Edit components, services, or styles
- Changes hot-reload automatically
- No manual page refresh needed

### 4. Run Tests

```bash
npm test
```

### 5. Build for Production

```bash
npm run build:prod
# Output in ../wwwroot/
# Ready for ASP.NET Core to serve
```

## 🚢 Deployment

### Production Build

```bash
npm run build:prod
```

Output is placed in `../wwwroot/`, which is served by the ASP.NET Core application.

### Docker (if applicable)

The `Dockerfile` in the parent directory handles both backend and frontend builds:

```dockerfile
# Frontend build stage
RUN npm run build:prod

# Backend serves from wwwroot/
```

## 🐛 Troubleshooting

### Proxy Issues

If API calls fail:

1. Verify backend is running on `http://localhost:5000`
2. Check `proxy.conf.json` is configured correctly
3. Restart dev server: `npm start`
4. Check browser DevTools Network tab for actual request URL

### Port Already in Use

If port 4200 is already in use:

```bash
ng serve --port 4300
```

### Missing Dependencies

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

Ensure strict mode compliance:

```bash
npm run lint
```

## 🤝 Contributing

### Code Standards

1. Follow ESLint rules: `npm run lint`
2. Format code with Prettier: `npm run format`
3. Write tests for new features
4. Use meaningful commit messages

### Before Committing

```bash
# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm run test:ci

# Build
npm run build
```

## 📚 Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS Guide](https://rxjs.dev/guide/overview)
- [Angular CLI Commands](https://angular.io/cli)

## 📝 License

Same as parent project.

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
