#nullable enable
namespace PersonalExecutionOS.Core.Models;

/// <summary>
/// Represents a project that the user is working on.
/// </summary>
public class Project
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    /// <summary>
    /// Project name (required, max 100 chars)
    /// </summary>
    public required string Name { get; set; }
    
    /// <summary>
    /// Project goal or description (optional, max 500 chars)
    /// </summary>
    public string? Goal { get; set; }
    
    /// <summary>
    /// Date when the project started
    /// </summary>
    public required DateOnly StartDate { get; set; }
    
    /// <summary>
    /// Whether this is the currently active project (only one can be active)
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Timestamp for auditing
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
