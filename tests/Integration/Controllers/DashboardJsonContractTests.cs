#nullable enable
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using PersonalExecutionOS.Core.DTOs;
using Xunit;

namespace PersonalExecutionOS.Tests.Integration.Controllers;

public sealed class DashboardJsonContractTests : IAsyncLifetime
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

    [Fact]
    public async Task GetActiveProject_WhenProjectExists_ReturnsPascalCaseId()
    {
        // Arrange
        var created = await CreateProjectAsync(name: "Contract Project", isActive: true);

        // Act
        var response = await _client!.GetAsync("/api/projects/active/current");
        var json = await response.Content.ReadAsStringAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("\"Id\"", json);
        Assert.Contains(created.Id.ToString(), json);
    }

    [Fact]
    public async Task GetAllMetrics_WhenProjectExists_ResponseContainsPascalCaseTotalTimeMinutes()
    {
        // Arrange
        var project = await CreateProjectAsync(name: "Metrics Contract Project", isActive: true);

        // Act
        var response = await _client!.GetAsync($"/api/metrics/{project.Id}");
        var json = await response.Content.ReadAsStringAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("\"TotalTimeMinutes\"", json);
    }

    [Fact]
    public async Task GetDailyLogsByRange_WhenProjectHasLogs_ResponseItemsContainPascalCaseTaskDescription()
    {
        // Arrange
        var project = await CreateProjectAsync(name: "Logs Contract Project", isActive: true);

        var createLog = new CreateDailyLogRequest
        {
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            ProjectId = project.Id,
            TaskDescription = "Task A",
            TimeSpentMinutes = 30,
            OutputDescription = "Output A",
            RevenueGenerated = 0m,
            Note = null
        };

        var createResponse = await _client!.PostAsJsonAsync("/api/dailylogs", createLog);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        var start = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));
        var end = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));

        // Act
        var response = await _client!.GetAsync($"/api/dailylogs/project/{project.Id}/range?startDate={start:yyyy-MM-dd}&endDate={end:yyyy-MM-dd}");
        var json = await response.Content.ReadAsStringAsync();

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("\"TaskDescription\"", json);
        Assert.Contains("Task A", json);
    }

    private async Task<ProjectResponse> CreateProjectAsync(string name, bool isActive)
    {
        var request = new CreateProjectRequest
        {
            Name = name,
            Goal = null,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = isActive
        };

        var response = await _client!.PostAsJsonAsync("/api/projects", request);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(result);
        return result!;
    }
}
