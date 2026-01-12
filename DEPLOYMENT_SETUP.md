# Personal Execution OS - Environment Configuration Guide

## Overview

The Personal Execution OS supports multiple deployment environments with environment-specific configurations.

## Environment Types

### Development
- Local machine development
- SQLite or local PostgreSQL
- Debug logging enabled
- Hot reload enabled
- CORS allows localhost

### Production
- Docker containers on cloud platform
- PostgreSQL 15+
- Minimal logging (Info level+)
- HTTPS required
- Restricted CORS policy

## Configuration Files

### appsettings.json (Shared)
Base configuration for all environments:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "System": "Warning"
    }
  },
  "ConnectionStrings": {
    "PostgresConnection": "Host=localhost;Port=5432;Database=PersonalExecutionOS;Username=postgres;Password=postgres"
  },
  "AllowedHosts": "*",
  "SerializerSettings": {
    "PropertyNameCaseInsensitive": false,
    "PropertyNamingPolicy": "CamelCase"
  }
}
```

### appsettings.Development.json
Development-specific overrides:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft": "Information",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  },
  "UseHttpsRedirection": false,
  "ApplyMigrationsOnStartup": true,
  "ConnectionStrings": {
    "PostgresConnection": "Host=localhost;Port=5432;Database=PersonalExecutionOS;Username=postgres;Password=postgres"
  }
}
```

### appsettings.Production.json (Create this)
Production-specific settings:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "System": "Warning"
    }
  },
  "UseHttpsRedirection": true,
  "ApplyMigrationsOnStartup": true,
  "Kestrel": {
    "Endpoints": {
      "Http": {
        "Url": "http://+:8080"
      }
    }
  }
}
```

## Environment Variables

### Local Development

Set in `.env` file or shell:

```bash
# ASP.NET Core
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=http://localhost:5000
ConnectionStrings__PostgresConnection=Host=localhost;Port=5432;Database=PersonalExecutionOS;Username=postgres;Password=postgres

# Angular Development
NG_ENVIRONMENT=development
API_BASE_URL=http://localhost:5000
```

### Docker Production

Set in `docker-compose.yml`:

```yaml
environment:
  ASPNETCORE_ENVIRONMENT: Production
  ASPNETCORE_URLS: http://+:8080
  ConnectionStrings__PostgresConnection: Host=db;Port=5432;Database=PersonalExecutionOS;Username=postgres;Password=postgres
```

### Cloud Deployment

Set via platform-specific methods:
- **AWS**: Lambda environment variables, RDS connection string
- **Azure**: App Service Configuration, Azure Database for PostgreSQL
- **Google Cloud**: Cloud Run environment variables, Cloud SQL
- **Heroku**: Config vars in Procfile/settings
- **DigitalOcean**: App Platform environment variables

## Database Configuration

### Local Development (SQLite)

Optional for quick testing:

```csharp
services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite("Data Source=PersonalExecutionOS.db")
);
```

### Local Development (PostgreSQL)

Recommended for production parity:

```bash
# Start PostgreSQL (Docker)
docker run --name peos-db \
  -e POSTGRES_DB=PersonalExecutionOS \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:15
```

### Production (PostgreSQL)

Use managed database service:

```bash
# Connection string format
Host={server};Port=5432;Database=PersonalExecutionOS;Username={user};Password={password};SSL Mode=Require
```

Examples:
- **Azure Database for PostgreSQL**: `host.postgres.database.azure.com`
- **AWS RDS**: `db-instance.rds.amazonaws.com`
- **Google Cloud SQL**: `project:region:instance`

## Migration & Database Setup

### Local Development

1. Install Entity Framework CLI:
```bash
dotnet tool install --global dotnet-ef
```

2. Create migration:
```bash
dotnet ef migrations add InitialCreate
```

3. Apply migration:
```bash
dotnet ef database update
```

### Docker Production

Applied automatically on startup via:
```csharp
ApplyMigrationsOnStartup: true
```

Set in `appsettings.Production.json`

### Manual Migration

```bash
# In Docker container
docker exec personal-execution-os-app \
  dotnet ef database update \
  --connection "Host=db;Port=5432;Database=PersonalExecutionOS;Username=postgres;Password=postgres"
```

## Security Configuration

### CORS (Cross-Origin Resource Sharing)

Local development (all origins):
```csharp
services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader()
    );
});
```

Production (specific origins):
```csharp
services.AddCors(options =>
{
    options.AddPolicy("Production",
        policy => policy
            .WithOrigins("https://yourdomain.com")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
    );
});
```

### HTTPS/TLS

In production, use:
- **Docker**: Reverse proxy (nginx) with SSL/TLS
- **Cloud Platform**: Platform-managed SSL/TLS
- **Kestrel**: Direct TLS configuration

## Docker Deployment

### Local Testing

```bash
# Build and start all services
docker-compose up --build

# Access application
# Frontend: http://localhost:8080
# API: http://localhost:8080/api
```

### Stopping Services

```bash
# Stop and remove containers
docker-compose down

# Stop but keep data
docker-compose stop

# Remove data volumes
docker-compose down -v
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f db
```

## Cloud Deployment Platforms

### AWS Elastic Container Service (ECS)

1. Push image to ECR:
```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin YOUR_ECR_URI

docker tag personal-execution-os:latest YOUR_ECR_URI/personal-execution-os:latest
docker push YOUR_ECR_URI/personal-execution-os:latest
```

2. Create ECS task definition with:
   - Container image: YOUR_ECR_URI/personal-execution-os:latest
   - Port mapping: 8080:8080
   - Environment variables: See section above
   - RDS PostgreSQL endpoint

3. Create ECS service with load balancer

### Azure Container Instances

1. Push to Azure Container Registry:
```bash
az acr build --registry YOUR_REGISTRY --image personal-execution-os:latest .
```

2. Deploy to App Service:
```bash
az webapp create --resource-group myGroup \
  --plan myPlan \
  --name personalexecutionos \
  --deployment-container-image-name YOUR_REGISTRY/personal-execution-os:latest
```

### Google Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/personal-execution-os

# Deploy
gcloud run deploy personal-execution-os \
  --image gcr.io/PROJECT_ID/personal-execution-os \
  --platform managed \
  --region us-central1 \
  --set-env-vars ASPNETCORE_ENVIRONMENT=Production
```

## Monitoring & Logging

### Local Development

Logs output to console with structure:
- Timestamp
- Log level (Debug, Info, Warning, Error)
- Logger name
- Message

### Production

Recommended logging services:
- **AWS CloudWatch**: Automatic for ECS
- **Azure Application Insights**: Integrated with App Service
- **Google Cloud Logging**: Automatic for Cloud Run
- **Datadog**: Universal monitoring
- **ELK Stack**: Self-hosted logging

### Application Health Check

```bash
# Health endpoint
curl http://localhost:8080/health

# Database connectivity check included
```

## Backup & Recovery

### Database Backups

PostgreSQL backup:
```bash
# Full backup
docker exec personal-execution-os-db \
  pg_dump -U postgres PersonalExecutionOS > backup.sql

# Restore
docker exec -i personal-execution-os-db \
  psql -U postgres PersonalExecutionOS < backup.sql
```

### Automated Backups

Production databases should use:
- AWS RDS automated backups (7-35 days)
- Azure automated backups
- Google Cloud SQL backups
- Daily snapshots to cloud storage

### Volume Backups

Docker volume backup:
```bash
# Backup PostgreSQL data
docker run --rm \
  -v postgres-data:/data \
  -v $(pwd):/backup \
  postgres:15 \
  tar czf /backup/postgres-data.tar.gz -C / data
```

## Maintenance

### Updating the Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart (Docker)
docker-compose up --build -d
```

### Database Migrations

New migrations applied automatically on startup if:
```
"ApplyMigrationsOnStartup": true
```

For manual control, set to `false` and run:
```bash
dotnet ef database update
```

### Monitoring Disk Space

```bash
# Docker disk usage
docker system df

# Clean up unused images/containers
docker system prune -a --volumes
```

## Troubleshooting

### Common Issues

**Connection string errors**
- Verify PostgreSQL is running: `docker ps`
- Check credentials match in environment variables
- Verify database name exists

**Migration failures**
- Check database user has required permissions
- Review migration in `/Migrations` folder
- Run `dotnet ef migrations add` to generate new migration

**Port conflicts**
- 8080 in use: Change in `docker-compose.yml` or Kestrel config
- 5432 in use: Change PostgreSQL port mapping

**Performance issues**
- Monitor application logs for slow queries
- Check database indexes in migrations
- Scale container resources if memory-bound

## Summary

The Personal Execution OS is fully containerized and ready for production deployment. Configuration is environment-aware and supports:

- ✅ Local development with auto-migrations
- ✅ Docker multi-stage builds for optimization
- ✅ PostgreSQL 15 with health checks
- ✅ Environment variable overrides
- ✅ CORS and HTTPS configuration
- ✅ Cloud platform compatibility
- ✅ Automated backup strategies
- ✅ Monitoring and logging integration

Choose a deployment platform and follow the platform-specific instructions above to launch your application in production.
