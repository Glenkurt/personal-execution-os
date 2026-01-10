# syntax=docker/dockerfile:1

# Stage 1: Build Angular frontend
FROM node:20 AS node-build
WORKDIR /src/angular
COPY angular-app/package*.json ./
RUN npm ci --silent
COPY angular-app ./
RUN npm run build -- --configuration=production --outputPath=dist

# Stage 2: Build .NET API
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS dotnet-build
WORKDIR /src

COPY PersonalExecutionOS.csproj ./
RUN dotnet restore ./PersonalExecutionOS.csproj

COPY . ./
# Copy Angular build artifacts into wwwroot so they're served by ASP.NET
COPY --from=node-build /src/angular/dist ./wwwroot

RUN dotnet publish ./PersonalExecutionOS.csproj -c Release -o /app/publish --no-restore

# Stage 3: Runtime container
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=dotnet-build /app/publish ./
ENTRYPOINT ["dotnet", "PersonalExecutionOS.dll"]
