#nullable enable
namespace PersonalExecutionOS.Core.Interfaces;

using PersonalExecutionOS.Core.Models;

/// <summary>
/// Repository interface for DailyLog entity operations.
/// </summary>
public interface IDailyLogRepository
{
    /// <summary>
    /// Create a new daily log entry.
    /// </summary>
    Task<ServiceResult<DailyLog>> CreateAsync(DailyLog log, CancellationToken ct = default);

    /// <summary>
    /// Retrieve a daily log by its ID.
    /// </summary>
    Task<ServiceResult<DailyLog>> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>
    /// Retrieve all logs for a specific project.
    /// </summary>
    Task<ServiceResult<List<DailyLog>>> GetByProjectIdAsync(Guid projectId, CancellationToken ct = default);

    /// <summary>
    /// Retrieve logs within a date range.
    /// </summary>
    Task<ServiceResult<List<DailyLog>>> GetByDateRangeAsync(DateOnly startDate, DateOnly endDate, CancellationToken ct = default);

    /// <summary>
    /// Retrieve logs for a specific project within a date range.
    /// </summary>
    Task<ServiceResult<List<DailyLog>>> GetByProjectAndDateRangeAsync(Guid projectId, DateOnly startDate, DateOnly endDate, CancellationToken ct = default);

    /// <summary>
    /// Update an existing daily log (only within 24h of creation).
    /// </summary>
    Task<ServiceResult<DailyLog>> UpdateAsync(DailyLog log, CancellationToken ct = default);

    /// <summary>
    /// Retrieve all daily logs with optional sorting and limit.
    /// </summary>
    Task<ServiceResult<IEnumerable<DailyLog>>> GetAllAsync(
        int limit = 50,
        string sortBy = "date",
        bool descending = true,
        CancellationToken ct = default);
}
