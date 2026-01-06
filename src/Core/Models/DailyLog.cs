#nullable enable
namespace PersonalExecutionOS.Core.Models;

/// <summary>
/// Represents a daily log of work execution.
/// </summary>
public class DailyLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    /// <summary>
    /// The date of this log entry
    /// </summary>
    public required DateOnly Date { get; set; }
    
    /// <summary>
    /// Reference to the project this log belongs to
    /// </summary>
    public required Guid ProjectId { get; set; }
    
    /// <summary>
    /// Description of the task worked on (required, max 500 chars)
    /// </summary>
    public required string TaskDescription { get; set; }
    
    /// <summary>
    /// Time spent in minutes (must be > 0)
    /// </summary>
    public required int TimeSpentMinutes { get; set; }
    
    /// <summary>
    /// Description of what was produced/output (required, max 1000 chars)
    /// </summary>
    public required string OutputDescription { get; set; }
    
    /// <summary>
    /// Revenue generated (if any)
    /// </summary>
    public decimal RevenueGenerated { get; set; }
    
    /// <summary>
    /// Optional additional notes
    /// </summary>
    public string? Note { get; set; }

    /// <summary>
    /// Timestamp for auditing and immutability enforcement
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
