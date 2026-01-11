#nullable enable
namespace PersonalExecutionOS.Core.Interfaces;

using PersonalExecutionOS.Core.Models;

/// <summary>
/// Service for calculating execution metrics from daily logs.
/// </summary>
public interface IMetricsService
{
    /// <summary>
    /// Calculate total time invested in a project (in minutes).
    /// </summary>
    Task<ServiceResult<int>> CalculateTotalTimeAsync(Guid projectId, CancellationToken ct = default);

    /// <summary>
    /// Calculate total revenue generated from a project.
    /// </summary>
    Task<ServiceResult<decimal>> CalculateTotalRevenueAsync(Guid projectId, CancellationToken ct = default);

    /// <summary>
    /// Calculate revenue per hour for a project.
    /// Returns 0 if no time has been logged.
    /// </summary>
    Task<ServiceResult<decimal>> CalculateRevenuePerHourAsync(Guid projectId, CancellationToken ct = default);

    /// <summary>
    /// Calculate number of distinct days worked on a project.
    /// </summary>
    Task<ServiceResult<int>> CalculateDaysWorkedAsync(Guid projectId, CancellationToken ct = default);

    /// <summary>
    /// Calculate current execution streak (consecutive days with logs, counting backwards from today).
    /// </summary>
    Task<ServiceResult<int>> CalculateCurrentStreakAsync(Guid projectId, CancellationToken ct = default);

    /// <summary>
    /// Get all metrics in one call.
    /// </summary>
    Task<ServiceResult<ProjectMetrics>> GetAllMetricsAsync(Guid projectId, CancellationToken ct = default);

    /// <summary>
    /// Get aggregated dashboard metrics summary across all projects.
    /// Includes total projects, active projects, time, revenue, streaks, and last activity date.
    /// </summary>
    Task<ServiceResult<MetricsSummary>> GetDashboardSummaryAsync(CancellationToken ct = default);
}

/// <summary>
/// Aggregated metrics summary for the dashboard.
/// </summary>
public record MetricsSummary(
    int TotalProjects,
    int ActiveProjects,
    int TotalHours,
    decimal TotalRevenue,
    decimal AverageHourlyRate,
    int CurrentStreakDays,
    int LongestStreakDays,
    DateTime? LastActivityDate
);

/// <summary>
/// Container for all project metrics.
/// </summary>
public record ProjectMetrics(
    Guid ProjectId,
    int TotalTimeMinutes,
    decimal TotalRevenue,
    decimal RevenuePerHour,
    int DaysWorked,
    int CurrentStreak);
