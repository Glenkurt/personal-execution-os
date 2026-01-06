#nullable enable
namespace PersonalExecutionOS.Core.DTOs;

/// <summary>
/// Request DTO for updating an existing project.
/// </summary>
public record UpdateProjectRequest
{
    /// <summary>
    /// Project name (required, max 100 characters)
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Project goal or description (optional, max 500 characters)
    /// </summary>
    public string? Goal { get; init; }
}
