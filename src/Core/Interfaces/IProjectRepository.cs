#nullable enable
namespace PersonalExecutionOS.Core.Interfaces;

using PersonalExecutionOS.Core.Models;

/// <summary>
/// Repository interface for Project entity operations.
/// </summary>
public interface IProjectRepository
{
    /// <summary>
    /// Create a new project in the database.
    /// </summary>
    Task<ServiceResult<Project>> CreateAsync(Project project, CancellationToken ct = default);

    /// <summary>
    /// Retrieve a project by its ID.
    /// </summary>
    Task<ServiceResult<Project>> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Retrieve all projects.
    /// </summary>
    Task<ServiceResult<List<Project>>> GetAllAsync(CancellationToken ct = default);

    /// <summary>
    /// Set a project as active and deactivate others.
    /// </summary>
    Task<ServiceResult<Project>> SetActiveAsync(Guid projectId, CancellationToken ct = default);

    /// <summary>
    /// Update an existing project.
    /// </summary>
    Task<ServiceResult<Project>> UpdateAsync(Project project, CancellationToken ct = default);

    /// <summary>
    /// Get the currently active project, if any.
    /// </summary>
    Task<ServiceResult<Project?>> GetActiveAsync(CancellationToken ct = default);
}
