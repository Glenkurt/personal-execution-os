#nullable enable
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Http.Json;
using PersonalExecutionOS.API.Controllers;
using PersonalExecutionOS.Core.DTOs;
using PersonalExecutionOS.Core.Interfaces;
using PersonalExecutionOS.Core.Models;
using PersonalExecutionOS.Core.Services;
using PersonalExecutionOS.Infrastructure.Data;
using PersonalExecutionOS.Infrastructure.Repositories;
using Xunit;

namespace PersonalExecutionOS.Tests.Integration.Controllers;

/// <summary>
/// Custom WebApplicationFactory that configures the test environment with In-Memory database.
/// </summary>
public class MetricsControllerWebApplicationFactory : WebApplicationFactory<Program>
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
        var testPath = typeof(MetricsControllerWebApplicationFactory).Assembly.Location;
        var dir = new DirectoryInfo(testPath);
        while (dir != null && !File.Exists(Path.Combine(dir.FullName, "PersonalExecutionOS.csproj")))
        {
            dir = dir.Parent;
        }
        return dir?.FullName ?? throw new InvalidOperationException("Could not find project root");
    }
}

public class MetricsControllerTests : IAsyncLifetime
{
    private MetricsControllerWebApplicationFactory? _factory;
    private HttpClient? _client;

    public async Task InitializeAsync()
    {
        _factory = new MetricsControllerWebApplicationFactory();
        _client = _factory.CreateClient();
        await Task.CompletedTask;
    }

    public async Task DisposeAsync()
    {
        _client?.Dispose();
        _factory?.Dispose();
        await Task.CompletedTask;
    }

    #region Helper Methods

    private async Task<ProjectResponse> CreateProjectAsync(string name = "Test Project", string? goal = null)
    {
        var request = new CreateProjectRequest
        {
            Name = name,
            Goal = goal,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = true
        };

        var response = await _client!.PostAsJsonAsync("/api/projects", request);
        var result = await response.Content.ReadFromJsonAsync<ProjectResponse>();
        return result!;
    }

    private async Task<DailyLogResponse> CreateDailyLogAsync(
        Guid projectId,
        string taskDescription = "Test task",
        int timeSpentMinutes = 60,
        string outputDescription = "Test output",
        decimal revenueGenerated = 100m,
        DateOnly? date = null)
    {
        var request = new CreateDailyLogRequest
        {
            Date = date ?? DateOnly.FromDateTime(DateTime.UtcNow),
            ProjectId = projectId,
            TaskDescription = taskDescription,
            TimeSpentMinutes = timeSpentMinutes,
            OutputDescription = outputDescription,
            RevenueGenerated = revenueGenerated
        };

        var response = await _client!.PostAsJsonAsync("/api/dailylogs", request);
        var result = await response.Content.ReadFromJsonAsync<DailyLogResponse>();
        return result!;
    }

    #endregion

    #region Get All Metrics Tests

    [Fact]
    public async Task GetAllMetrics_WhenProjectHasLogs_ReturnsMetrics()
    {
        // Arrange
        var project = await CreateProjectAsync("Test Project");
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        await CreateDailyLogAsync(project.Id, timeSpentMinutes: 120, revenueGenerated: 200m, date: today);
        await CreateDailyLogAsync(project.Id, timeSpentMinutes: 60, revenueGenerated: 100m, date: today.AddDays(-1));

        // Act
        var response = await _client!.GetAsync($"/api/metrics/{project.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<MetricsResponse>();
        Assert.NotNull(result);
        Assert.Equal(project.Id, result.ProjectId);
        Assert.Equal(180, result.TotalTimeMinutes); // 120 + 60
        Assert.Equal(300m, result.TotalRevenue); // 200 + 100
        Assert.Equal(2, result.DaysWorked);
    }

    [Fact]
    public async Task GetAllMetrics_WhenProjectHasNoLogs_ReturnsZeroMetrics()
    {
        // Arrange
        var project = await CreateProjectAsync("Empty Project");

        // Act
        var response = await _client!.GetAsync($"/api/metrics/{project.Id}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<MetricsResponse>();
        Assert.NotNull(result);
        Assert.Equal(0, result.TotalTimeMinutes);
        Assert.Equal(0m, result.TotalRevenue);
        Assert.Equal(0m, result.RevenuePerHour);
        Assert.Equal(0, result.DaysWorked);
        Assert.Equal(0, result.CurrentStreak);
    }

    [Fact]
    public async Task GetAllMetrics_WhenProjectIdIsEmpty_ReturnsBadRequest()
    {
        // Act
        var response = await _client!.GetAsync($"/api/metrics/{Guid.Empty}");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetAllMetrics_WhenProjectDoesNotExist_ReturnsNotFound()
    {
        // Act
        var response = await _client!.GetAsync($"/api/metrics/{Guid.NewGuid()}");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    #endregion

    #region Get Total Time Tests

    [Fact]
    public async Task GetTotalTime_WhenProjectHasLogs_ReturnsTotalMinutes()
    {
        // Arrange
        var project = await CreateProjectAsync("Test Project");
        await CreateDailyLogAsync(project.Id, timeSpentMinutes: 120);
        await CreateDailyLogAsync(project.Id, timeSpentMinutes: 60);

        // Act
        var response = await _client!.GetAsync($"/api/metrics/{project.Id}/time");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<IntValueResponse>();
        Assert.NotNull(result);
        Assert.Equal(180, result.Value);
    }

    [Fact]
    public async Task GetTotalTime_WhenProjectHasNoLogs_ReturnsZero()
    {
        // Arrange
        var project = await CreateProjectAsync("Empty Project");

        // Act
        var response = await _client!.GetAsync($"/api/metrics/{project.Id}/time");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<IntValueResponse>();
        Assert.NotNull(result);
        Assert.Equal(0, result.Value);
    }

    [Fact]
    public async Task GetTotalTime_WhenProjectIdIsEmpty_ReturnsBadRequest()
    {
        // Act
        var response = await _client!.GetAsync($"/api/metrics/{Guid.Empty}/time");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetTotalTime_WhenProjectDoesNotExist_ReturnsNotFound()
    {
        // Act
        var response = await _client!.GetAsync($"/api/metrics/{Guid.NewGuid()}/time");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    #endregion

    #region Get Total Revenue Tests

    [Fact]
    public async Task GetTotalRevenue_WhenProjectHasLogs_ReturnsTotalRevenue()
    {
        // Arrange
        var project = await CreateProjectAsync("Test Project");
        await CreateDailyLogAsync(project.Id, revenueGenerated: 200m);
        await CreateDailyLogAsync(project.Id, revenueGenerated: 150m);

        // Act
        var response = await _client!.GetAsync($"/api/metrics/{project.Id}/revenue");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<DecimalValueResponse>();
        Assert.NotNull(result);
        Assert.Equal(350m, result.Value);
    }

    [Fact]
    public async Task GetTotalRevenue_WhenProjectHasNoLogs_ReturnsZero()
    {
        // Arrange
        var project = await CreateProjectAsync("Empty Project");

        // Act
        var response = await _client!.GetAsync($"/api/metrics/{project.Id}/revenue");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<DecimalValueResponse>();
        Assert.NotNull(result);
        Assert.Equal(0m, result.Value);
    }

    [Fact]
    public async Task GetTotalRevenue_WhenProjectIdIsEmpty_ReturnsBadRequest()
    {
        // Act
        var response = await _client!.GetAsync($"/api/metrics/{Guid.Empty}/revenue");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetTotalRevenue_WhenProjectDoesNotExist_ReturnsNotFound()
    {
        // Act
        var response = await _client!.GetAsync($"/api/metrics/{Guid.NewGuid()}/revenue");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    #endregion

    #region Get Revenue Per Hour Tests

    [Fact]
    public async Task GetRevenuePerHour_WhenProjectHasLogs_ReturnsRevenuePerHour()
    {
        // Arrange
        var project = await CreateProjectAsync("Test Project");
        // 120 minutes (2 hours) with 200 revenue = 100 per hour
        await CreateDailyLogAsync(project.Id, timeSpentMinutes: 120, revenueGenerated: 200m);

        // Act
        var response = await _client!.GetAsync($"/api/metrics/{project.Id}/revenue-per-hour");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<DecimalValueResponse>();
        Assert.NotNull(result);
        Assert.Equal(100m, result.Value);
    }

    [Fact]
    public async Task GetRevenuePerHour_WhenProjectHasNoTime_ReturnsZero()
    {
        // Arrange
        var project = await CreateProjectAsync("Empty Project");

        // Act
        var response = await _client!.GetAsync($"/api/metrics/{project.Id}/revenue-per-hour");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<DecimalValueResponse>();
        Assert.NotNull(result);
        Assert.Equal(0m, result.Value);
    }

    [Fact]
    public async Task GetRevenuePerHour_WhenProjectIdIsEmpty_ReturnsBadRequest()
    {
        // Act
        var response = await _client!.GetAsync($"/api/metrics/{Guid.Empty}/revenue-per-hour");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetRevenuePerHour_WhenProjectDoesNotExist_ReturnsNotFound()
    {
        // Act
        var response = await _client!.GetAsync($"/api/metrics/{Guid.NewGuid()}/revenue-per-hour");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    #endregion

    #region Get Current Streak Tests

    [Fact]
    public async Task GetCurrentStreak_WhenProjectHasConsecutiveLogs_ReturnsCorrectStreak()
    {
        // Arrange
        var project = await CreateProjectAsync("Test Project");
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Create logs for today, yesterday, and day before yesterday
        await CreateDailyLogAsync(project.Id, date: today);
        await CreateDailyLogAsync(project.Id, date: today.AddDays(-1));
        await CreateDailyLogAsync(project.Id, date: today.AddDays(-2));

        // Act
        var response = await _client!.GetAsync($"/api/metrics/{project.Id}/streak");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<IntValueResponse>();
        Assert.NotNull(result);
        Assert.Equal(3, result.Value);
    }

    [Fact]
    public async Task GetCurrentStreak_WhenProjectHasGapInLogs_ReturnsStreakFromGap()
    {
        // Arrange
        var project = await CreateProjectAsync("Test Project");
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Create logs with a gap (logs for today and yesterday, but not day before)
        await CreateDailyLogAsync(project.Id, date: today);
        await CreateDailyLogAsync(project.Id, date: today.AddDays(-1));
        // No log for day before yesterday
        await CreateDailyLogAsync(project.Id, date: today.AddDays(-4));

        // Act
        var response = await _client!.GetAsync($"/api/metrics/{project.Id}/streak");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<IntValueResponse>();
        Assert.NotNull(result);
        Assert.Equal(2, result.Value); // Only today and yesterday count
    }

    [Fact]
    public async Task GetCurrentStreak_WhenProjectHasNoLogs_ReturnsZero()
    {
        // Arrange
        var project = await CreateProjectAsync("Empty Project");

        // Act
        var response = await _client!.GetAsync($"/api/metrics/{project.Id}/streak");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<IntValueResponse>();
        Assert.NotNull(result);
        Assert.Equal(0, result.Value);
    }

    [Fact]
    public async Task GetCurrentStreak_WhenProjectIdIsEmpty_ReturnsBadRequest()
    {
        // Act
        var response = await _client!.GetAsync($"/api/metrics/{Guid.Empty}/streak");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetCurrentStreak_WhenProjectDoesNotExist_ReturnsNotFound()
    {
        // Act
        var response = await _client!.GetAsync($"/api/metrics/{Guid.NewGuid()}/streak");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    #endregion
}
