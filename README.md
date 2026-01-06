# Personal Execution OS

A lightweight personal system designed to track execution, focus, output, and revenue in order to improve decision-making and eliminate wasted effort.

## Overview

Personal Execution OS is a minimal, opinionated personal productivity tracker for indie developers and makers. It enforces focus on a single active project and makes execution measurable through daily logs of time spent, output produced, and revenue generated.

## Getting Started

### Prerequisites

- **.NET 10.0+** (SDK)
- **PostgreSQL 12+** (database)

### Local Setup

1. **Install dependencies:**

   ```bash
   dotnet restore
   ```

2. **Configure PostgreSQL:**

   Create a PostgreSQL database:

   ```sql
   CREATE DATABASE PersonalExecutionOS;
   ```

   Update connection string in `appsettings.json`:

   ```json
   {
     "ConnectionStrings": {
       "PostgresConnection": "Host=localhost;Port=5432;Database=PersonalExecutionOS;Username=postgres;Password=YOUR_PASSWORD"
     }
   }
   ```

3. **Run database migrations:**

   ```bash
   dotnet ef database update
   ```

4. **Build the project:**

   ```bash
   dotnet build
   ```

5. **Run the application:**

   ```bash
   dotnet run
   ```

   The API will be available at `https://localhost:7242` (or configured port).

### API Endpoints

- **Health Check:** `GET /health` — Returns API status

## Project Structure

```
src/
├── API/
│   ├── Controllers/          # API endpoints
│   └── Middleware/           # Global error handling
├── Core/
│   ├── DTOs/                 # Data transfer objects
│   ├── Interfaces/           # Service contracts
│   ├── Models/               # Domain entities
│   └── Services/             # Business logic
└── Infrastructure/
    ├── Data/                 # EF Core context & migrations
    └── Repositories/         # Data access layer
tests/
├── Unit/                     # Unit tests
└── Integration/              # Integration tests
```

## Development

### Running Tests

```bash
dotnet test
```

### Database Migrations

Create a new migration:

```bash
dotnet ef migrations add MigrationName
```

Apply migrations:

```bash
dotnet ef database update
```

## Architecture

- **Pattern:** .NET Minimal API with Repository pattern
- **Database:** PostgreSQL with Entity Framework Core
- **Error Handling:** Global middleware for consistent responses
- **Result Pattern:** `ServiceResult<T>` for standardized operation results

## Documentation

- [Product Requirements Document](Personal_Execution_OS_PRD.md)
- [Task Breakdown](.github/tasks/task-breakdown.md)

## License

Personal use only.
