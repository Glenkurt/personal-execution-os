# Personal Execution OS - Complete Deployment Guide

## Table of Contents

1. [Quick Start - Local Docker](#quick-start---local-docker)
2. [Development Environment Setup](#development-environment-setup)
3. [Production Deployment](#production-deployment)
4. [Cloud Platform Deployment](#cloud-platform-deployment)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start - Local Docker

### Prerequisites

- Docker and Docker Compose installed
- Git for version control
- ~4 GB available disk space

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/personal-execution-os.git
   cd personal-execution-os
   ```

2. **Start all services**
   ```bash
   docker-compose up --build
   ```

   This will:
   - Build Angular frontend
   - Build .NET backend
   - Start PostgreSQL database
   - Start application on port 8080

3. **Access the application**
   - Frontend: http://localhost:8080
   - API: http://localhost:8080/api
   - Health check: http://localhost:8080/health

4. **View logs**
   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f app
   docker-compose logs -f db
   ```

5. **Stop services**
   ```bash
   docker-compose down
   ```

---

## Development Environment Setup

### Local Machine Setup

#### 1. Install Prerequisites

**macOS**
```bash
# Homebrew
brew install dotnet postgresql node

# Node version 20+
node --version

# .NET 10.0
dotnet --version

# PostgreSQL 15
psql --version
```

**Windows**
```powershell
# Via Chocolatey
choco install dotnet-sdk nodejs postgresql

# Or download from:
# - Node.js: https://nodejs.org/
# - .NET: https://dotnet.microsoft.com/
# - PostgreSQL: https://www.postgresql.org/
```

**Linux (Ubuntu/Debian)**
```bash
# Update package manager
sudo apt update

# Install .NET
sudo apt install dotnet-sdk-10.0

# Install Node
sudo apt install nodejs npm

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib
```

#### 2. Database Setup

**Start PostgreSQL (Local)**

```bash
# macOS with Homebrew
brew services start postgresql

# Windows (installed service)
# Already running as Windows Service

# Linux
sudo systemctl start postgresql

# Docker (recommended for parity with production)
docker run --name peos-db \
  -e POSTGRES_DB=PersonalExecutionOS \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -v postgres-data:/var/lib/postgresql/data \
  -d postgres:15
```

**Create Database**

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql prompt
CREATE DATABASE "PersonalExecutionOS";
\q
```

#### 3. Backend Setup

```bash
# Navigate to project root
cd /path/to/personal-execution-os

# Restore NuGet packages
dotnet restore

# Apply database migrations
dotnet ef database update

# Run tests
dotnet test

# Start development server
dotnet run --configuration Debug
# API available at http://localhost:5000
```

#### 4. Frontend Setup

```bash
# Navigate to Angular app
cd angular-app

# Install dependencies
npm ci

# Start development server
npm start
# Frontend available at http://localhost:4200
# Proxy configured to http://localhost:5000/api
```

#### 5. Verify Installation

```bash
# Backend - should return 200
curl http://localhost:5000/health

# Frontend - should return Angular index.html
curl http://localhost:4200

# API - list projects
curl http://localhost:5000/api/projects
```

### IDE Setup

**Visual Studio Code**

Extensions:
- C# (powered by OmniSharp)
- .NET Runtime Installer
- Angular Language Service
- Prettier
- ESLint
- REST Client

Settings:
```json
{
  "omnisharp.useModernNet": true,
  "[csharp]": {
    "editor.defaultFormatter": "ms-dotnettools.csharp",
    "editor.formatOnSave": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  }
}
```

**Visual Studio 2022 (Windows)**

- C# workload
- ASP.NET workload
- Web development tools

---

## Production Deployment

### Build Production Artifacts

```bash
# Backend
cd /path/to/personal-execution-os
dotnet publish -c Release -o ./publish

# Frontend (done in Docker)
# See Dockerfile Stage 1 for Angular build
```

### Docker Build & Run

```bash
# Build image
docker build -t personal-execution-os:latest .

# Run with external database
docker run -d \
  --name personal-execution-os \
  -p 8080:8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ConnectionStrings__PostgresConnection="Host=db.example.com;Port=5432;Database=PersonalExecutionOS;Username=prod_user;Password=secure_password" \
  personal-execution-os:latest

# View logs
docker logs -f personal-execution-os

# Stop container
docker stop personal-execution-os
```

### Reverse Proxy Setup (nginx)

```nginx
# /etc/nginx/sites-available/personal-execution-os
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json application/javascript;

    # Proxy to application
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # WebSocket support
        proxy_read_timeout 86400;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/personal-execution-os /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL/TLS Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already configured)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## Cloud Platform Deployment

### AWS ECS Fargate

1. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name personal-execution-os
   ```

2. **Build and Push Image**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URI
   docker build -t personal-execution-os:latest .
   docker tag personal-execution-os:latest YOUR_ECR_URI/personal-execution-os:latest
   docker push YOUR_ECR_URI/personal-execution-os:latest
   ```

3. **Create RDS PostgreSQL Database**
   - Instance class: db.t3.micro
   - Storage: 20GB with auto-scaling
   - Backup: 7 days retention
   - Multi-AZ for production

4. **Create ECS Cluster**
   ```bash
   aws ecs create-cluster --cluster-name personal-execution-os
   ```

5. **Create Task Definition**
   ```json
   {
     "family": "personal-execution-os",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "containerDefinitions": [
       {
         "name": "app",
         "image": "YOUR_ECR_URI/personal-execution-os:latest",
         "portMappings": [
           {
             "containerPort": 8080,
             "hostPort": 8080,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "ASPNETCORE_ENVIRONMENT",
             "value": "Production"
           },
           {
             "name": "ConnectionStrings__PostgresConnection",
             "value": "Host=YOUR_RDS_ENDPOINT;Port=5432;Database=PersonalExecutionOS;Username=postgres;Password=YOUR_PASSWORD"
           }
         ],
         "logConfiguration": {
           "logDriver": "awslogs",
           "options": {
             "awslogs-group": "/ecs/personal-execution-os",
             "awslogs-region": "us-east-1",
             "awslogs-stream-prefix": "ecs"
           }
         }
       }
     ]
   }
   ```

6. **Create ECS Service**
   ```bash
   aws ecs create-service \
     --cluster personal-execution-os \
     --service-name personal-execution-os-service \
     --task-definition personal-execution-os \
     --desired-count 2 \
     --load-balancers targetGroupArn=YOUR_TARGET_GROUP_ARN,containerName=app,containerPort=8080
   ```

### Azure Container Instances

1. **Create Azure Container Registry**
   ```bash
   az acr create --resource-group myResourceGroup --name peos --sku Basic
   ```

2. **Build and Push Image**
   ```bash
   az acr build --registry peos --image personal-execution-os:latest .
   ```

3. **Create Azure Database for PostgreSQL**
   - Server name: peos-db
   - Location: Choose nearest region
   - Compute/Storage: Burstable, 1 vCore, 32GB

4. **Deploy to App Service**
   ```bash
   az appservice plan create --name personalExecutionOsPlan --resource-group myResourceGroup --sku B1 --is-linux
   
   az webapp create --resource-group myResourceGroup \
     --plan personalExecutionOsPlan \
     --name personalexecutionos \
     --deployment-container-image-name peos.azurecr.io/personal-execution-os:latest
   
   az webapp config appsettings set --resource-group myResourceGroup \
     --name personalexecutionos \
     --settings ASPNETCORE_ENVIRONMENT=Production \
     ConnectionStrings__PostgresConnection="Host=peos-db.postgres.database.azure.com;Database=PersonalExecutionOS;Username=postgres@peos-db;Password=YOUR_PASSWORD"
   ```

### Google Cloud Run

1. **Build and Push to Artifact Registry**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/personal-execution-os
   ```

2. **Create Cloud SQL PostgreSQL Instance**
   ```bash
   gcloud sql instances create peos-db --database-version=POSTGRES_15 --tier=db-f1-micro --region=us-central1
   ```

3. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy personal-execution-os \
     --image gcr.io/PROJECT_ID/personal-execution-os \
     --platform managed \
     --region us-central1 \
     --memory 512Mi \
     --cpu 1 \
     --set-env-vars ASPNETCORE_ENVIRONMENT=Production,ConnectionStrings__PostgresConnection="Host=CLOUD_SQL_IP;Database=PersonalExecutionOS;Username=postgres;Password=YOUR_PASSWORD" \
     --allow-unauthenticated
   ```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Application health
curl -i http://yourdomain.com/health

# Database connectivity
# Included in /health response

# API availability
curl http://yourdomain.com/api/projects
```

### Logging

**View Docker logs**
```bash
docker logs -f personal-execution-os --tail 100
```

**View application logs (if running on Linux)**
```bash
journalctl -u personal-execution-os -f
```

**Cloud Platform Logs**
- AWS CloudWatch: CloudWatch Logs console
- Azure: App Insights / Log Analytics
- Google Cloud: Cloud Logging

### Performance Monitoring

Recommended tools:
- **Application Performance Monitoring**: 
  - Azure Application Insights
  - AWS X-Ray
  - Google Cloud Trace
  
- **Metrics & Alerting**:
  - Datadog
  - New Relic
  - Prometheus + Grafana

### Database Maintenance

```bash
# Backup database
pg_dump -h localhost -U postgres -d PersonalExecutionOS > backup_$(date +%Y%m%d).sql

# Restore database
psql -h localhost -U postgres -d PersonalExecutionOS < backup.sql

# Vacuum database (cleanup)
vacuumdb -U postgres -d PersonalExecutionOS
```

### Application Updates

1. **Local Update**
   ```bash
   git pull origin main
   dotnet build
   dotnet test
   ```

2. **Docker Update**
   ```bash
   git pull origin main
   docker-compose build --no-cache
   docker-compose up -d
   ```

3. **Cloud Update**
   - Rebuild and push new image
   - Update service/deployment with new image
   - Blue-green or rolling deployment for zero downtime

---

## Troubleshooting

### Common Issues

**Issue: Port 8080 already in use**
```bash
# Find process using port
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

**Issue: Database connection failed**
```bash
# Check PostgreSQL running
docker ps  # or `systemctl status postgresql`

# Test connection
psql -h localhost -U postgres -c "SELECT version();"

# Check connection string in appsettings
# Verify Host, Port, Database, Username, Password
```

**Issue: Container won't start**
```bash
# Check container logs
docker logs personal-execution-os

# Restart container
docker restart personal-execution-os

# Rebuild image
docker-compose build --no-cache
docker-compose up
```

**Issue: Migrations not applied**
```bash
# Verify ApplyMigrationsOnStartup is true in appsettings.Production.json

# Manual migration
docker exec personal-execution-os \
  dotnet ef database update
```

**Issue: High memory usage**
```bash
# Check memory limits in docker-compose.yml
# Add memory restrictions:
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
```

### Performance Troubleshooting

1. **Slow API responses**
   - Check database indexes in Migrations
   - Review slow query logs
   - Add proper pagination
   - Use SELECT specific columns

2. **High CPU usage**
   - Identify CPU-intensive operations
   - Add caching layer (Redis)
   - Optimize LINQ queries
   - Use async/await throughout

3. **Memory leaks**
   - Review using statements
   - Check for event subscription cleanup
   - Monitor in production with APM tools

---

## Summary

Your Personal Execution OS is now fully deployable to:

✅ Local development environment
✅ Docker containers  
✅ AWS (ECS Fargate)
✅ Azure (App Service + Database)
✅ Google Cloud (Cloud Run + SQL)
✅ Any Linux server with Docker

All configurations are environment-aware, scalable, and production-ready with:
- Automated database migrations
- Health checks
- Comprehensive logging
- SSL/TLS security
- Load balancer compatible
- Auto-scaling ready

Choose your platform and deploy!
