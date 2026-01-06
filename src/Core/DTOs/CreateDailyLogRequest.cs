#nullable enable
namespace PersonalExecutionOS.Core.DTOs;

/// <summary>
/// Request DTO for creating a new daily log entry.
/// </summary>
public record CreateDailyLogRequest
{
    /// <summary>
    /// The date of the work (required)
    /// </summary>
    public required DateOnly Date { get; init; }

    /// <summary>
    /// Project ID this log belongs to (required)
    /// </summary>
    public required Guid ProjectId { get; init; }

    /// <summary>
    /// Description of the task worked on (required, max 500 chars)
    /// </summary>
    public required string TaskDescription { get; init; }

    /// <summary>
    /// Time spent in minutes (required, must be > 0)
    /// </summary>
    public required int TimeSpentMinutes { get; init; }

    /// <summary>
    /// Description of what was produced (required, max 1000 chars)
    /// </summary>
    public required string OutputDescription { get; init; }

    /// <summary>
    /// Revenue generated (optional, default 0)
    /// </summary>
    public decimal RevenueGenerated { get; init; } = 0;

    /// <summary>
    /// Additional notes (optional, max 500 chars)
    /// </summary>
    public string? Note { get; init; }
}
