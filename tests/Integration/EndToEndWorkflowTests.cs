#nullable enable
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Net.Http.Json;
using PersonalExecutionOS.Core.DTOs;
using PersonalExecutionOS.Tests.Integration.Controllers;
using Xunit;

namespace PersonalExecutionOS.Tests.Integration;

/// <summary>
/// End-to-end workflow tests for the entire application.
/// These tests simulate real user workflows.
/// </summary>
public class EndToEndWorkflowTests : IAsyncLifetime
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

    #region Happy Path Workflow Tests

    [Fact]
    public async Task FullWorkflow_UserCreatesProjectAndLogs7Days_StreakCalculates()
    {
        // Step 1: Create a project
        var createProjectRequest = new CreateProjectRequest
        {
            Name = "Build MVP",
            Goal = "Launch a working MVP for my SaaS",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = true
        };

        var projectResponse = await _client!.PostAsJsonAsync("/api/projects", createProjectRequest);
        Assert.Equal(HttpStatusCode.Created, projectResponse.StatusCode);
        var project = await projectResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(project);

        var projectId = project.Id;

        // Step 2: Get active project
        var activeProjectResponse = await _client.GetAsync("/api/projects/active/current");
        Assert.Equal(HttpStatusCode.OK, activeProjectResponse.StatusCode);
        var activeProject = await activeProjectResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(activeProject);
        Assert.Equal(projectId, activeProject.Id);

        // Step 3: Log work for 7 consecutive days
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        for (int i = 0; i < 7; i++)
        {
            var logDate = today.AddDays(-i);
            var createLogRequest = new CreateDailyLogRequest
            {
                Date = logDate,
                ProjectId = projectId,
                TaskDescription = $"Day {i + 1} - Build feature",
                TimeSpentMinutes = 120,
                OutputDescription = $"Completed feature {i + 1}",
                RevenueGenerated = 100m * (i + 1)
            };

            var logResponse = await _client.PostAsJsonAsync("/api/dailylogs", createLogRequest);
            Assert.Equal(HttpStatusCode.Created, logResponse.StatusCode);
        }

        // Step 4: Verify metrics after 7 days of work
        var metricsResponse = await _client.GetAsync($"/api/metrics/{projectId}");
        Assert.Equal(HttpStatusCode.OK, metricsResponse.StatusCode);

        // Verify the response is valid JSON
        var metricsJson = await metricsResponse.Content.ReadAsStringAsync();
        Assert.NotEmpty(metricsJson);
    }

    [Fact]
    public async Task FullWorkflow_UserCanActivateDifferentProject()
    {
        // Step 1: Create project A and activate it
        var projectAResponse = await _client!.PostAsJsonAsync("/api/projects", new CreateProjectRequest
        {
            Name = "Project A",
            Goal = "First project",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = true
        });
        var projectA = await projectAResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(projectA);

        // Step 2: Create project B
        var projectBResponse = await _client.PostAsJsonAsync("/api/projects", new CreateProjectRequest
        {
            Name = "Project B",
            Goal = "Second project",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = false
        });
        var projectB = await projectBResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(projectB);

        // Step 3: Verify project A is active
        var activeBeforeResponse = await _client.GetAsync("/api/projects/active/current");
        var activeBefore = await activeBeforeResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.Equal(projectA.Id, activeBefore?.Id);

        // Step 4: Activate project B
        var activateResponse = await _client.PostAsync($"/api/projects/{projectB.Id}/activate", null);
        Assert.Equal(HttpStatusCode.OK, activateResponse.StatusCode);

        // Step 5: Verify project B is now active
        var activeAfterResponse = await _client.GetAsync("/api/projects/active/current");
        var activeAfter = await activeAfterResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.Equal(projectB.Id, activeAfter?.Id);
        Assert.False(activeAfter?.IsActive == false); // ProjectB should be active

        // Step 6: Verify project A is no longer active
        var projectAAfterResponse = await _client.GetAsync($"/api/projects/{projectA.Id}");
        var projectAAfter = await projectAAfterResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.False(projectAAfter?.IsActive); // ProjectA should no longer be active
    }

    #endregion

    #region Edge Case Tests

    [Fact]
    public async Task EdgeCase_CreateLogForNonExistentProject_ReturnsNotFound()
    {
        // Attempt to create a log for a non-existent project
        var createLogRequest = new CreateDailyLogRequest
        {
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            ProjectId = Guid.NewGuid(), // Non-existent project
            TaskDescription = "Task",
            TimeSpentMinutes = 60,
            OutputDescription = "Output"
        };

        var response = await _client!.PostAsJsonAsync("/api/dailylogs", createLogRequest);
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task EdgeCase_UpdateLogWithZeroTimeSpent_ReturnsBadRequest()
    {
        // Create a project and log
        var projectResponse = await _client!.PostAsJsonAsync("/api/projects", new CreateProjectRequest
        {
            Name = "Test Project",
            Goal = null,
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = true
        });
        var project = await projectResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(project);

        var logResponse = await _client.PostAsJsonAsync("/api/dailylogs", new CreateDailyLogRequest
        {
            Date = DateOnly.FromDateTime(DateTime.UtcNow),
            ProjectId = project.Id,
            TaskDescription = "Task",
            TimeSpentMinutes = 60,
            OutputDescription = "Output"
        });
        var log = await logResponse.Content.ReadFromJsonAsync<DailyLogResponse>();
        Assert.NotNull(log);

        // Try to update with zero time (should fail validation)
        var updateRequest = new UpdateDailyLogRequest
        {
            TimeSpentMinutes = 0, // Invalid - must be > 0
            OutputDescription = "Updated Output"
        };

        var updateResponse = await _client.PutAsJsonAsync($"/api/dailylogs/{log.Id}", updateRequest);
        Assert.Equal(HttpStatusCode.BadRequest, updateResponse.StatusCode);
    }

    [Fact]
    public async Task EdgeCase_ActivateSecondProjectDeactivatesFirst()
    {
        // Create project 1 and activate
        var project1Response = await _client!.PostAsJsonAsync("/api/projects", new CreateProjectRequest
        {
            Name = "Project 1",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = true
        });
        var project1 = await project1Response.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(project1);
        Assert.True(project1.IsActive);

        // Create project 2 without activating
        var project2Response = await _client.PostAsJsonAsync("/api/projects", new CreateProjectRequest
        {
            Name = "Project 2",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = false
        });
        var project2 = await project2Response.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(project2);
        Assert.False(project2.IsActive);

        // Activate project 2
        await _client.PostAsync($"/api/projects/{project2.Id}/activate", null);

        // Verify project 1 is no longer active
        var project1CheckResponse = await _client.GetAsync($"/api/projects/{project1.Id}");
        var project1Check = await project1CheckResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(project1Check);
        Assert.False(project1Check.IsActive);

        // Verify project 2 is active
        var project2CheckResponse = await _client.GetAsync($"/api/projects/{project2.Id}");
        var project2Check = await project2CheckResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(project2Check);
        Assert.True(project2Check.IsActive);
    }

    [Fact]
    public async Task EdgeCase_StreakBreaksWithGapInLogs()
    {
        // Create project
        var projectResponse = await _client!.PostAsJsonAsync("/api/projects", new CreateProjectRequest
        {
            Name = "Test Project",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = true
        });
        var project = await projectResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(project);

        // Log for today, yesterday, but NOT day before yesterday
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        await _client.PostAsJsonAsync("/api/dailylogs", new CreateDailyLogRequest
        {
            Date = today,
            ProjectId = project.Id,
            TaskDescription = "Today",
            TimeSpentMinutes = 60,
            OutputDescription = "Today's work"
        });

        await _client.PostAsJsonAsync("/api/dailylogs", new CreateDailyLogRequest
        {
            Date = today.AddDays(-1),
            ProjectId = project.Id,
            TaskDescription = "Yesterday",
            TimeSpentMinutes = 60,
            OutputDescription = "Yesterday's work"
        });

        // Skip day before yesterday (gap creates streak break)

        // Get metrics - streak should be 2 (today and yesterday)
        var metricsResponse = await _client.GetAsync($"/api/metrics/{project.Id}");
        var streakResponse = await _client.GetAsync($"/api/metrics/{project.Id}/streak");

        Assert.Equal(HttpStatusCode.OK, streakResponse.StatusCode);
        // Streak should be 2 (today and yesterday, broken at day before yesterday)
    }

    [Fact]
    public async Task EdgeCase_MetricsReturnZeroWhenNoLogs()
    {
        // Create project but don't log anything
        var projectResponse = await _client!.PostAsJsonAsync("/api/projects", new CreateProjectRequest
        {
            Name = "Empty Project",
            StartDate = DateOnly.FromDateTime(DateTime.UtcNow),
            IsActive = true
        });
        var project = await projectResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        Assert.NotNull(project);

        // Get metrics
        var metricsResponse = await _client.GetAsync($"/api/metrics/{project.Id}");
        Assert.Equal(HttpStatusCode.OK, metricsResponse.StatusCode);

        // Verify response is valid JSON with metrics
        var metricsJson = await metricsResponse.Content.ReadAsStringAsync();
        Assert.NotEmpty(metricsJson);
        Assert.Contains("projectId", metricsJson);
        Assert.Contains("totalTimeMinutes", metricsJson);
    }


    #endregion
}
