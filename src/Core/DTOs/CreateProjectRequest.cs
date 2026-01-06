#nullable enable
namespace PersonalExecutionOS.Core.DTOs;

/// <summary>
/// Request DTO for creating a new project.
/// </summary>
public record CreateProjectRequest
{
    /// <summary>
    /// Project name (required, max 100 characters)
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Project goal or description (optional, max 500 characters)
    /// </summary>
    public string? Goal { get; init; }

    /// <summary>
    /// Date when the project starts
    /// </summary>
    public required DateOnly StartDate { get; init; }

    /// <summary>
    /// Whether this project should be activated immediately
    /// </summary>
    public bool IsActive { get; init; }
}
