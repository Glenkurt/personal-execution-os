using Xunit;
using Microsoft.EntityFrameworkCore;
using PersonalExecutionOS.Core.Interfaces;
using PersonalExecutionOS.Core.Models;
using PersonalExecutionOS.Core.Services;
using PersonalExecutionOS.Infrastructure.Data;
using PersonalExecutionOS.Tests;

namespace PersonalExecutionOS.Tests.Unit.Core.Services;

/// <summary>
/// Unit tests for MetricsService.
/// </summary>
public class MetricsServiceTests : IAsyncLifetime
{
    private ApplicationDbContext _context = null!;
    private MetricsService _service = null!;
    private Guid _projectId = Guid.NewGuid();

    public async Task InitializeAsync()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        _context = new ApplicationDbContext(options);
        await _context.Database.EnsureCreatedAsync();

        // Create a test project
        var project = new Project
        {
            Id = _projectId,
            Name = "Test Project",
            StartDate = DateOnly.FromDateTime(DateTime.Today),
            IsActive = true
        };
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        var logger = new FakeLogger<MetricsService>();
        _service = new MetricsService(_context, logger);
    }

    public async Task DisposeAsync()
    {
        await _context.DisposeAsync();
    }

    [Fact]
    public async Task CalculateTotalTimeAsync_WithMultipleLogs_ReturnsSumOfTimeSpent()
    {
        // Arrange
        var today = DateOnly.FromDateTime(DateTime.Today);
        _context.DailyLogs.AddRange(
            new DailyLog { Date = today, ProjectId = _projectId, TaskDescription = "Task 1", TimeSpentMinutes = 60, OutputDescription = "Output 1" },
            new DailyLog { Date = today.AddDays(-1), ProjectId = _projectId, TaskDescription = "Task 2", TimeSpentMinutes = 120, OutputDescription = "Output 2" },
            new DailyLog { Date = today.AddDays(-2), ProjectId = _projectId, TaskDescription = "Task 3", TimeSpentMinutes = 45, OutputDescription = "Output 3" }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.CalculateTotalTimeAsync(_projectId);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(225, result.Value); // 60 + 120 + 45
    }

    [Fact]
    public async Task CalculateTotalTimeAsync_WithNoLogs_ReturnsZero()
    {
        // Act
        var result = await _service.CalculateTotalTimeAsync(_projectId);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(0, result.Value);
    }

    [Fact]
    public async Task CalculateTotalRevenueAsync_WithMultipleLogs_ReturnsSumOfRevenue()
    {
        // Arrange
        var today = DateOnly.FromDateTime(DateTime.Today);
        _context.DailyLogs.AddRange(
            new DailyLog { Date = today, ProjectId = _projectId, TaskDescription = "Task 1", TimeSpentMinutes = 60, OutputDescription = "Output 1", RevenueGenerated = 100m },
            new DailyLog { Date = today.AddDays(-1), ProjectId = _projectId, TaskDescription = "Task 2", TimeSpentMinutes = 120, OutputDescription = "Output 2", RevenueGenerated = 50m },
            new DailyLog { Date = today.AddDays(-2), ProjectId = _projectId, TaskDescription = "Task 3", TimeSpentMinutes = 45, OutputDescription = "Output 3", RevenueGenerated = 0m }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.CalculateTotalRevenueAsync(_projectId);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(150m, result.Value); // 100 + 50 + 0
    }

    [Fact]
    public async Task CalculateTotalRevenueAsync_WithNoLogs_ReturnsZero()
    {
        // Act
        var result = await _service.CalculateTotalRevenueAsync(_projectId);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(0m, result.Value);
    }

    [Fact]
    public async Task CalculateRevenuePerHourAsync_WithValidLogs_ReturnsCorrectRate()
    {
        // Arrange: 225 minutes = 3.75 hours, revenue = 150
        // Expected: 150 / 3.75 = 40 per hour
        var today = DateOnly.FromDateTime(DateTime.Today);
        _context.DailyLogs.AddRange(
            new DailyLog { Date = today, ProjectId = _projectId, TaskDescription = "Task 1", TimeSpentMinutes = 60, OutputDescription = "Output 1", RevenueGenerated = 100m },
            new DailyLog { Date = today.AddDays(-1), ProjectId = _projectId, TaskDescription = "Task 2", TimeSpentMinutes = 120, OutputDescription = "Output 2", RevenueGenerated = 50m },
            new DailyLog { Date = today.AddDays(-2), ProjectId = _projectId, TaskDescription = "Task 3", TimeSpentMinutes = 45, OutputDescription = "Output 3", RevenueGenerated = 0m }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.CalculateRevenuePerHourAsync(_projectId);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(40m, result.Value); // 150 / 225 * 60 = 40
    }

    [Fact]
    public async Task CalculateRevenuePerHourAsync_WithNoLogs_ReturnsZero()
    {
        // Act
        var result = await _service.CalculateRevenuePerHourAsync(_projectId);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(0m, result.Value);
    }

    [Fact]
    public async Task CalculateRevenuePerHourAsync_WithZeroTimeSpent_ReturnsZero()
    {
        // Arrange - This shouldn't happen in practice due to validation, but test for safety
        var today = DateOnly.FromDateTime(DateTime.Today);
        var log = new DailyLog
        {
            Date = today,
            ProjectId = _projectId,
            TaskDescription = "Task",
            TimeSpentMinutes = 0,
            OutputDescription = "Output",
            RevenueGenerated = 100m
        };
        _context.DailyLogs.Add(log);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.CalculateRevenuePerHourAsync(_projectId);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(0m, result.Value);
    }

    [Fact]
    public async Task CalculateDaysWorkedAsync_WithMultipleLogs_ReturnsDistinctDays()
    {
        // Arrange
        var today = DateOnly.FromDateTime(DateTime.Today);
        _context.DailyLogs.AddRange(
            new DailyLog { Date = today, ProjectId = _projectId, TaskDescription = "Task 1", TimeSpentMinutes = 60, OutputDescription = "Output 1" },
            new DailyLog { Date = today, ProjectId = _projectId, TaskDescription = "Task 1b", TimeSpentMinutes = 30, OutputDescription = "Output 1b" }, // Same day
            new DailyLog { Date = today.AddDays(-1), ProjectId = _projectId, TaskDescription = "Task 2", TimeSpentMinutes = 120, OutputDescription = "Output 2" },
            new DailyLog { Date = today.AddDays(-2), ProjectId = _projectId, TaskDescription = "Task 3", TimeSpentMinutes = 45, OutputDescription = "Output 3" }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.CalculateDaysWorkedAsync(_projectId);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(3, result.Value); // 3 distinct days
    }

    [Fact]
    public async Task CalculateDaysWorkedAsync_WithNoLogs_ReturnsZero()
    {
        // Act
        var result = await _service.CalculateDaysWorkedAsync(_projectId);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(0, result.Value);
    }

    [Fact]
    public async Task CalculateCurrentStreakAsync_WithConsecutiveDays_ReturnsCorrectStreak()
    {
        // Arrange: Today, Yesterday, 2 days ago (streak = 3)
        var today = DateOnly.FromDateTime(DateTime.Today);
        _context.DailyLogs.AddRange(
            new DailyLog { Date = today, ProjectId = _projectId, TaskDescription = "Today", TimeSpentMinutes = 60, OutputDescription = "Output" },
            new DailyLog { Date = today.AddDays(-1), ProjectId = _projectId, TaskDescription = "Yesterday", TimeSpentMinutes = 60, OutputDescription = "Output" },
            new DailyLog { Date = today.AddDays(-2), ProjectId = _projectId, TaskDescription = "2 days ago", TimeSpentMinutes = 60, OutputDescription = "Output" }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.CalculateCurrentStreakAsync(_projectId);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(3, result.Value);
    }

    [Fact]
    public async Task CalculateCurrentStreakAsync_WithBreakinStreak_ReturnsCorrectStreak()
    {
        // Arrange: Today, Yesterday, (gap), 3 days ago (streak = 2 because of gap)
        var today = DateOnly.FromDateTime(DateTime.Today);
        _context.DailyLogs.AddRange(
            new DailyLog { Date = today, ProjectId = _projectId, TaskDescription = "Today", TimeSpentMinutes = 60, OutputDescription = "Output" },
            new DailyLog { Date = today.AddDays(-1), ProjectId = _projectId, TaskDescription = "Yesterday", TimeSpentMinutes = 60, OutputDescription = "Output" },
            // Gap on today-2
            new DailyLog { Date = today.AddDays(-3), ProjectId = _projectId, TaskDescription = "3 days ago", TimeSpentMinutes = 60, OutputDescription = "Output" }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.CalculateCurrentStreakAsync(_projectId);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Value); // Only consecutive from today/yesterday
    }

    [Fact]
    public async Task CalculateCurrentStreakAsync_WithNoLogs_ReturnsZero()
    {
        // Act
        var result = await _service.CalculateCurrentStreakAsync(_projectId);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(0, result.Value);
    }

    [Fact]
    public async Task CalculateCurrentStreakAsync_WithMultipleLogsPerDay_CountsAsOneDay()
    {
        // Arrange: Multiple logs on same day should count as 1
        var today = DateOnly.FromDateTime(DateTime.Today);
        _context.DailyLogs.AddRange(
            new DailyLog { Date = today, ProjectId = _projectId, TaskDescription = "Task 1", TimeSpentMinutes = 60, OutputDescription = "Output" },
            new DailyLog { Date = today, ProjectId = _projectId, TaskDescription = "Task 2", TimeSpentMinutes = 30, OutputDescription = "Output" },
            new DailyLog { Date = today.AddDays(-1), ProjectId = _projectId, TaskDescription = "Task 3", TimeSpentMinutes = 60, OutputDescription = "Output" }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.CalculateCurrentStreakAsync(_projectId);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Value); // Not 3, but 2 distinct days
    }

    [Fact]
    public async Task GetAllMetricsAsync_ReturnsAllMetricsCorrectly()
    {
        // Arrange
        var today = DateOnly.FromDateTime(DateTime.Today);
        _context.DailyLogs.AddRange(
            new DailyLog { Date = today, ProjectId = _projectId, TaskDescription = "Task 1", TimeSpentMinutes = 60, OutputDescription = "Output 1", RevenueGenerated = 100m },
            new DailyLog { Date = today.AddDays(-1), ProjectId = _projectId, TaskDescription = "Task 2", TimeSpentMinutes = 120, OutputDescription = "Output 2", RevenueGenerated = 50m },
            new DailyLog { Date = today.AddDays(-2), ProjectId = _projectId, TaskDescription = "Task 3", TimeSpentMinutes = 45, OutputDescription = "Output 3", RevenueGenerated = 0m }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetAllMetricsAsync(_projectId);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(_projectId, result.Value.ProjectId);
        Assert.Equal(225, result.Value.TotalTimeMinutes); // 60 + 120 + 45
        Assert.Equal(150m, result.Value.TotalRevenue); // 100 + 50 + 0
        Assert.Equal(40m, result.Value.RevenuePerHour); // 150 / 225 * 60
        Assert.Equal(3, result.Value.DaysWorked); // 3 distinct days
        Assert.Equal(3, result.Value.CurrentStreak); // 3 consecutive days
    }
}
