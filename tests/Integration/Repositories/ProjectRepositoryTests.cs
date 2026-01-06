using Xunit;
using Microsoft.EntityFrameworkCore;
using PersonalExecutionOS.Core.Models;
using PersonalExecutionOS.Infrastructure.Data;
using PersonalExecutionOS.Infrastructure.Repositories;
using PersonalExecutionOS.Tests;

namespace PersonalExecutionOS.Tests.Integration.Repositories;

/// <summary>
/// Integration tests for ProjectRepository.
/// </summary>
public class ProjectRepositoryTests : IAsyncLifetime
{
    private ApplicationDbContext _context = null!;
    private ProjectRepository _repository = null!;

    public async Task InitializeAsync()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        _context = new ApplicationDbContext(options);
        await _context.Database.EnsureCreatedAsync();
        
        var logger = new FakeLogger<ProjectRepository>();
        _repository = new ProjectRepository(_context, logger);
    }

    public async Task DisposeAsync()
    {
        await _context.DisposeAsync();
    }

    [Fact]
    public async Task CreateAsync_WithValidProject_ReturnsSuccessAndStoresProject()
    {
        // Arrange
        var project = new Project
        {
            Name = "Test Project",
            Goal = "Build MVP",
            StartDate = DateOnly.FromDateTime(DateTime.Today),
            IsActive = true
        };

        // Act
        var result = await _repository.CreateAsync(project);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(project.Id, result.Value.Id);

        var storedProject = await _context.Projects.FindAsync(project.Id);
        Assert.NotNull(storedProject);
        Assert.Equal("Test Project", storedProject.Name);
    }

    [Fact]
    public async Task CreateAsync_WhenProjectIsActive_DeactivatesOtherProjects()
    {
        // Arrange
        var project1 = new Project { Name = "Project 1", StartDate = DateOnly.FromDateTime(DateTime.Today), IsActive = true };
        var project2 = new Project { Name = "Project 2", StartDate = DateOnly.FromDateTime(DateTime.Today), IsActive = true };

        await _repository.CreateAsync(project1);

        // Act
        await _repository.CreateAsync(project2);

        // Assert
        var updatedProject1 = await _context.Projects.FindAsync(project1.Id);
        Assert.NotNull(updatedProject1);
        Assert.False(updatedProject1.IsActive);

        var updatedProject2 = await _context.Projects.FindAsync(project2.Id);
        Assert.NotNull(updatedProject2);
        Assert.True(updatedProject2.IsActive);
    }

    [Fact]
    public async Task GetByIdAsync_WithValidId_ReturnsProject()
    {
        // Arrange
        var project = new Project { Name = "Test Project", StartDate = DateOnly.FromDateTime(DateTime.Today), IsActive = false };
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetByIdAsync(project.Id);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(project.Id, result.Value.Id);
    }

    [Fact]
    public async Task GetByIdAsync_WithInvalidId_ReturnsFailure()
    {
        // Act
        var result = await _repository.GetByIdAsync(Guid.NewGuid());

        // Assert
        Assert.False(result.IsSuccess);
        Assert.Null(result.Value);
        Assert.NotNull(result.Error);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllProjects()
    {
        // Arrange
        _context.Projects.Add(new Project { Name = "Project 1", StartDate = DateOnly.FromDateTime(DateTime.Today), IsActive = false });
        _context.Projects.Add(new Project { Name = "Project 2", StartDate = DateOnly.FromDateTime(DateTime.Today), IsActive = false });
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(2, result.Value.Count);
    }

    [Fact]
    public async Task SetActiveAsync_ActivatesProjectAndDeactivatesOthers()
    {
        // Arrange
        var project1 = new Project { Name = "Project 1", StartDate = DateOnly.FromDateTime(DateTime.Today), IsActive = true };
        var project2 = new Project { Name = "Project 2", StartDate = DateOnly.FromDateTime(DateTime.Today), IsActive = false };
        _context.Projects.AddRange(project1, project2);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.SetActiveAsync(project2.Id);

        // Assert
        Assert.True(result.IsSuccess);

        var updatedProject1 = await _context.Projects.FindAsync(project1.Id);
        Assert.False(updatedProject1!.IsActive);

        var updatedProject2 = await _context.Projects.FindAsync(project2.Id);
        Assert.True(updatedProject2!.IsActive);
    }

    [Fact]
    public async Task GetActiveAsync_ReturnsActiveProject()
    {
        // Arrange
        _context.Projects.Add(new Project { Name = "Inactive", StartDate = DateOnly.FromDateTime(DateTime.Today), IsActive = false });
        var activeProject = new Project { Name = "Active", StartDate = DateOnly.FromDateTime(DateTime.Today), IsActive = true };
        _context.Projects.Add(activeProject);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetActiveAsync();

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(activeProject.Id, result.Value.Id);
    }

    [Fact]
    public async Task GetActiveAsync_WhenNoActiveProject_ReturnsNull()
    {
        // Arrange
        _context.Projects.Add(new Project { Name = "Inactive", StartDate = DateOnly.FromDateTime(DateTime.Today), IsActive = false });
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetActiveAsync();

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Null(result.Value);
    }
}
