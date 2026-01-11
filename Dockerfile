# syntax=docker/dockerfile:1

# Stage 1: Build Angular frontend
FROM node:20 AS node-build
WORKDIR /src
COPY angular-app ./angular-app
RUN cd angular-app && npm ci --silent && npm run build -- --configuration=production

# Stage 2: Build .NET API
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS dotnet-build
WORKDIR /src

COPY PersonalExecutionOS.csproj ./
RUN dotnet restore ./PersonalExecutionOS.csproj

COPY . ./
# Copy Angular build artifacts - extract from 'browser' subdirectory if present (Angular 17+ default)
COPY --from=node-build /src/wwwroot/browser ./wwwroot

RUN dotnet publish ./PersonalExecutionOS.csproj -c Release -o /app/publish --no-restore

# Stage 3: Runtime container
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=dotnet-build /app/publish ./
ENTRYPOINT ["dotnet", "PersonalExecutionOS.dll"]
