#nullable enable
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Http.Json;
using PersonalExecutionOS.Core.DTOs;
using PersonalExecutionOS.Core.Models;
using PersonalExecutionOS.Core.Interfaces;
using PersonalExecutionOS.Core.Services;
using PersonalExecutionOS.Infrastructure.Data;
using PersonalExecutionOS.Infrastructure.Repositories;
using Xunit;

namespace PersonalExecutionOS.Tests.Integration.Controllers;

/// <summary>
/// Custom WebApplicationFactory that configures the test environment with In-Memory database.
/// </summary>
public class ProjectsControllerWebApplicationFactory : WebApplicationFactory<Program>
{
    private string _databaseName = "PersonalExecutionOSTest_" + Guid.NewGuid();

    public string DatabaseName => _databaseName;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Set environment to Testing so Program.cs skips Postgres configuration
        builder.UseEnvironment("Testing");

        builder
            .UseContentRoot(GetProjectRoot())
            .ConfigureServices(services =>
            {
                // Use In-Memory database for tests - use consistent database name
                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseInMemoryDatabase(_databaseName),
                    ServiceLifetime.Scoped);

                // Register repositories (in case they weren't already)
                services.AddScoped<IProjectRepository, ProjectRepository>();
                services.AddScoped<IDailyLogRepository, DailyLogRepository>();

                // Register metrics service (in case it wasn't already)
                services.AddScoped<IMetricsService, MetricsService>();
            })
            .ConfigureServices(services =>
            {
                // Initialize the database
                var sp = services.BuildServiceProvider();

                using var scope = sp.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                dbContext.Database.EnsureCreated();
            });
    }

    private static string GetProjectRoot()
    {
        var testPath = typeof(ProjectsControllerWebApplicationFactory).Assembly.Location;
        var dir = new DirectoryInfo(testPath);
        while (dir != null && !File.Exists(Path.Combine(dir.FullName, "PersonalExecutionOS.csproj")))
        {
            dir = dir.Parent;
        }
        return dir?.FullName ?? throw new InvalidOperationException("Could not find project root");
    }
}

public class ProjectsControllerTests : IAsyncLifetime
{
    private ProjectsControllerWebApplicationFactory? _factory;
    private HttpClient? _client;

    public async Task InitializeAsync()
    {
        _factory = new ProjectsControllerWebApplicationFactory();
        _client = _factory.CreateClient();
        await Task.CompletedTask;
    }

    public async Task DisposeAsync()
    {
        _client?.Dispose();
        _factory?.Dispose();
        await Task.CompletedTask;
    }

    #region Create Project Tests

    [Fact]
    public async Task CreateProject_WhenRequestIsValid_ReturnsCreatedAtActionResult()
    {
        // Arrange
        var request = new CreateProjectRequest
        {
            Name = "My Awesome Project",
            Goal = "Build a SaaS tool",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = true
        };

        // Act
        var response = await _client!.PostAsJsonAsync("/api/projects", request);
        var content = await response.Content.ReadAsStringAsync();

        // Assert
        Assert.True(response.IsSuccessStatusCode, $"Status: {response.StatusCode}, Content: {content}");
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(result);
        Assert.Equal("My Awesome Project", result.Name);
        Assert.Equal("Build a SaaS tool", result.Goal);
        Assert.True(result.IsActive);
        Assert.NotEqual(Guid.Empty, result.Id);
    }

    [Fact]
    public async Task CreateProject_WhenNameIsEmpty_ReturnsBadRequest()
    {
        // Arrange
        var request = new CreateProjectRequest
        {
            Name = "",
            Goal = "Goal",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = false
        };

        // Act
        var response = await _client!.PostAsJsonAsync("/api/projects", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("name is required", content, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateProject_WhenNameExceeds100Characters_ReturnsBadRequest()
    {
        // Arrange
        var longName = new string('A', 101);
        var request = new CreateProjectRequest
        {
            Name = longName,
            Goal = "Goal",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = false
        };

        // Act
        var response = await _client!.PostAsJsonAsync("/api/projects", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("100 characters", content);
    }

    [Fact]
    public async Task CreateProject_WhenGoalExceeds500Characters_ReturnsBadRequest()
    {
        // Arrange
        var longGoal = new string('A', 501);
        var request = new CreateProjectRequest
        {
            Name = "Valid Name",
            Goal = longGoal,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = false
        };

        // Act
        var response = await _client!.PostAsJsonAsync("/api/projects", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("500 characters", content);
    }

    [Fact]
    public async Task CreateProject_WhenStartDateIsInFuture_ReturnsBadRequest()
    {
        // Arrange
        var futureDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
        var request = new CreateProjectRequest
        {
            Name = "Valid Name",
            Goal = "Goal",
            StartDate = futureDate,
            IsActive = false
        };

        // Act
        var response = await _client!.PostAsJsonAsync("/api/projects", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("future", content, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateProject_WhenActivatedWithoutGoal_ReturnsCreatedProject()
    {
        // Arrange
        var request = new CreateProjectRequest
        {
            Name = "Project Without Goal",
            Goal = null,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = true
        };

        // Act
        var response = await _client!.PostAsJsonAsync("/api/projects", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(result);
        Assert.Null(result.Goal);
    }

    [Fact]
    public async Task CreateProject_WhenCreatingSecondActiveProject_DeactivatesFirst()
    {
        // Arrange
        var firstRequest = new CreateProjectRequest
        {
            Name = "First Project",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = true
        };

        var secondRequest = new CreateProjectRequest
        {
            Name = "Second Project",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = true
        };

        // Act
        var firstResponse = await _client!.PostAsJsonAsync("/api/projects", firstRequest);
        var firstProject = await firstResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(firstProject);

        var secondResponse = await _client.PostAsJsonAsync("/api/projects", secondRequest);
        var secondProject = await secondResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(secondProject);

        // Get first project to verify it's deactivated
        var getFirstResponse = await _client.GetAsync($"/api/projects/{firstProject.Id}");
        var updatedFirstProject = await getFirstResponse.Content.ReadFromJsonAsync<ProjectResponse>();

        // Assert
        Assert.True(secondProject.IsActive);
        Assert.False(updatedFirstProject!.IsActive);
    }

    #endregion

    #region Get Project Tests

    [Fact]
    public async Task GetProjectById_WhenProjectExists_ReturnsOkResult()
    {
        // Arrange
        var createRequest = new CreateProjectRequest
        {
            Name = "Test Project",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = false
        };

        var createResponse = await _client!.PostAsJsonAsync("/api/projects", createRequest);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        var createdProject = await createResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(createdProject);
        Assert.NotEqual(Guid.Empty, createdProject.Id);

        // Act
        var getResponse = await _client.GetAsync($"/api/projects/{createdProject.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var result = await getResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(result);
        Assert.Equal(createdProject.Id, result.Id);
        Assert.Equal("Test Project", result.Name);
    }

    [Fact]
    public async Task GetProjectById_WhenProjectDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var response = await _client!.GetAsync($"/api/projects/{nonExistentId}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("not found", content, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task GetProjectById_WhenIdIsEmpty_ReturnsBadRequest()
    {
        // Act
        var response = await _client!.GetAsync($"/api/projects/{Guid.Empty}");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetAllProjects_WhenProjectsExist_ReturnsOkWithList()
    {
        // Arrange
        var request1 = new CreateProjectRequest
        {
            Name = "Project 1",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = false
        };

        var request2 = new CreateProjectRequest
        {
            Name = "Project 2",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = false
        };

        await _client!.PostAsJsonAsync("/api/projects", request1);
        await _client.PostAsJsonAsync("/api/projects", request2);

        // Act
        var response = await _client.GetAsync("/api/projects");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<List<ProjectResponse>>();
        Assert.NotNull(result);
        Assert.True(result.Count >= 2);
    }

    [Fact]
    public async Task GetActiveProject_WhenActiveProjectExists_ReturnsOkWithProject()
    {
        // Arrange
        var request = new CreateProjectRequest
        {
            Name = "Active Project",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = true
        };

        await _client!.PostAsJsonAsync("/api/projects", request);

        // Act
        var response = await _client.GetAsync("/api/projects/active/current");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(result);
        Assert.Equal("Active Project", result.Name);
        Assert.True(result.IsActive);
    }

    [Fact]
    public async Task GetActiveProject_WhenNoActiveProjectExists_ReturnsNoContent()
    {
        // Arrange - ensure no active projects by creating only inactive ones
        var request = new CreateProjectRequest
        {
            Name = "Inactive Project",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = false
        };

        await _client!.PostAsJsonAsync("/api/projects", request);

        // Act
        var response = await _client.GetAsync("/api/projects/active/current");

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    #endregion

    #region Update Project Tests

    [Fact]
    public async Task UpdateProject_WhenRequestIsValid_ReturnsOkWithUpdatedProject()
    {
        // Arrange
        var createRequest = new CreateProjectRequest
        {
            Name = "Original Name",
            Goal = "Original Goal",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = false
        };

        var createResponse = await _client!.PostAsJsonAsync("/api/projects", createRequest);
        var createdProject = await createResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(createdProject);

        var updateRequest = new UpdateProjectRequest
        {
            Name = "Updated Name",
            Goal = "Updated Goal"
        };

        // Act
        var updateResponse = await _client.PutAsJsonAsync($"/api/projects/{createdProject.Id}", updateRequest);

        // Assert
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        var result = await updateResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(result);
        Assert.Equal("Updated Name", result.Name);
        Assert.Equal("Updated Goal", result.Goal);
    }

    [Fact]
    public async Task UpdateProject_WhenNameIsEmpty_ReturnsBadRequest()
    {
        // Arrange
        var createRequest = new CreateProjectRequest
        {
            Name = "Test Project",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = false
        };

        var createResponse = await _client!.PostAsJsonAsync("/api/projects", createRequest);
        var createdProject = await createResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(createdProject);

        var updateRequest = new UpdateProjectRequest
        {
            Name = "",
            Goal = "Updated Goal"
        };

        // Act
        var updateResponse = await _client.PutAsJsonAsync($"/api/projects/{createdProject.Id}", updateRequest);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, updateResponse.StatusCode);
    }

    [Fact]
    public async Task UpdateProject_WhenProjectDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        var updateRequest = new UpdateProjectRequest
        {
            Name = "Updated Name",
            Goal = "Updated Goal"
        };

        // Act
        var response = await _client!.PutAsJsonAsync($"/api/projects/{Guid.NewGuid()}", updateRequest);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateProject_WhenGoalIsCleared_ReturnsOkWithNullGoal()
    {
        // Arrange
        var createRequest = new CreateProjectRequest
        {
            Name = "Test Project",
            Goal = "Original Goal",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = false
        };

        var createResponse = await _client!.PostAsJsonAsync("/api/projects", createRequest);
        var createdProject = await createResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(createdProject);

        var updateRequest = new UpdateProjectRequest
        {
            Name = "Test Project",
            Goal = null
        };

        // Act
        var updateResponse = await _client.PutAsJsonAsync($"/api/projects/{createdProject.Id}", updateRequest);

        // Assert
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        var result = await updateResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(result);
        Assert.Null(result.Goal);
    }

    #endregion

    #region Activate Project Tests

    [Fact]
    public async Task ActivateProject_WhenProjectExists_ReturnsOkAndActivatesProject()
    {
        // Arrange
        var request = new CreateProjectRequest
        {
            Name = "Inactive Project",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = false
        };

        var createResponse = await _client!.PostAsJsonAsync("/api/projects", request);
        var createdProject = await createResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(createdProject);
        Assert.False(createdProject.IsActive);

        // Act
        var activateResponse = await _client.PostAsync($"/api/projects/{createdProject.Id}/activate", null);

        // Assert
        Assert.Equal(HttpStatusCode.OK, activateResponse.StatusCode);
        var result = await activateResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(result);
        Assert.True(result.IsActive);
    }

    [Fact]
    public async Task ActivateProject_WhenProjectDoesNotExist_ReturnsNotFound()
    {
        // Act
        var response = await _client!.PostAsync($"/api/projects/{Guid.NewGuid()}/activate", null);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task ActivateProject_WhenIdIsEmpty_ReturnsBadRequest()
    {
        // Act
        var response = await _client!.PostAsync($"/api/projects/{Guid.Empty}/activate", null);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    #endregion

    #region Delete Project Tests

    [Fact]
    public async Task DeleteProject_WhenProjectExists_ReturnsNoContent()
    {
        // Arrange
        var request = new CreateProjectRequest
        {
            Name = "Project to Delete",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = false
        };

        var createResponse = await _client!.PostAsJsonAsync("/api/projects", request);
        var createdProject = await createResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(createdProject);

        // Act
        var deleteResponse = await _client.DeleteAsync($"/api/projects/{createdProject.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        // Verify project is deactivated
        var getResponse = await _client.GetAsync($"/api/projects/{createdProject.Id}");
        var deletedProject = await getResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(deletedProject);
        Assert.False(deletedProject.IsActive);
    }

    [Fact]
    public async Task DeleteProject_WhenProjectDoesNotExist_ReturnsNotFound()
    {
        // Act
        var response = await _client!.DeleteAsync($"/api/projects/{Guid.NewGuid()}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteProject_WhenIdIsEmpty_ReturnsBadRequest()
    {
        // Act
        var response = await _client!.DeleteAsync($"/api/projects/{Guid.Empty}");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    #endregion

    #region Edge Cases

    [Fact]
    public async Task CreateProject_WithWhitespaceInName_TrimsAndCreatesProject()
    {
        // Arrange
        var request = new CreateProjectRequest
        {
            Name = "  Project With Spaces  ",
            Goal = "  Goal with spaces  ",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = false
        };

        // Act
        var response = await _client!.PostAsJsonAsync("/api/projects", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(result);
        Assert.Equal("Project With Spaces", result.Name);
        Assert.Equal("Goal with spaces", result.Goal);
    }

    [Fact]
    public async Task CreateProject_WithPastStartDate_ReturnsCreatedProject()
    {
        // Arrange
        var pastDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
        var request = new CreateProjectRequest
        {
            Name = "Past Project",
            StartDate = pastDate,
            IsActive = false
        };

        // Act
        var response = await _client!.PostAsJsonAsync("/api/projects", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(result);
        Assert.Equal(pastDate, result.StartDate);
    }

    #endregion
}
