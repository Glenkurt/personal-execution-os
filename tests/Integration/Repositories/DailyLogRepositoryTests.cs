using Xunit;
using Microsoft.EntityFrameworkCore;
using PersonalExecutionOS.Core.Models;
using PersonalExecutionOS.Infrastructure.Data;
using PersonalExecutionOS.Infrastructure.Repositories;
using PersonalExecutionOS.Tests;

namespace PersonalExecutionOS.Tests.Integration.Repositories;

/// <summary>
/// Integration tests for DailyLogRepository.
/// </summary>
public class DailyLogRepositoryTests : IAsyncLifetime
{
    private ApplicationDbContext _context = null!;
    private DailyLogRepository _repository = null!;
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

        var logger = new FakeLogger<DailyLogRepository>();
        _repository = new DailyLogRepository(_context, logger);
    }

    public async Task DisposeAsync()
    {
        await _context.DisposeAsync();
    }

    [Fact]
    public async Task CreateAsync_WithValidLog_ReturnsSuccessAndStoresLog()
    {
        // Arrange
        var log = new DailyLog
        {
            Date = DateOnly.FromDateTime(DateTime.Today),
            ProjectId = _projectId,
            TaskDescription = "Built auth",
            TimeSpentMinutes = 120,
            OutputDescription = "Auth API working",
            RevenueGenerated = 0
        };

        // Act
        var result = await _repository.CreateAsync(log);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);

        var storedLog = await _context.DailyLogs.FindAsync(log.Id);
        Assert.NotNull(storedLog);
        Assert.Equal("Built auth", storedLog.TaskDescription);
    }

    [Fact]
    public async Task CreateAsync_WithInvalidTimeSpent_ReturnsFail()
    {
        // Arrange
        var log = new DailyLog
        {
            Date = DateOnly.FromDateTime(DateTime.Today),
            ProjectId = _projectId,
            TaskDescription = "Test",
            TimeSpentMinutes = 0,
            OutputDescription = "Output",
            RevenueGenerated = 0
        };

        // Act
        var result = await _repository.CreateAsync(log);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Contains("Time spent must be greater than 0", result.Error!);
    }

    [Fact]
    public async Task CreateAsync_WithFutureDate_ReturnsFail()
    {
        // Arrange
        var log = new DailyLog
        {
            Date = DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
            ProjectId = _projectId,
            TaskDescription = "Test",
            TimeSpentMinutes = 60,
            OutputDescription = "Output",
            RevenueGenerated = 0
        };

        // Act
        var result = await _repository.CreateAsync(log);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Contains("cannot be in the future", result.Error!);
    }

    [Fact]
    public async Task CreateAsync_WithNonExistentProject_ReturnsFail()
    {
        // Arrange
        var log = new DailyLog
        {
            Date = DateOnly.FromDateTime(DateTime.Today),
            ProjectId = Guid.NewGuid(),
            TaskDescription = "Test",
            TimeSpentMinutes = 60,
            OutputDescription = "Output",
            RevenueGenerated = 0
        };

        // Act
        var result = await _repository.CreateAsync(log);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Contains("not found", result.Error!);
    }

    [Fact]
    public async Task GetByProjectIdAsync_ReturnsLogsForProject()
    {
        // Arrange
        _context.DailyLogs.AddRange(
            new DailyLog { Date = DateOnly.FromDateTime(DateTime.Today.AddDays(-1)), ProjectId = _projectId, TaskDescription = "Log 1", TimeSpentMinutes = 60, OutputDescription = "Out 1" },
            new DailyLog { Date = DateOnly.FromDateTime(DateTime.Today), ProjectId = _projectId, TaskDescription = "Log 2", TimeSpentMinutes = 120, OutputDescription = "Out 2" }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByProjectIdAsync(_projectId);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(2, result.Value.Count);
        Assert.Equal("Log 2", result.Value[0].TaskDescription); // Most recent first
    }

    [Fact]
    public async Task GetByDateRangeAsync_FiltersLogsByDateRange()
    {
        // Arrange
        var today = DateOnly.FromDateTime(DateTime.Today);
        _context.DailyLogs.AddRange(
            new DailyLog { Date = today.AddDays(-5), ProjectId = _projectId, TaskDescription = "Old", TimeSpentMinutes = 60, OutputDescription = "Old log" },
            new DailyLog { Date = today.AddDays(-1), ProjectId = _projectId, TaskDescription = "In range", TimeSpentMinutes = 60, OutputDescription = "In range" },
            new DailyLog { Date = today, ProjectId = _projectId, TaskDescription = "Today", TimeSpentMinutes = 60, OutputDescription = "Today log" }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByDateRangeAsync(today.AddDays(-2), today);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(2, result.Value.Count);
    }

    [Fact]
    public async Task UpdateAsync_WithinTwentyFourHours_UpdatesLog()
    {
        // Arrange
        var log = new DailyLog
        {
            Date = DateOnly.FromDateTime(DateTime.Today),
            ProjectId = _projectId,
            TaskDescription = "Original",
            TimeSpentMinutes = 60,
            OutputDescription = "Original output",
            RevenueGenerated = 0,
            CreatedAt = DateTime.UtcNow.AddHours(-1) // Created 1 hour ago
        };
        _context.DailyLogs.Add(log);
        await _context.SaveChangesAsync();

        // Act
        log.TaskDescription = "Updated";
        log.TimeSpentMinutes = 120;
        var result = await _repository.UpdateAsync(log);

        // Assert
        Assert.True(result.IsSuccess);
        var updated = await _context.DailyLogs.FindAsync(log.Id);
        Assert.Equal("Updated", updated!.TaskDescription);
        Assert.Equal(120, updated.TimeSpentMinutes);
    }

    [Fact]
    public async Task UpdateAsync_OlderThanTwentyFourHours_ReturnsFail()
    {
        // Arrange
        var log = new DailyLog
        {
            Date = DateOnly.FromDateTime(DateTime.Today),
            ProjectId = _projectId,
            TaskDescription = "Original",
            TimeSpentMinutes = 60,
            OutputDescription = "Original output",
            RevenueGenerated = 0,
            CreatedAt = DateTime.UtcNow.AddHours(-25) // Created 25 hours ago
        };
        _context.DailyLogs.Add(log);
        await _context.SaveChangesAsync();

        // Act
        log.TaskDescription = "Updated";
        var result = await _repository.UpdateAsync(log);

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Contains("Cannot edit log older than 24 hours", result.Error!);
    }
}
