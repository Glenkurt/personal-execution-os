# Task 12: Configurer le backend pour retourner camelCase

## Overview

Modifier la configuration du backend ASP.NET Core pour que les réponses JSON utilisent la convention camelCase au lieu de PascalCase, afin de correspondre aux conventions JavaScript/TypeScript et simplifier le code Angular.

## Estimate (days)

0.25 jour (quelques heures)

## Component

Backend Configuration (ASP.NET Core)

## Dependencies

- Aucune dépendance spécifique (peut être fait indépendamment)

## API Contract

**Avant (PascalCase):**
```json
{
  "Id": "123e4567-e89b-12d3-a456-426614174000",
  "Name": "My Project",
  "Goal": "Complete MVP",
  "StartDate": "2026-01-06",
  "IsActive": true,
  "CreatedAt": "2026-01-06T00:00:00Z"
}
```

**Après (camelCase):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "My Project",
  "goal": "Complete MVP",
  "startDate": "2026-01-06",
  "isActive": true,
  "createdAt": "2026-01-06T00:00:00Z"
}
```

## Acceptance criteria

- [ ] `Program.cs` modifié pour configurer JsonSerializerOptions avec camelCase
- [ ] Tous les controllers continuent de fonctionner sans modification
- [ ] Tests d'intégration existants mis à jour pour vérifier camelCase
- [ ] Swagger UI reflète le changement (si utilisé)
- [ ] Documentation API mise à jour
- [ ] Pas de breaking changes pour les DTOs/Models (ils restent en PascalCase côté C#)

## Required tests

### Tests d'intégration (à mettre à jour)

- [ ] Test: `GET /api/projects` retourne JSON en camelCase
- [ ] Test: `GET /api/projects/{id}` retourne JSON en camelCase
- [ ] Test: `POST /api/projects` accepte camelCase et retourne camelCase
- [ ] Test: `GET /api/metrics/{projectId}` retourne JSON en camelCase
- [ ] Test: `GET /api/dailylogs/project/{projectId}` retourne JSON en camelCase

## Notes techniques

### Référence

- Fichier à modifier: `Program.cs` (ligne de configuration des controllers)
- Documentation Microsoft: [JsonSerializerOptions](https://learn.microsoft.com/en-us/dotnet/api/system.text.json.jsonserializeroptions)

### Impact

**Ce qui change:**
- Réponses JSON de l'API (serialization)
- Parsing des requêtes JSON entrantes (deserialization)

**Ce qui ne change PAS:**
- Code C# (Models, DTOs, Controllers) reste en PascalCase
- Validation des modèles
- Logique métier
- Base de données

## Quick examples

### Program.cs (configuration actuelle → nouvelle)

**Avant:**
```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
// ... autres services
```

**Après:**
```csharp
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Configure camelCase naming policy for JSON serialization
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        
        // Optional: autres configurations utiles
        options.JsonSerializerOptions.DefaultIgnoreCondition = 
            System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// ... reste de la configuration
```

### Test d'intégration à mettre à jour

**Avant:**
```csharp
[Fact]
public async Task GetProjectById_ReturnsProject_WithCorrectStructure()
{
    // Arrange
    var projectId = await CreateTestProject();

    // Act
    var response = await _client.GetAsync($"/api/projects/{projectId}");
    var content = await response.Content.ReadAsStringAsync();
    var project = JsonSerializer.Deserialize<JsonElement>(content);

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.OK);
    project.GetProperty("Id").GetString().Should().Be(projectId.ToString());  // PascalCase
    project.GetProperty("Name").GetString().Should().NotBeNullOrEmpty();      // PascalCase
}
```

**Après:**
```csharp
[Fact]
public async Task GetProjectById_ReturnsProject_WithCorrectStructure()
{
    // Arrange
    var projectId = await CreateTestProject();

    // Act
    var response = await _client.GetAsync($"/api/projects/{projectId}");
    var content = await response.Content.ReadAsStringAsync();
    var project = JsonSerializer.Deserialize<JsonElement>(content);

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.OK);
    project.GetProperty("id").GetString().Should().Be(projectId.ToString());     // camelCase
    project.GetProperty("name").GetString().Should().NotBeNullOrEmpty();        // camelCase
}
```

### Vérification manuelle avec curl/Postman

**Test GET:**
```bash
curl -X GET http://localhost:5000/api/projects \
  -H "Content-Type: application/json"
```

**Réponse attendue:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "My Project",
    "goal": "Complete MVP",
    "startDate": "2026-01-06",
    "isActive": true,
    "createdAt": "2026-01-06T10:30:00Z"
  }
]
```

**Test POST:**
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Project",
    "goal": "Test Goal",
    "startDate": "2026-01-10",
    "isActive": true
  }'
```

**Note:** Les requests peuvent être envoyées en camelCase ou PascalCase - ASP.NET Core est case-insensitive par défaut pour la désérialisation.

### Controllers - Pas de modification nécessaire

Les controllers existants continuent de fonctionner sans modification:

```csharp
[HttpGet("{id:guid}")]
public async Task<ActionResult<ProjectResponse>> GetProjectByIdAsync(Guid id, CancellationToken ct)
{
    // Code existant inchangé
    var result = await _projectRepository.GetByIdAsync(id, ct);
    
    if (!result.IsSuccess)
    {
        return NotFound(new { error = "Project not found" });
    }

    var response = MapToProjectResponse(result.Value!);
    return Ok(response);  // Sera automatiquement sérialisé en camelCase
}
```

### DTOs - Pas de modification nécessaire

Les DTOs restent en PascalCase côté C#:

```csharp
public class ProjectResponse
{
    public Guid Id { get; set; }           // Devient "id" dans JSON
    public string Name { get; set; }        // Devient "name" dans JSON
    public string? Goal { get; set; }       // Devient "goal" dans JSON
    public DateOnly StartDate { get; set; } // Devient "startDate" dans JSON
    public bool IsActive { get; set; }      // Devient "isActive" dans JSON
    public DateTime CreatedAt { get; set; } // Devient "createdAt" dans JSON
}
```

### Configuration supplémentaire (optionnelle)

Pour plus de flexibilité:

```csharp
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        var jsonOptions = options.JsonSerializerOptions;
        
        // camelCase naming
        jsonOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        
        // Ignore null values (optionnel)
        jsonOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        
        // Pretty print pour debug (désactiver en prod)
        if (builder.Environment.IsDevelopment())
        {
            jsonOptions.WriteIndented = true;
        }
        
        // Gestion des enums (optionnel)
        jsonOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
    });
```

## Handoff checklist

- [ ] `Program.cs` modifié avec configuration camelCase
- [ ] Application démarre sans erreurs
- [ ] Tests d'intégration mis à jour et passent
- [ ] Vérification manuelle avec Swagger/Postman effectuée
- [ ] Toutes les réponses API sont en camelCase
- [ ] Les requests en camelCase sont correctement parsées
- [ ] Documentation mise à jour si nécessaire
- [ ] Commit avec message clair: "Configure JSON serialization to use camelCase"
