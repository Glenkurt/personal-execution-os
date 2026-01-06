#nullable enable
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Http.Json;
using PersonalExecutionOS.Core.DTOs;
using PersonalExecutionOS.Core.Interfaces;
using PersonalExecutionOS.Core.Services;
using PersonalExecutionOS.Infrastructure.Data;
using PersonalExecutionOS.Infrastructure.Repositories;
using Xunit;

namespace PersonalExecutionOS.Tests.Integration.Controllers;

/// <summary>
/// Custom WebApplicationFactory for DailyLog integration tests.
/// </summary>
public class DailyLogsControllerWebApplicationFactory : WebApplicationFactory<Program>
{
    private string _databaseName = "DailyLogsTest_" + Guid.NewGuid();

    public string DatabaseName => _databaseName;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder
            .UseContentRoot(GetProjectRoot())
            .ConfigureServices(services =>
            {
                // Use In-Memory database for tests
                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseInMemoryDatabase(_databaseName),
                    ServiceLifetime.Scoped);

                // Register repositories
                services.AddScoped<IProjectRepository, ProjectRepository>();
                services.AddScoped<IDailyLogRepository, DailyLogRepository>();
                services.AddScoped<IMetricsService, MetricsService>();
            })
            .ConfigureServices(services =>
            {
                var sp = services.BuildServiceProvider();

                using var scope = sp.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                dbContext.Database.EnsureCreated();
            });
    }

    private static string GetProjectRoot()
    {
        var testPath = typeof(DailyLogsControllerWebApplicationFactory).Assembly.Location;
        var dir = new DirectoryInfo(testPath);
        while (dir != null && !File.Exists(Path.Combine(dir.FullName, "PersonalExecutionOS.csproj")))
        {
            dir = dir.Parent;
        }
        return dir?.FullName ?? throw new InvalidOperationException("Could not find project root");
    }
}

public class DailyLogsControllerTests : IAsyncLifetime
{
    private DailyLogsControllerWebApplicationFactory? _factory;
    private HttpClient? _client;
    private Guid _projectId;

    public async Task InitializeAsync()
    {
        _factory = new DailyLogsControllerWebApplicationFactory();
        _client = _factory.CreateClient();

        // Create a project for testing
        var projectRequest = new CreateProjectRequest
        {
            Name = "Test Project for Logs",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = true
        };

        try
        {
            var response = await _client!.PostAsJsonAsync("/api/projects", projectRequest);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var createdProject = System.Text.Json.JsonSerializer.Deserialize<ProjectResponse>(
                    content,
                    new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                _projectId = createdProject!.Id;
            }
            else
            {
                throw new InvalidOperationException($"Failed to create test project: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Failed during test initialization", ex);
        }
    }

    public async Task DisposeAsync()
    {
        _client?.Dispose();
        _factory?.Dispose();
        await Task.CompletedTask;
    }

    #region Create DailyLog Tests

    [Fact]
    public async Task CreateDailyLog_WhenRequestIsValid_ReturnsCreatedAtActionResult()
    {
        // Arrange
        var request = new CreateDailyLogRequest
        {
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            ProjectId = _projectId,
            TaskDescription = "Implemented new feature",
            TimeSpentMinutes = 120,
            OutputDescription = "Added authentication system",
            RevenueGenerated = 100m,
            Note = "Completed on schedule"
        };

        // Act
        var response = await _client!.PostAsJsonAsync("/api/dailylogs", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<DailyLogResponse>();
        Assert.NotNull(result);
        Assert.Equal("Implemented new feature", result.TaskDescription);
        Assert.Equal(120, result.TimeSpentMinutes);
        Assert.Equal("Added authentication system", result.OutputDescription);
        Assert.Equal(100m, result.RevenueGenerated);
        Assert.NotEqual(Guid.Empty, result.Id);
    }

    [Fact]
    public async Task CreateDailyLog_WhenTaskDescriptionIsEmpty_ReturnsBadRequest()
    {
        // Arrange
        var request = new CreateDailyLogRequest
        {
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            ProjectId = _projectId,
            TaskDescription = "",
            TimeSpentMinutes = 60,
            OutputDescription = "Output",
            RevenueGenerated = 0
        };

        // Act
        var response = await _client!.PostAsJsonAsync("/api/dailylogs", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("task description", content, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateDailyLog_WhenTaskDescriptionExceeds500Characters_ReturnsBadRequest()
    {
        // Arrange
        var longDescription = new string('A', 501);
        var request = new CreateDailyLogRequest
        {
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            ProjectId = _projectId,
            TaskDescription = longDescription,
            TimeSpentMinutes = 60,
            OutputDescription = "Output",
            RevenueGenerated = 0
        };

        // Act
        var response = await _client!.PostAsJsonAsync("/api/dailylogs", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("500 characters", content);
    }

    [Fact]
    public async Task CreateDailyLog_WhenOutputDescriptionIsEmpty_ReturnsBadRequest()
    {
        // Arrange
        var request = new CreateDailyLogRequest
        {
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            ProjectId = _projectId,
            TaskDescription = "Task",
            TimeSpentMinutes = 60,
            OutputDescription = "",
            RevenueGenerated = 0
        };

        // Act
        var response = await _client!.PostAsJsonAsync("/api/dailylogs", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("output description", content, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateDailyLog_WhenOutputDescriptionExceeds1000Characters_ReturnsBadRequest()
    {
        // Arrange
        var longOutput = new string('A', 1001);
        var request = new CreateDailyLogRequest
        {
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            ProjectId = _projectId,
            TaskDescription = "Task",
            TimeSpentMinutes = 60,
            OutputDescription = longOutput,
            RevenueGenerated = 0
        };

        // Act
        var response = await _client!.PostAsJsonAsync("/api/dailylogs", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("1000 characters", content);
    }

    [Fact]
    public async Task CreateDailyLog_WhenTimeSpentIsZero_ReturnsBadRequest()
    {
        // Arrange
        var request = new CreateDailyLogRequest
        {
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            ProjectId = _projectId,
            TaskDescription = "Task",
            TimeSpentMinutes = 0,
            OutputDescription = "Output",
            RevenueGenerated = 0
        };

        // Act
        var response = await _client!.PostAsJsonAsync("/api/dailylogs", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("greater than 0", content);
    }

    [Fact]
    public async Task CreateDailyLog_WhenTimeSpentIsNegative_ReturnsBadRequest()
    {
        // Arrange
        var request = new CreateDailyLogRequest
        {
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            ProjectId = _projectId,
            TaskDescription = "Task",
            TimeSpentMinutes = -10,
            OutputDescription = "Output",
            RevenueGenerated = 0
        };

        // Act
        var response = await _client!.PostAsJsonAsync("/api/dailylogs", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateDailyLog_WhenProjectDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        var request = new CreateDailyLogRequest
        {
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            ProjectId = Guid.NewGuid(),
            TaskDescription = "Task",
            TimeSpentMinutes = 60,
            OutputDescription = "Output",
            RevenueGenerated = 0
        };

        // Act
        var response = await _client!.PostAsJsonAsync("/api/dailylogs", request);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("not found", content, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CreateDailyLog_WhenNoteExceeds500Characters_ReturnsBadRequest()
    {
        // Arrange
        var longNote = new string('A', 501);
        var request = new CreateDailyLogRequest
        {
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            ProjectId = _projectId,
            TaskDescription = "Task",
            TimeSpentMinutes = 60,
            OutputDescription = "Output",
            RevenueGenerated = 0,
            Note = longNote
        };

        // Act
        var response = await _client!.PostAsJsonAsync("/api/dailylogs", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreateDailyLog_WithWhitespaceTriming_TrimsAndCreatesLog()
    {
        // Arrange
        var request = new CreateDailyLogRequest
        {
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            ProjectId = _projectId,
            TaskDescription = "  Task with spaces  ",
            TimeSpentMinutes = 60,
            OutputDescription = "  Output with spaces  ",
            RevenueGenerated = 0,
            Note = "  Note with spaces  "
        };

        // Act
        var response = await _client!.PostAsJsonAsync("/api/dailylogs", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<DailyLogResponse>();
        Assert.NotNull(result);
        Assert.Equal("Task with spaces", result.TaskDescription);
        Assert.Equal("Output with spaces", result.OutputDescription);
        Assert.Equal("Note with spaces", result.Note);
    }

    #endregion

    #region Get DailyLog Tests

    [Fact]
    public async Task GetDailyLogById_WhenLogExists_ReturnsOkResult()
    {
        // Arrange
        var createRequest = new CreateDailyLogRequest
        {
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            ProjectId = _projectId,
            TaskDescription = "Test Task",
            TimeSpentMinutes = 90,
            OutputDescription = "Test Output",
            RevenueGenerated = 50m
        };

        var createResponse = await _client!.PostAsJsonAsync("/api/dailylogs", createRequest);
        var createdLog = await createResponse.Content.ReadFromJsonAsync<DailyLogResponse>();
        Assert.NotNull(createdLog);

        // Act
        var getResponse = await _client.GetAsync($"/api/dailylogs/{createdLog.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var result = await getResponse.Content.ReadFromJsonAsync<DailyLogResponse>();
        Assert.NotNull(result);
        Assert.Equal(createdLog.Id, result.Id);
        Assert.Equal("Test Task", result.TaskDescription);
    }

    [Fact]
    public async Task GetDailyLogById_WhenLogDoesNotExist_ReturnsNotFound()
    {
        // Act
        var response = await _client!.GetAsync($"/api/dailylogs/{Guid.NewGuid()}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetLogsForProject_WhenProjectHasLogs_ReturnsOkWithList()
    {
        // Arrange - Create multiple logs
        for (int i = 0; i < 3; i++)
        {
            var request = new CreateDailyLogRequest
            {
                Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-i)),
                ProjectId = _projectId,
                TaskDescription = $"Task {i}",
                TimeSpentMinutes = 60 + (i * 30),
                OutputDescription = $"Output {i}",
                RevenueGenerated = 50m + (i * 10)
            };

            await _client!.PostAsJsonAsync("/api/dailylogs", request);
        }

        // Act
        var response = await _client.GetAsync($"/api/dailylogs/project/{_projectId}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<List<DailyLogResponse>>();
        Assert.NotNull(result);
        Assert.Equal(3, result.Count);
    }

    [Fact]
    public async Task GetLogsForProject_WhenProjectDoesNotExist_ReturnsNotFound()
    {
        // Act
        var response = await _client!.GetAsync($"/api/dailylogs/project/{Guid.NewGuid()}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetLogsForProjectByDateRange_WhenLogsExistInRange_ReturnsOkWithList()
    {
        // Arrange - Create logs on different dates
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        for (int i = 0; i < 5; i++)
        {
            var request = new CreateDailyLogRequest
            {
                Date = today.AddDays(-i),
                ProjectId = _projectId,
                TaskDescription = $"Task {i}",
                TimeSpentMinutes = 60,
                OutputDescription = $"Output {i}",
                RevenueGenerated = 50m
            };

            await _client!.PostAsJsonAsync("/api/dailylogs", request);
        }

        // Act - Query for logs from 3 days ago to today
        var startDate = today.AddDays(-3);
        var endDate = today;
        var response = await _client.GetAsync($"/api/dailylogs/project/{_projectId}/range?startDate={startDate:yyyy-MM-dd}&endDate={endDate:yyyy-MM-dd}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<List<DailyLogResponse>>();
        Assert.NotNull(result);
        Assert.Equal(4, result.Count); // 3 days ago + today = 4 logs
    }

    [Fact]
    public async Task GetLogsForProjectByDateRange_WhenStartDateAfterEndDate_ReturnsBadRequest()
    {
        // Arrange
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var startDate = today.AddDays(2);
        var endDate = today;

        // Act
        var response = await _client!.GetAsync($"/api/dailylogs/project/{_projectId}/range?startDate={startDate:yyyy-MM-dd}&endDate={endDate:yyyy-MM-dd}");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("before or equal", content);
    }

    #endregion

    #region Update DailyLog Tests

    [Fact]
    public async Task UpdateDailyLog_WhenRequestIsValid_ReturnsOkWithUpdatedLog()
    {
        // Arrange
        var createRequest = new CreateDailyLogRequest
        {
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            ProjectId = _projectId,
            TaskDescription = "Original Task",
            TimeSpentMinutes = 60,
            OutputDescription = "Original Output",
            RevenueGenerated = 50m
        };

        var createResponse = await _client!.PostAsJsonAsync("/api/dailylogs", createRequest);
        var createdLog = await createResponse.Content.ReadFromJsonAsync<DailyLogResponse>();
        Assert.NotNull(createdLog);

        var updateRequest = new UpdateDailyLogRequest
        {
            TimeSpentMinutes = 120,
            OutputDescription = "Updated Output",
            RevenueGenerated = 100m,
            Note = "Updated note"
        };

        // Act
        var updateResponse = await _client.PutAsJsonAsync($"/api/dailylogs/{createdLog.Id}", updateRequest);

        // Assert
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        var result = await updateResponse.Content.ReadFromJsonAsync<DailyLogResponse>();
        Assert.NotNull(result);
        Assert.Equal(120, result.TimeSpentMinutes);
        Assert.Equal("Updated Output", result.OutputDescription);
        Assert.Equal(100m, result.RevenueGenerated);
        Assert.Equal("Updated note", result.Note);
    }

    [Fact]
    public async Task UpdateDailyLog_WhenTimeSpentIsZero_ReturnsBadRequest()
    {
        // Arrange
        var createRequest = new CreateDailyLogRequest
        {
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            ProjectId = _projectId,
            TaskDescription = "Task",
            TimeSpentMinutes = 60,
            OutputDescription = "Output",
            RevenueGenerated = 0
        };

        var createResponse = await _client!.PostAsJsonAsync("/api/dailylogs", createRequest);
        var createdLog = await createResponse.Content.ReadFromJsonAsync<DailyLogResponse>();
        Assert.NotNull(createdLog);

        var updateRequest = new UpdateDailyLogRequest
        {
            TimeSpentMinutes = 0,
            OutputDescription = "Output",
            RevenueGenerated = 0
        };

        // Act
        var updateResponse = await _client.PutAsJsonAsync($"/api/dailylogs/{createdLog.Id}", updateRequest);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, updateResponse.StatusCode);
    }

    [Fact]
    public async Task UpdateDailyLog_WhenLogDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        var updateRequest = new UpdateDailyLogRequest
        {
            TimeSpentMinutes = 120,
            OutputDescription = "Output",
            RevenueGenerated = 0
        };

        // Act
        var response = await _client!.PutAsJsonAsync($"/api/dailylogs/{Guid.NewGuid()}", updateRequest);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    #endregion

    #region Delete DailyLog Tests

    [Fact]
    public async Task DeleteDailyLog_WhenLogExists_ReturnsBadRequest()
    {
        // Delete is not implemented, so it should return BadRequest
        // Arrange
        var createRequest = new CreateDailyLogRequest
        {
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            ProjectId = _projectId,
            TaskDescription = "Task",
            TimeSpentMinutes = 60,
            OutputDescription = "Output",
            RevenueGenerated = 0
        };

        var createResponse = await _client!.PostAsJsonAsync("/api/dailylogs", createRequest);
        var createdLog = await createResponse.Content.ReadFromJsonAsync<DailyLogResponse>();
        Assert.NotNull(createdLog);

        // Act
        var response = await _client.DeleteAsync($"/api/dailylogs/{createdLog.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("not currently supported", content);
    }

    #endregion
}
