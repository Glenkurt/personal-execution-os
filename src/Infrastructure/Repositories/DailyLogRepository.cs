#nullable enable
namespace PersonalExecutionOS.Infrastructure.Repositories;

using Microsoft.EntityFrameworkCore;
using PersonalExecutionOS.Core.Interfaces;
using PersonalExecutionOS.Core.Models;
using PersonalExecutionOS.Infrastructure.Data;

/// <summary>
/// Repository implementation for DailyLog entity.
/// </summary>
public class DailyLogRepository : IDailyLogRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DailyLogRepository> _logger;
    private const int ImmutabilityHours = 24;

    public DailyLogRepository(ApplicationDbContext context, ILogger<DailyLogRepository> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<ServiceResult<DailyLog>> CreateAsync(DailyLog log, CancellationToken ct = default)
    {
        try
        {
            ArgumentNullException.ThrowIfNull(log);

            // Validation
            if (log.TimeSpentMinutes <= 0)
            {
                return ServiceResult<DailyLog>.Failure("Time spent must be greater than 0 minutes");
            }

            if (log.Date > DateOnly.FromDateTime(DateTime.Today))
            {
                return ServiceResult<DailyLog>.Failure("Log date cannot be in the future");
            }

            // Verify project exists
            var projectExists = await _context.Projects
                .AnyAsync(p => p.Id == log.ProjectId, cancellationToken: ct);

            if (!projectExists)
            {
                return ServiceResult<DailyLog>.Failure($"Project with ID {log.ProjectId} not found");
            }

            _context.DailyLogs.Add(log);
            await _context.SaveChangesAsync(ct);

            _logger.LogInformation("Daily log created: {LogId} for project {ProjectId}", log.Id, log.ProjectId);
            return ServiceResult<DailyLog>.Success(log);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating daily log");
            return ServiceResult<DailyLog>.Failure($"Failed to create daily log: {ex.Message}");
        }
    }

    public async Task<ServiceResult<DailyLog>> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        try
        {
            var log = await _context.DailyLogs.FindAsync(new object[] { id }, cancellationToken: ct);

            if (log is null)
            {
                _logger.LogWarning("Daily log not found: {LogId}", id);
                return ServiceResult<DailyLog>.Failure($"Daily log with ID {id} not found");
            }

            return ServiceResult<DailyLog>.Success(log);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving daily log {LogId}", id);
            return ServiceResult<DailyLog>.Failure($"Failed to retrieve daily log: {ex.Message}");
        }
    }

    public async Task<ServiceResult<List<DailyLog>>> GetByProjectIdAsync(Guid projectId, CancellationToken ct = default)
    {
        try
        {
            var logs = await _context.DailyLogs
                .Where(dl => dl.ProjectId == projectId)
                .OrderByDescending(dl => dl.Date)
                .ToListAsync(ct);

            return ServiceResult<List<DailyLog>>.Success(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving daily logs for project {ProjectId}", projectId);
            return ServiceResult<List<DailyLog>>.Failure($"Failed to retrieve daily logs: {ex.Message}");
        }
    }

    public async Task<ServiceResult<List<DailyLog>>> GetByDateRangeAsync(DateOnly startDate, DateOnly endDate, CancellationToken ct = default)
    {
        try
        {
            var logs = await _context.DailyLogs
                .Where(dl => dl.Date >= startDate && dl.Date <= endDate)
                .OrderByDescending(dl => dl.Date)
                .ToListAsync(ct);

            return ServiceResult<List<DailyLog>>.Success(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving daily logs by date range");
            return ServiceResult<List<DailyLog>>.Failure($"Failed to retrieve daily logs: {ex.Message}");
        }
    }

    public async Task<ServiceResult<List<DailyLog>>> GetByProjectAndDateRangeAsync(Guid projectId, DateOnly startDate, DateOnly endDate, CancellationToken ct = default)
    {
        try
        {
            var logs = await _context.DailyLogs
                .Where(dl => dl.ProjectId == projectId && dl.Date >= startDate && dl.Date <= endDate)
                .OrderByDescending(dl => dl.Date)
                .ToListAsync(ct);

            return ServiceResult<List<DailyLog>>.Success(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving daily logs for project {ProjectId} by date range", projectId);
            return ServiceResult<List<DailyLog>>.Failure($"Failed to retrieve daily logs: {ex.Message}");
        }
    }

    public async Task<ServiceResult<DailyLog>> UpdateAsync(DailyLog log, CancellationToken ct = default)
    {
        try
        {
            ArgumentNullException.ThrowIfNull(log);

            var existingLog = await _context.DailyLogs.FindAsync(new object[] { log.Id }, cancellationToken: ct);

            if (existingLog is null)
            {
                return ServiceResult<DailyLog>.Failure($"Daily log with ID {log.Id} not found");
            }

            // Check immutability rule: cannot edit after 24h
            var elapsedHours = (DateTime.UtcNow - existingLog.CreatedAt).TotalHours;
            if (elapsedHours > ImmutabilityHours)
            {
                _logger.LogWarning("Attempted to edit immutable log {LogId}", log.Id);
                return ServiceResult<DailyLog>.Failure("Cannot edit log older than 24 hours");
            }

            // Update fields
            if (log.TimeSpentMinutes <= 0)
            {
                return ServiceResult<DailyLog>.Failure("Time spent must be greater than 0 minutes");
            }

            existingLog.TaskDescription = log.TaskDescription;
            existingLog.TimeSpentMinutes = log.TimeSpentMinutes;
            existingLog.OutputDescription = log.OutputDescription;
            existingLog.RevenueGenerated = log.RevenueGenerated;
            existingLog.Note = log.Note;

            await _context.SaveChangesAsync(ct);

            _logger.LogInformation("Daily log updated: {LogId}", log.Id);
            return ServiceResult<DailyLog>.Success(existingLog);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating daily log {LogId}", log.Id);
            return ServiceResult<DailyLog>.Failure($"Failed to update daily log: {ex.Message}");
        }
    }

    public async Task<ServiceResult<IEnumerable<DailyLog>>> GetAllAsync(
        int limit = 50,
        string sortBy = "date",
        bool descending = true,
        CancellationToken ct = default)
    {
        try
        {
            // Validate parameters
            if (limit <= 0 || limit > 500)
            {
                limit = Math.Clamp(limit, 1, 500);
            }

            var validSortFields = new[] { "date", "project", "time" };
            if (!validSortFields.Contains(sortBy.ToLower()))
            {
                sortBy = "date";
            }

            IQueryable<DailyLog> query = _context.DailyLogs;

            // Apply sorting
            query = sortBy.ToLower() switch
            {
                "date" => descending ? query.OrderByDescending(l => l.Date) : query.OrderBy(l => l.Date),
                "project" => descending ? query.OrderByDescending(l => l.ProjectId) : query.OrderBy(l => l.ProjectId),
                "time" => descending ? query.OrderByDescending(l => l.TimeSpentMinutes) : query.OrderBy(l => l.TimeSpentMinutes),
                _ => query.OrderByDescending(l => l.Date)
            };

            // Apply limit and fetch
            var logs = await query.Take(limit).ToListAsync(ct);

            _logger.LogInformation("Retrieved all daily logs: {Count} records with sort={SortBy}, order={Order}", 
                logs.Count, sortBy, descending ? "desc" : "asc");

            return ServiceResult<IEnumerable<DailyLog>>.Success(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all daily logs");
            return ServiceResult<IEnumerable<DailyLog>>.Failure($"Failed to retrieve daily logs: {ex.Message}");
        }
    }
}
