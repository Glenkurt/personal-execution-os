#nullable enable
namespace PersonalExecutionOS.Core.DTOs;

/// <summary>
/// Response DTO for a daily log entry.
/// </summary>
public record DailyLogResponse
{
    /// <summary>
    /// Daily log unique identifier
    /// </summary>
    public required Guid Id { get; init; }

    /// <summary>
    /// The date of the work
    /// </summary>
    public required DateOnly Date { get; init; }

    /// <summary>
    /// Project ID this log belongs to
    /// </summary>
    public required Guid ProjectId { get; init; }

    /// <summary>
    /// Description of the task worked on
    /// </summary>
    public required string TaskDescription { get; init; }

    /// <summary>
    /// Time spent in minutes
    /// </summary>
    public required int TimeSpentMinutes { get; init; }

    /// <summary>
    /// Description of what was produced
    /// </summary>
    public required string OutputDescription { get; init; }

    /// <summary>
    /// Revenue generated
    /// </summary>
    public required decimal RevenueGenerated { get; init; }

    /// <summary>
    /// Additional notes
    /// </summary>
    public string? Note { get; init; }

    /// <summary>
    /// Timestamp when the log was created
    /// </summary>
    public required DateTime CreatedAt { get; init; }
}
