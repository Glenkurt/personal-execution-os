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
}
