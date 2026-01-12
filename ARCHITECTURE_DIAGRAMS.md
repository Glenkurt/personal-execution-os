# Architecture Diagrams - Personal Execution OS

**Purpose:** Visual representation of system architecture and data flow  
**Date:** January 11, 2026

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PERSONAL EXECUTION OS                           │
│                          Architecture Diagram                           │
└─────────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────────────────┐
                    │      Client Web Browser           │
                    │  (Angular 17 Application)        │
                    │                                   │
                    │ ┌────────────────────────────┐    │
                    │ │   UI Components            │    │
                    │ │ - Dashboard                │    │
                    │ │ - Forms                    │    │
                    │ │ - Modals                   │    │
                    │ └────────────────────────────┘    │
                    │            ↕                      │
                    │ ┌────────────────────────────┐    │
                    │ │   HTTP Client               │    │
                    │ │   with Interceptors        │    │
                    │ └────────────────────────────┘    │
                    └──────────────────────────────────┘
                                 ↕
                         (HTTP Requests/Responses)
                         (Port: 4200 dev, 80 prod)
                                 ↓

    ┌──────────────────────────────────────────────────────────┐
    │  Proxy Layer (Development Only)                          │
    │  /api → http://localhost:5000/api                        │
    │  Defined in: proxy.conf.json                             │
    └──────────────────────────────────────────────────────────┘
                                 ↓

    ┌──────────────────────────────────────────────────────────┐
    │         ASP.NET Core 10 REST API                         │
    │         (Port: 5000/HTTP or 7242/HTTPS)                 │
    │                                                           │
    │  ┌────────────────────────────────────────────────────┐  │
    │  │  Controllers (6 endpoints each)                    │  │
    │  │  ├─ ProjectsController                             │  │
    │  │  │  - GET /api/projects                            │  │
    │  │  │  - POST /api/projects                           │  │
    │  │  │  - GET /api/projects/{id}                       │  │
    │  │  │  - PUT /api/projects/{id}                       │  │
    │  │  │  - DELETE /api/projects/{id}                    │  │
    │  │  │  - POST /api/projects/{id}/activate             │  │
    │  │  │                                                  │  │
    │  │  ├─ DailyLogsController                            │  │
    │  │  │  - GET /api/dailylogs                           │  │
    │  │  │  - POST /api/dailylogs                          │  │
    │  │  │  - GET /api/dailylogs/{id}                      │  │
    │  │  │  - PUT /api/dailylogs/{id}                      │  │
    │  │  │  - DELETE /api/dailylogs/{id}                   │  │
    │  │  │  - GET /api/dailylogs/project/{id}              │  │
    │  │  │  - GET /api/dailylogs/project/{id}/range        │  │
    │  │  │                                                  │  │
    │  │  └─ MetricsController                              │  │
    │  │     - GET /api/metrics/{projectId}                 │  │
    │  │     - GET /api/metrics/dashboard/summary           │  │
    │  └────────────────────────────────────────────────────┘  │
    │                        ↕                                  │
    │  ┌────────────────────────────────────────────────────┐  │
    │  │  Business Logic Layer (Services)                   │  │
    │  │  ├─ ProjectService                                 │  │
    │  │  ├─ DailyLogService                                │  │
    │  │  └─ MetricsService                                 │  │
    │  └────────────────────────────────────────────────────┘  │
    │                        ↕                                  │
    │  ┌────────────────────────────────────────────────────┐  │
    │  │  Data Access Layer (Repositories)                  │  │
    │  │  ├─ ProjectRepository                              │  │
    │  │  └─ DailyLogRepository                             │  │
    │  └────────────────────────────────────────────────────┘  │
    └──────────────────────────────────────────────────────────┘
                                 ↓

    ┌──────────────────────────────────────────────────────────┐
    │         PostgreSQL Database                              │
    │         (Port: 5432)                                     │
    │                                                           │
    │  Tables:                                                 │
    │  ├─ Projects                                             │
    │  │  - id (PK)                                            │
    │  │  - name                                               │
    │  │  - description                                        │
    │  │  - is_active                                          │
    │  │  - created_at, updated_at                             │
    │  │                                                        │
    │  ├─ DailyLogs                                            │
    │  │  - id (PK)                                            │
    │  │  - project_id (FK)                                    │
    │  │  - log_date                                           │
    │  │  - task_description                                   │
    │  │  - output_description                                 │
    │  │  - time_spent_minutes                                 │
    │  │  - revenue_generated                                  │
    │  │  - created_at, updated_at                             │
    │  └─                                                      │
    └──────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy (Target State)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Component Tree (After Implementation)             │
└─────────────────────────────────────────────────────────────────────────┘

app-root (AppComponent)
   ↓
app-dashboard (DashboardComponent) ← Main container
   │
   ├─ app-actions-bar (ActionsBarComponent)
   │  ├─ Refresh Button → refreshDashboard()
   │  ├─ New Project Button → openCreateProjectModal()
   │  └─ Log Work Button → openCreateDailyLogModal()
   │
   ├─ app-active-project (ActiveProjectComponent)
   │  ├─ Project Name
   │  ├─ Project Description
   │  └─ Status Badge (Active/Inactive)
   │
   ├─ app-metrics-grid (MetricsGridComponent)
   │  ├─ Total Hours Card
   │  ├─ Active Projects Card
   │  ├─ This Month Hours Card
   │  └─ This Week Hours Card
   │
   ├─ app-activity-list (ActivityListComponent)
   │  └─ Loop: activity-item
   │     ├─ Date
   │     ├─ Hours Worked
   │     └─ Description
   │
   ├─ app-projects-list (ProjectsListComponent)
   │  └─ Loop: project-item
   │     ├─ Project Name
   │     ├─ Project Description
   │     ├─ Status Badge
   │     └─ Activate Button → activateProject()
   │
   ├─ app-modal (ModalComponent) ← For project creation
   │  └─ app-create-project-form (CreateProjectFormComponent)
   │     ├─ Name Input
   │     ├─ Description Input
   │     ├─ Validation Messages
   │     └─ Submit Button → createProject()
   │
   └─ app-modal (ModalComponent) ← For log creation
      └─ app-create-daily-log-form (CreateDailyLogFormComponent)
         ├─ Task Description Input
         ├─ Output Description Input
         ├─ Time Spent Input
         ├─ Revenue Input
         ├─ Validation Messages
         └─ Submit Button → createDailyLog()
```

---

## Service Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Service Injection Dependencies                        │
└─────────────────────────────────────────────────────────────────────────┘

DashboardComponent (Root)
   │
   ├─→ ProjectService (inject)
   │   │
   │   └─→ HttpClient (inject)
   │       │
   │       └─→ [LoggingInterceptor]
   │           [ResponseTransformInterceptor]
   │           [ErrorHandlingInterceptor]
   │
   ├─→ DailyLogService (inject)
   │   │
   │   └─→ HttpClient (same instance, shared)
   │
   ├─→ MetricsService (inject)
   │   │
   │   └─→ HttpClient (same instance, shared)
   │
   └─→ ILogger (inject)
       │
       └─→ ConsoleLoggerService


Sub-Components (Props-based):
├─ ActionsBarComponent
│  └─ @Inputs: isLoading
│     @Outputs: refresh, createProject, logWork
│
├─ ActiveProjectComponent
│  └─ @Inputs: project
│     @Outputs: (none)
│
├─ MetricsGridComponent
│  └─ @Inputs: metrics
│     @Outputs: (none)
│
├─ ActivityListComponent
│  └─ @Inputs: logs
│     @Outputs: (none)
│
├─ ProjectsListComponent
│  └─ @Inputs: projects
│     @Outputs: activate
│
└─ Modal Components
   ├─ ModalComponent (base)
   │  └─ @Inputs: isOpen, title
   │     @Outputs: close
   │
   ├─ CreateProjectFormComponent
   │  └─ Uses: ProjectService
   │     @Inputs: isOpen
   │     @Outputs: projectCreated
   │
   └─ CreateDailyLogFormComponent
      └─ Uses: DailyLogService
         @Inputs: isOpen, activeProject
         @Outputs: logCreated
```

---

## Data Flow for Create Project Operation

```
┌─────────────────────────────────────────────────────────────────────────┐
│          Data Flow: Create Project (Complete Sequence)                  │
└─────────────────────────────────────────────────────────────────────────┘

1. USER INTERACTION PHASE
   ┌──────────────────────────┐
   │ User clicks              │
   │ "New Project" button     │
   └──────────────────────────┘
         │
         ├─→ DashboardComponent.onCreateProjectClick()
         │
         └─→ Sets modalOpen$ = true
             (Observable emits true)

2. MODAL DISPLAY PHASE
   ┌──────────────────────────┐
   │ Modal Component detects  │
   │ isOpen input changed     │
   │ Displays form overlay    │
   └──────────────────────────┘

3. FORM INTERACTION PHASE
   ┌──────────────────────────┐
   │ User fills form:         │
   │ - name: "My Project"     │
   │ - description: "..."     │
   │                          │
   │ User clicks "Create"     │
   └──────────────────────────┘
         │
         ├─→ CreateProjectFormComponent.onSubmit()
         │   (Two-way binding captures form data)
         │
         └─→ Validates form client-side
             ├─ name required ✓
             ├─ name length ✓
             ├─ description length ✓
             └─ All valid → proceed

4. SERVICE CALL PHASE
   ┌──────────────────────────┐
   │ Form calls:              │
   │ projectService.create()  │
   │ {                        │
   │   name: "My Project",    │
   │   description: "..."     │
   │ }                        │
   └──────────────────────────┘
         │
         └─→ ProjectService.createProject(request)
             Returns: Observable<ProjectResponse>

5. HTTP REQUEST PHASE
   ┌──────────────────────────┐
   │ HttpClient constructs:   │
   │ POST /api/projects       │
   │ Body: JSON               │
   │                          │
   │ Passes through chain:    │
   │ ① LoggingInterceptor     │
   │ ② TransformInterceptor   │
   │ ③ ErrorHandlingInterceptor
   └──────────────────────────┘

6. NETWORK PHASE
   ┌──────────────────────────┐
   │ Browser sends request    │
   │ to localhost:5000/api/.. │
   │                          │
   │ Network latency:         │
   │ ~50-200ms                │
   └──────────────────────────┘

7. BACKEND PROCESSING
   ┌──────────────────────────┐
   │ ProjectsController       │
   │ .CreateProjectAsync()    │
   │                          │
   │ Actions:                 │
   │ ① Deserialize JSON       │
   │ ② Validate input         │
   │ ③ Create entity          │
   │ ④ Save to database       │
   │ ⑤ Serialize response     │
   │                          │
   │ Returns: HTTP 201        │
   │ Created with project obj │
   └──────────────────────────┘

8. NETWORK PHASE (Response)
   ┌──────────────────────────┐
   │ Browser receives:        │
   │ HTTP 201 Created         │
   │ Body: ProjectResponse    │
   │ (camelCase JSON)         │
   └──────────────────────────┘

9. RESPONSE PROCESSING
   ┌──────────────────────────┐
   │ ResponseTransformInterceptor
   │ (data already camelCase) │
   │ Pass through unchanged   │
   │                          │
   │ ErrorHandlingInterceptor │
   │ (status 201 = success)   │
   │ No error handling        │
   └──────────────────────────┘

10. COMPONENT SUCCESS HANDLER
    ┌──────────────────────────┐
    │ CreateProjectForm        │
    │ receives ProjectResponse │
    │                          │
    │ Actions:                 │
    │ ① Emit projectCreated() │
    │ ② Close modal           │
    │ ③ Clear form            │
    │ ④ Show success message  │
    └──────────────────────────┘

11. PARENT COMPONENT UPDATE
    ┌──────────────────────────┐
    │ DashboardComponent       │
    │ receives projectCreated  │
    │ event                    │
    │                          │
    │ Actions:                 │
    │ ① Add to projects$      │
    │ ② Refresh metrics$      │
    │ ③ Update projects list  │
    └──────────────────────────┘

12. UI UPDATE
    ┌──────────────────────────┐
    │ Template uses async pipe │
    │                          │
    │ (projects$ | async)      │
    │ detects new array value  │
    │                          │
    │ Change detection:        │
    │ ProjectsListComponent    │
    │ re-renders with new item │
    │                          │
    │ Animation: fade in       │
    └──────────────────────────┘
         │
         └─→ ✅ New project visible in list!
```

---

## Interceptor Chain Execution Order

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    HTTP Interceptor Pipeline                            │
└─────────────────────────────────────────────────────────────────────────┘

REQUEST PATH (Going to backend):
═══════════════════════════════════════════════════════════════════════════

HttpClient
    ↓
① LoggingInterceptor
    Action: Log outgoing request
    - Logs: method, URL, request body (if any)
    Continues to next interceptor
    ↓
② ResponseTransformInterceptor
    Action: Pass through (no request transformation needed)
    ↓
③ ErrorHandlingInterceptor
    Action: Prepare for potential errors on response
    ↓
🌐 Network Request Sent to Backend


RESPONSE PATH (Returning from backend):
═══════════════════════════════════════════════════════════════════════════

Backend Response Received
    ↓
③ ErrorHandlingInterceptor (Reverse order)
    Action: Check for errors
    - If status >= 500: Implement retry logic
    - If status >= 400: Transform to error
    - If status 2xx: Pass through
    ↓
② ResponseTransformInterceptor
    Action: Transform response if needed
    - BEFORE FIX: Expect snake_case, transform to camelCase
    - AFTER FIX: Data already camelCase, pass through
    ↓
① LoggingInterceptor
    Action: Log response
    - Logs: status code, response body (if successful)
    ↓
Observable emits to Component

Component receives:
- Observable<Type> (strongly typed)
- Error handling already applied
- Data in correct format (camelCase)
- Ready for binding in template
```

---

## Current Problem: PascalCase Response Issue

```
┌─────────────────────────────────────────────────────────────────────────┐
│         Why Angular App Shows No Data (Root Cause Illustrated)          │
└─────────────────────────────────────────────────────────────────────────┘

Template Code:
<div>{{ (project$ | async)?.name }}</div>
                              ↓
                    Expects: project.name (camelCase)


API Response (CURRENT - WRONG):
{
  "Id": 5,              ← PascalCase 🚫
  "Name": "My Project"  ← PascalCase 🚫
  ...
}

Data after ResponseTransformInterceptor:
{
  "Id": 5,              ← Still PascalCase (interceptor can't fix this)
  "Name": "My Project"  ← Still PascalCase
  ...
}

Template tries to bind:
{{project.name}}        ← Looks for "name" property
But property is actually "Name" (capital N)
Result: Nothing displays, undefined value
        ❌ BROKEN


SOLUTION - FIX API RESPONSE:

Backend Code Change (Program.cs):
options.JsonSerializerOptions.PropertyNamingPolicy = 
    JsonNamingPolicy.CamelCase;  ← One line change!

API Response (AFTER FIX - CORRECT):
{
  "id": 5,              ← camelCase ✅
  "name": "My Project"  ← camelCase ✅
  ...
}

Data after ResponseTransformInterceptor:
{
  "id": 5,              ← camelCase ✅
  "name": "My Project"  ← camelCase ✅
  ...
}

Template binds:
{{project.name}}        ← Finds "name" property
Property exists with value "My Project"
Result: "My Project" displays correctly
        ✅ WORKING
```

---

## State Management Flow (RxJS Observables)

```
┌─────────────────────────────────────────────────────────────────────────┐
│             Reactive State Management with RxJS                         │
└─────────────────────────────────────────────────────────────────────────┘

DashboardComponent:

Private State Subjects:
├─ activeProject$ = new BehaviorSubject<Project | null>(null)
│  Observable that emits current active project
│
├─ projects$ = new BehaviorSubject<Project[]>([])
│  Observable that emits list of all projects
│
├─ metrics$ = new BehaviorSubject<MetricsSummary | null>(null)
│  Observable that emits dashboard metrics
│
├─ recentLogs$ = new BehaviorSubject<DailyLog[]>([])
│  Observable that emits recent activity
│
└─ isLoading$ = new BehaviorSubject<boolean>(false)
   Observable that emits loading state


Typical Update Flow:

onRefresh() Method:
│
├─ activeProject$ = isLoading$ → true
│  (Shows loading spinner in UI)
│
├─ Calls projectService.getActive()
│  Returns Observable<Project | null>
│
├─ subscribe() and update
│  activeProject$.next(result)
│  (Emits new value to observers)
│
├─ Calls projectService.getAll()
│  subscribe() and update
│  projects$.next(results)
│
├─ Calls metricsService.getDashboard()
│  subscribe() and update
│  metrics$.next(results)
│
├─ Calls dailyLogService.getRecent()
│  subscribe() and update
│  recentLogs$.next(results)
│
└─ isLoading$ = false
   (Hides loading spinner)


Template Subscription (via async pipe):

{{ (activeProject$ | async)?.name }}
  ↑                        ↑
  │                        └─ Safe navigation (if null)
  └─ Automatically subscribes
     Automatically unsubscribes on destroy

Multiple async pipes:
One subscription per (async) pipe
(Can optimize with shareReplay() if needed)


Advantages:
✅ Reactive (responds to data changes)
✅ Type safe (Observable<Type>)
✅ Memory safe (unsubscribe automatic)
✅ Lazy evaluation (Observables don't execute until subscribed)
✅ Composable (can combine with operators like map, filter, etc.)
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Error Handling Architecture                          │
└─────────────────────────────────────────────────────────────────────────┘

5 Levels of Error Handling:

LEVEL 1: Client-Side Validation (Form)
┌──────────────────────────────┐
│ Form Validation              │
│ ├─ name required             │
│ ├─ name length < 100         │
│ └─ description length < 500  │
│                              │
│ If invalid:                  │
│ └─ Show error on input field │
│    (Prevent API call)        │
└──────────────────────────────┘

LEVEL 2: Server Validation Error (400)
┌──────────────────────────────┐
│ HTTP 400 Bad Request         │
│ Backend validates again      │
│ (Defense in depth)           │
│                              │
│ ErrorHandlingInterceptor:    │
│ └─ Detects status 400        │
│    Not a transient error     │
│    No retry                  │
│                              │
│ Component error handler:     │
│ └─ Show error message        │
│    "Invalid input: ..."      │
└──────────────────────────────┘

LEVEL 3: Network Error (No response)
┌──────────────────────────────┐
│ Network connectivity lost    │
│ (Transient error)            │
│                              │
│ ErrorHandlingInterceptor:    │
│ └─ Detects: !response        │
│    isTransientError() = true │
│    Retry with backoff        │
│                              │
│ Retry strategy:              │
│ ├─ Wait 1000ms, attempt 1    │
│ ├─ Wait 2000ms, attempt 2    │
│ └─ Wait 4000ms, attempt 3    │
│                              │
│ If all fail:                 │
│ └─ Show: "Network error"     │
│    "Check connection"        │
└──────────────────────────────┘

LEVEL 4: Server Error (5xx)
┌──────────────────────────────┐
│ HTTP 500+ Server Error       │
│ (Could be temporary)         │
│                              │
│ ErrorHandlingInterceptor:    │
│ └─ Detects: status >= 500    │
│    isTransientError() = true │
│    Implement retry (same as  │
│    network error)            │
│                              │
│ If all retries fail:         │
│ └─ Show: "Server error"      │
│    "Please try again later"  │
└──────────────────────────────┘

LEVEL 5: Global Error Handler
┌──────────────────────────────┐
│ Unexpected errors catch-all   │
│                              │
│ ErrorHandlingInterceptor:    │
│ └─ Catches any error         │
│    Logs for debugging        │
│    Transforms to safe format │
│    Prevents crash            │
│                              │
│ Browser console:             │
│ └─ Logs full error details   │
│    for debugging             │
└──────────────────────────────┘


Error Message User Sees:

Network Error:
"Network error. Please check your connection and try again."

Server Error:
"Server error (500). Please try again later."

Validation Error:
"Invalid project name. Maximum 100 characters."

Unknown Error:
"Something went wrong. Please try again."
(With details in console for developer)
```

---

## Development vs Production Build

```
┌─────────────────────────────────────────────────────────────────────────┐
│          Development vs Production Architecture                         │
└─────────────────────────────────────────────────────────────────────────┘

DEVELOPMENT SETUP:
════════════════════════════════════════════════════════════════════════

Browser (localhost:4200)
    │
    ├─→ Angular Dev Server (ng serve)
    │   ├─ Hot Module Replacement (HMR)
    │   ├─ Source maps for debugging
    │   └─ File watching
    │
    └─→ /api/* → localhost:5000/api/* (Proxy)
        (proxy.conf.json redirects requests)


ASP.NET Backend (localhost:5000)
    │
    ├─ Serves API endpoints
    ├─ Logs all requests
    └─ Development error pages

Database (localhost:5432)


PRODUCTION SETUP:
════════════════════════════════════════════════════════════════════════

Browser (example.com)
    │
    └─→ ASP.NET Application Server
        │
        ├─ Serves Angular build output (static files)
        │  └─ From /wwwroot/browser/
        │     ├─ index.html
        │     ├─ main-HASH.js (minified, production)
        │     ├─ styles-HASH.css (minified)
        │     └─ Other assets
        │
        ├─ Serves API endpoints
        │  └─ /api/* → directly handled by ASP.NET
        │
        └─ HTTPS with SSL certificate


Build Process:
ng build --configuration production
    ↓
Optimizations:
├─ Code minification (remove whitespace)
├─ Tree shaking (remove unused code)
├─ Lazy loading (code splitting)
├─ Ahead-of-Time compilation (AOT)
├─ Bundle analysis
└─ Source map generation
    ↓
Output:
dist/
├─ index.html
├─ main-HASH.js (~100-150KB gzipped)
├─ polyfills-HASH.js
├─ styles-HASH.css
└─ assets/

Deployment:
Copy dist/ contents → /wwwroot/browser/
    ↓
ASP.NET serves:
GET / → /wwwroot/browser/index.html
GET /api/... → API controllers
    ↓
Browser loads:
Single HTML file (index.html)
↓
Angular Bootstrap (main.ts)
↓
App initializes
```

---

## Technology Stack Visualization

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Technology Stack                                 │
└─────────────────────────────────────────────────────────────────────────┘

FRONTEND LAYER
═══════════════════════════════════════════════════════════════════════════

Framework:          Angular 17
│                   ├─ Standalone Components (latest)
│                   ├─ Signals (optional, new in v17)
│                   └─ Dependency Injection
│
Language:           TypeScript 5.2
│                   ├─ Strict mode enabled
│                   ├─ Type safety at compile time
│                   └─ Better IDE support
│
State Management:   RxJS Observables
│                   ├─ BehaviorSubject for state
│                   ├─ Observable streams
│                   └─ Reactive data flow
│
HTTP Client:        @angular/common/http
│                   ├─ HttpClient service
│                   ├─ Interceptors (3 levels)
│                   └─ Request/Response handling
│
Testing:            Jasmine + Karma
│                   ├─ Unit tests
│                   ├─ Component tests
│                   └─ Integration tests
│
Build Tool:         Angular CLI
│                   ├─ Development server
│                   ├─ Production build
│                   └─ Testing runner
│
Package Manager:    npm
│                   ├─ Dependency management
│                   ├─ Script running
│                   └─ Version control


API LAYER
═══════════════════════════════════════════════════════════════════════════

Framework:          ASP.NET Core 10
│                   ├─ High performance
│                   ├─ Cross-platform
│                   └─ Modern async/await
│
Language:           C# 12
│                   ├─ Type-safe
│                   ├─ Null-safe reference types
│                   └─ Record types
│
Architecture:       Layered
│                   ├─ API Controllers
│                   ├─ Services (business logic)
│                   ├─ Repositories (data access)
│                   └─ Middleware (cross-cutting)
│
ORM:                Entity Framework Core
│                   ├─ LINQ queries
│                   ├─ Migrations
│                   └─ Lazy loading support
│
Validation:         Fluent API + Attributes
│                   ├─ Model validation
│                   ├─ Request validation
│                   └─ Custom validators
│
Logging:            Microsoft.Extensions.Logging
│                   ├─ Built-in logging
│                   ├─ Multiple providers
│                   └─ Structured logging


DATA LAYER
═══════════════════════════════════════════════════════════════════════════

Database:           PostgreSQL 12+
│                   ├─ ACID compliance
│                   ├─ JSON support
│                   ├─ Full-text search
│                   └─ Scalable
│
Connection:         Npgsql (ADO.NET provider)
│                   └─ Native PostgreSQL driver
│
Migrations:         EF Core Migrations
│                   ├─ Version control for schema
│                   ├─ Rollback support
│                   └─ Database agnostic


INFRASTRUCTURE
═══════════════════════════════════════════════════════════════════════════

Containerization:   Docker (optional)
│                   ├─ Dockerfile for .NET app
│                   ├─ docker-compose.yml
│                   └─ PostgreSQL container
│
Version Control:    Git
│                   ├─ GitHub repository
│                   ├─ Branch strategy
│                   └─ Pull requests
│
CI/CD:              GitHub Actions (optional)
│                   ├─ Automated testing
│                   ├─ Build pipeline
│                   └─ Deployment automation


DEVELOPMENT TOOLS
═══════════════════════════════════════════════════════════════════════════

IDE:                Visual Studio Code
│                   ├─ Angular extension
│                   ├─ C# extension
│                   └─ Debug support
│
API Testing:        Postman / curl / Thunder Client
│                   └─ Manual endpoint testing
│
Database Admin:     pgAdmin / DBeaver
│                   └─ Database management
│
Formatting:         Prettier
│                   ├─ Code auto-formatting
│                   └─ Consistent style
│
Linting:            ESLint / StyleLint
│                   └─ Code quality checks
```

---

## Performance Considerations

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Performance Architecture                            │
└─────────────────────────────────────────────────────────────────────────┘

FRONTEND OPTIMIZATION
═══════════════════════════════════════════════════════════════════════════

Angular Change Detection:
├─ Default: Zone.js change detection
├─ Optimization: OnPush strategy (per component)
└─ Result: Fewer checks = better performance

Code Splitting:
├─ Lazy loading routes
├─ Feature modules loaded on-demand
└─ Result: Smaller initial bundle

Tree Shaking:
├─ Remove unused code at build time
├─ Production bundles optimized
└─ Result: Smaller download size

Caching:
├─ Service worker caching (PWA)
├─ Local storage for session data
└─ Result: Faster repeat visits

Compression:
├─ GZIP compression for assets
├─ brotli (modern browsers)
└─ Result: Smaller file transfers


BACKEND OPTIMIZATION
═══════════════════════════════════════════════════════════════════════════

Async/Await:
├─ Non-blocking I/O operations
├─ Thread pool optimization
└─ Result: Handle more concurrent requests

Database:
├─ Indexed queries
├─ Connection pooling
├─ Prepared statements
└─ Result: Fast data retrieval

Caching:
├─ In-memory caching (Redis optional)
├─ Response caching headers
└─ Result: Reduced database load

API Design:
├─ Pagination for large datasets
├─ Partial responses (field selection)
├─ Compression
└─ Result: Faster API responses


TARGET METRICS
═══════════════════════════════════════════════════════════════════════════

Initial Load:
├─ Time to Interactive: < 3 seconds
├─ First Contentful Paint: < 2 seconds
└─ Bundle Size: < 500KB gzipped

Runtime:
├─ API Response: < 500ms
├─ UI Render: < 16ms (60 FPS)
├─ No memory leaks
└─ No N+1 queries


MONITORING
═══════════════════════════════════════════════════════════════════════════

Frontend:
├─ Lighthouse CI
├─ Core Web Vitals
└─ Error tracking (Sentry optional)

Backend:
├─ Application Insights / New Relic
├─ Slow query logs
├─ Error rates
└─ Response times

Database:
├─ Query performance
├─ Connection pool usage
├─ Disk I/O
└─ Memory usage
```

---

**End of Architecture Diagrams**

These diagrams provide visual understanding of:
- Overall system architecture
- Component hierarchy
- Service dependencies
- Data flow patterns
- Error handling strategies
- Technology stack
- Performance considerations

Use these as reference when implementing features or debugging issues.
