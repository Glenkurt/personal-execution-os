#nullable enable
namespace PersonalExecutionOS.Core.DTOs;

/// <summary>
/// Response DTO for a project.
/// </summary>
public record ProjectResponse
{
    /// <summary>
    /// Project unique identifier
    /// </summary>
    public required Guid Id { get; init; }

    /// <summary>
    /// Project name
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Project goal or description
    /// </summary>
    public string? Goal { get; init; }

    /// <summary>
    /// Date when the project started
    /// </summary>
    public required DateOnly StartDate { get; init; }

    /// <summary>
    /// Whether this is the currently active project
    /// </summary>
    public required bool IsActive { get; init; }

    /// <summary>
    /// Timestamp when the project was created
    /// </summary>
    public required DateTime CreatedAt { get; init; }
}
