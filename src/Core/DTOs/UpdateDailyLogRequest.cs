#nullable enable
namespace PersonalExecutionOS.Core.DTOs;

/// <summary>
/// Request DTO for updating an existing daily log entry.
/// </summary>
public record UpdateDailyLogRequest
{
    /// <summary>
    /// Time spent in minutes (required, must be > 0)
    /// </summary>
    public required int TimeSpentMinutes { get; init; }

    /// <summary>
    /// Description of what was produced (required, max 1000 chars)
    /// </summary>
    public required string OutputDescription { get; init; }

    /// <summary>
    /// Revenue generated (optional)
    /// </summary>
    public decimal RevenueGenerated { get; init; }

    /// <summary>
    /// Additional notes (optional, max 500 chars)
    /// </summary>
    public string? Note { get; init; }
}
