#nullable enable
namespace PersonalExecutionOS.Core.Services;

using Microsoft.EntityFrameworkCore;
using PersonalExecutionOS.Core.Interfaces;
using PersonalExecutionOS.Infrastructure.Data;

/// <summary>
/// Service for calculating execution metrics from daily logs.
/// </summary>
public class MetricsService : IMetricsService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<MetricsService> _logger;

    public MetricsService(ApplicationDbContext context, ILogger<MetricsService> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<ServiceResult<int>> CalculateTotalTimeAsync(Guid projectId, CancellationToken ct = default)
    {
        try
        {
            var totalMinutes = await _context.DailyLogs
                .Where(dl => dl.ProjectId == projectId)
                .SumAsync(dl => dl.TimeSpentMinutes, cancellationToken: ct);

            _logger.LogInformation("Calculated total time for project {ProjectId}: {TotalMinutes} minutes", projectId, totalMinutes);
            return ServiceResult<int>.Success(totalMinutes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating total time for project {ProjectId}", projectId);
            return ServiceResult<int>.Failure($"Failed to calculate total time: {ex.Message}");
        }
    }

    public async Task<ServiceResult<decimal>> CalculateTotalRevenueAsync(Guid projectId, CancellationToken ct = default)
    {
        try
        {
            var totalRevenue = await _context.DailyLogs
                .Where(dl => dl.ProjectId == projectId)
                .SumAsync(dl => dl.RevenueGenerated, cancellationToken: ct);

            _logger.LogInformation("Calculated total revenue for project {ProjectId}: {TotalRevenue}", projectId, totalRevenue);
            return ServiceResult<decimal>.Success(totalRevenue);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating total revenue for project {ProjectId}", projectId);
            return ServiceResult<decimal>.Failure($"Failed to calculate total revenue: {ex.Message}");
        }
    }

    public async Task<ServiceResult<decimal>> CalculateRevenuePerHourAsync(Guid projectId, CancellationToken ct = default)
    {
        try
        {
            var logs = await _context.DailyLogs
                .Where(dl => dl.ProjectId == projectId)
                .ToListAsync(ct);

            if (!logs.Any())
            {
                _logger.LogInformation("No logs found for project {ProjectId}, returning 0 revenue per hour", projectId);
                return ServiceResult<decimal>.Success(0m);
            }

            var totalMinutes = logs.Sum(dl => dl.TimeSpentMinutes);
            var totalRevenue = logs.Sum(dl => dl.RevenueGenerated);

            if (totalMinutes == 0)
            {
                _logger.LogWarning("Total time is 0 for project {ProjectId}, cannot calculate revenue per hour", projectId);
                return ServiceResult<decimal>.Success(0m);
            }

            var revenuePerHour = (totalRevenue / totalMinutes) * 60;
            _logger.LogInformation("Calculated revenue per hour for project {ProjectId}: {RevenuePerHour}", projectId, revenuePerHour);

            return ServiceResult<decimal>.Success(Math.Round(revenuePerHour, 2));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating revenue per hour for project {ProjectId}", projectId);
            return ServiceResult<decimal>.Failure($"Failed to calculate revenue per hour: {ex.Message}");
        }
    }

    public async Task<ServiceResult<int>> CalculateDaysWorkedAsync(Guid projectId, CancellationToken ct = default)
    {
        try
        {
            var distinctDays = await _context.DailyLogs
                .Where(dl => dl.ProjectId == projectId)
                .Select(dl => dl.Date)
                .Distinct()
                .CountAsync(ct);

            _logger.LogInformation("Calculated days worked for project {ProjectId}: {DaysWorked}", projectId, distinctDays);
            return ServiceResult<int>.Success(distinctDays);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating days worked for project {ProjectId}", projectId);
            return ServiceResult<int>.Failure($"Failed to calculate days worked: {ex.Message}");
        }
    }

    public async Task<ServiceResult<int>> CalculateCurrentStreakAsync(Guid projectId, CancellationToken ct = default)
    {
        try
        {
            var logs = await _context.DailyLogs
                .Where(dl => dl.ProjectId == projectId)
                .OrderByDescending(dl => dl.Date)
                .Select(dl => dl.Date)
                .ToListAsync(ct);

            if (!logs.Any())
            {
                _logger.LogInformation("No logs found for project {ProjectId}, streak = 0", projectId);
                return ServiceResult<int>.Success(0);
            }

            var distinctDates = logs.Distinct().OrderByDescending(d => d).ToList();
            var streak = 0;
            var today = DateOnly.FromDateTime(DateTime.Today);
            var currentDate = today;

            // Count consecutive days backwards from today
            foreach (var logDate in distinctDates)
            {
                if (logDate == currentDate || logDate == currentDate.AddDays(-1))
                {
                    streak++;
                    currentDate = logDate;
                }
                else
                {
                    break;
                }
            }

            _logger.LogInformation("Calculated current streak for project {ProjectId}: {Streak} days", projectId, streak);
            return ServiceResult<int>.Success(streak);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating current streak for project {ProjectId}", projectId);
            return ServiceResult<int>.Failure($"Failed to calculate current streak: {ex.Message}");
        }
    }

    public async Task<ServiceResult<ProjectMetrics>> GetAllMetricsAsync(Guid projectId, CancellationToken ct = default)
    {
        try
        {
            var totalTimeResult = await CalculateTotalTimeAsync(projectId, ct);
            if (!totalTimeResult.IsSuccess)
                return ServiceResult<ProjectMetrics>.Failure(totalTimeResult.Error!);

            var totalRevenueResult = await CalculateTotalRevenueAsync(projectId, ct);
            if (!totalRevenueResult.IsSuccess)
                return ServiceResult<ProjectMetrics>.Failure(totalRevenueResult.Error!);

            var revenuePerHourResult = await CalculateRevenuePerHourAsync(projectId, ct);
            if (!revenuePerHourResult.IsSuccess)
                return ServiceResult<ProjectMetrics>.Failure(revenuePerHourResult.Error!);

            var daysWorkedResult = await CalculateDaysWorkedAsync(projectId, ct);
            if (!daysWorkedResult.IsSuccess)
                return ServiceResult<ProjectMetrics>.Failure(daysWorkedResult.Error!);

            var streakResult = await CalculateCurrentStreakAsync(projectId, ct);
            if (!streakResult.IsSuccess)
                return ServiceResult<ProjectMetrics>.Failure(streakResult.Error!);

            var metrics = new ProjectMetrics(
                projectId,
                totalTimeResult.Value!,
                totalRevenueResult.Value!,
                revenuePerHourResult.Value!,
                daysWorkedResult.Value!,
                streakResult.Value!);

            _logger.LogInformation("Retrieved all metrics for project {ProjectId}", projectId);
            return ServiceResult<ProjectMetrics>.Success(metrics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all metrics for project {ProjectId}", projectId);
            return ServiceResult<ProjectMetrics>.Failure($"Failed to retrieve metrics: {ex.Message}");
        }
    }

    public async Task<ServiceResult<MetricsSummary>> GetDashboardSummaryAsync(CancellationToken ct = default)
    {
        try
        {
            // Get all projects
            var projects = await _context.Projects.ToListAsync(ct);
            var totalProjects = projects.Count;
            var activeProjects = projects.Count(p => p.IsActive);

            // Get all daily logs
            var allLogs = await _context.DailyLogs.ToListAsync(ct);

            // Calculate aggregated metrics
            var totalMinutes = allLogs.Sum(l => l.TimeSpentMinutes);
            var totalHours = totalMinutes / 60;
            var totalRevenue = allLogs.Sum(l => l.RevenueGenerated);
            var averageHourlyRate = totalHours > 0 ? Math.Round(totalRevenue / totalHours, 2) : 0m;

            // Get last activity date
            var lastActivityDate = allLogs.OrderByDescending(l => l.Date).FirstOrDefault()?.Date;
            var lastActivityDateTime = lastActivityDate?.ToDateTime(TimeOnly.MinValue);

            // Calculate streaks
            var distinctDates = allLogs.Select(l => l.Date).Distinct().OrderByDescending(d => d).ToList();
            
            var (currentStreak, longestStreak) = CalculateStreaks(distinctDates);

            var summary = new MetricsSummary(
                TotalProjects: totalProjects,
                ActiveProjects: activeProjects,
                TotalHours: totalHours,
                TotalRevenue: totalRevenue,
                AverageHourlyRate: averageHourlyRate,
                CurrentStreakDays: currentStreak,
                LongestStreakDays: longestStreak,
                LastActivityDate: lastActivityDateTime);

            _logger.LogInformation("Retrieved dashboard summary: {TotalProjects} projects, {TotalHours} hours, {TotalRevenue} revenue", 
                totalProjects, totalHours, totalRevenue);

            return ServiceResult<MetricsSummary>.Success(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving dashboard summary");
            return ServiceResult<MetricsSummary>.Failure($"Failed to retrieve dashboard summary: {ex.Message}");
        }
    }

    /// <summary>
    /// Calculate current and longest streaks from a list of dates.
    /// </summary>
    private static (int CurrentStreak, int LongestStreak) CalculateStreaks(List<DateOnly> sortedDatesDescending)
    {
        if (!sortedDatesDescending.Any())
            return (0, 0);

        var today = DateOnly.FromDateTime(DateTime.Today);
        
        // Current streak: consecutive days backwards from today
        var currentStreak = 0;
        var currentDate = today;
        foreach (var date in sortedDatesDescending)
        {
            if (date == currentDate || date == currentDate.AddDays(-1))
            {
                currentStreak++;
                currentDate = date;
            }
            else
            {
                break;
            }
        }

        // Longest streak: scan through all dates
        var sortedDatesAscending = sortedDatesDescending.OrderBy(d => d).ToList();
        var longestStreak = 1;
        var tempStreak = 1;

        for (int i = 1; i < sortedDatesAscending.Count; i++)
        {
            var daysDifference = sortedDatesAscending[i].DayNumber - sortedDatesAscending[i - 1].DayNumber;
            if (daysDifference == 1)
            {
                tempStreak++;
                longestStreak = Math.Max(longestStreak, tempStreak);
            }
            else
            {
                tempStreak = 1;
            }
        }

        return (currentStreak, longestStreak);    }
}