#nullable enable
using Microsoft.AspNetCore.Mvc;
using PersonalExecutionOS.Core.DTOs;
using PersonalExecutionOS.Core.Interfaces;
using PersonalExecutionOS.Core.Models;

namespace PersonalExecutionOS.API.Controllers;

/// <summary>
/// API controller for managing daily log entries.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class DailyLogsController : ControllerBase
{
    private readonly IDailyLogRepository _dailyLogRepository;
    private readonly IProjectRepository _projectRepository;
    private readonly ILogger<DailyLogsController> _logger;

    /// <summary>
    /// Initializes a new instance of the DailyLogsController.
    /// </summary>
    public DailyLogsController(
        IDailyLogRepository dailyLogRepository,
        IProjectRepository projectRepository,
        ILogger<DailyLogsController> logger)
    {
        _dailyLogRepository = dailyLogRepository;
        _projectRepository = projectRepository;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new daily log entry.
    /// </summary>
    /// <param name="request">Daily log creation request</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>The created daily log</returns>
    [HttpPost]
    [ProducesResponseType(typeof(DailyLogResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DailyLogResponse>> CreateDailyLogAsync(
        [FromBody] CreateDailyLogRequest request,
        CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(request);

        // Validation
        if (string.IsNullOrWhiteSpace(request.TaskDescription))
        {
            _logger.LogWarning("Create daily log failed: task description is empty");
            return BadRequest(new { error = "Task description is required and cannot be empty" });
        }

        if (request.TaskDescription.Length > 500)
        {
            _logger.LogWarning("Create daily log failed: task description exceeds 500 characters");
            return BadRequest(new { error = "Task description cannot exceed 500 characters" });
        }

        if (string.IsNullOrWhiteSpace(request.OutputDescription))
        {
            _logger.LogWarning("Create daily log failed: output description is empty");
            return BadRequest(new { error = "Output description is required and cannot be empty" });
        }

        if (request.OutputDescription.Length > 1000)
        {
            _logger.LogWarning("Create daily log failed: output description exceeds 1000 characters");
            return BadRequest(new { error = "Output description cannot exceed 1000 characters" });
        }

        if (request.TimeSpentMinutes <= 0)
        {
            _logger.LogWarning("Create daily log failed: time spent must be positive");
            return BadRequest(new { error = "Time spent must be greater than 0 minutes" });
        }

        if (request.Note?.Length > 500)
        {
            _logger.LogWarning("Create daily log failed: note exceeds 500 characters");
            return BadRequest(new { error = "Note cannot exceed 500 characters" });
        }

        // Verify project exists
        var projectResult = await _projectRepository.GetByIdAsync(request.ProjectId, ct);
        if (!projectResult.IsSuccess)
        {
            _logger.LogWarning("Create daily log failed: project {ProjectId} not found", request.ProjectId);
            return NotFound(new { error = $"Project with ID {request.ProjectId} not found" });
        }

        var log = new DailyLog
        {
            Date = request.Date,
            ProjectId = request.ProjectId,
            TaskDescription = request.TaskDescription.Trim(),
            TimeSpentMinutes = request.TimeSpentMinutes,
            OutputDescription = request.OutputDescription.Trim(),
            RevenueGenerated = request.RevenueGenerated,
            Note = request.Note?.Trim()
        };

        var result = await _dailyLogRepository.CreateAsync(log, ct);

        if (!result.IsSuccess)
        {
            _logger.LogError("Failed to create daily log: {Error}", result.Error);
            return BadRequest(new { error = result.Error });
        }

        _logger.LogInformation("Daily log created with ID {LogId} for project {ProjectId}", result.Value?.Id, request.ProjectId);
        var response = MapToDailyLogResponse(result.Value!);
        return Created($"/api/dailylogs/{response.Id}", response);
    }

    /// <summary>
    /// Retrieves a daily log entry by its ID.
    /// </summary>
    /// <param name="id">Daily log ID</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>The daily log if found</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(DailyLogResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DailyLogResponse>> GetDailyLogByIdAsync(Guid id, CancellationToken ct)
    {
        if (id == Guid.Empty)
        {
            _logger.LogWarning("Get daily log failed: invalid ID");
            return BadRequest(new { error = "Daily log ID must be a valid GUID" });
        }

        var result = await _dailyLogRepository.GetByIdAsync(id, ct);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("Daily log not found: {LogId}", id);
            return NotFound(new { error = $"Daily log with ID {id} not found" });
        }

        var response = MapToDailyLogResponse(result.Value!);
        return Ok(response);
    }

    /// <summary>
    /// Retrieves all daily logs for a specific project.
    /// </summary>
    /// <param name="projectId">Project ID</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>List of daily logs for the project</returns>
    [HttpGet("project/{projectId:guid}")]
    [ProducesResponseType(typeof(List<DailyLogResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<DailyLogResponse>>> GetLogsForProjectAsync(Guid projectId, CancellationToken ct)
    {
        if (projectId == Guid.Empty)
        {
            _logger.LogWarning("Get logs for project failed: invalid project ID");
            return BadRequest(new { error = "Project ID must be a valid GUID" });
        }

        // Verify project exists
        var projectResult = await _projectRepository.GetByIdAsync(projectId, ct);
        if (!projectResult.IsSuccess)
        {
            _logger.LogWarning("Project not found: {ProjectId}", projectId);
            return NotFound(new { error = $"Project with ID {projectId} not found" });
        }

        var result = await _dailyLogRepository.GetByProjectIdAsync(projectId, ct);

        if (!result.IsSuccess)
        {
            _logger.LogError("Failed to retrieve logs for project {ProjectId}: {Error}", projectId, result.Error);
            return BadRequest(new { error = result.Error });
        }

        _logger.LogInformation("Retrieved {Count} logs for project {ProjectId}", result.Value?.Count ?? 0, projectId);
        var responses = result.Value?.ConvertAll(MapToDailyLogResponse) ?? new List<DailyLogResponse>();
        return Ok(responses);
    }

    /// <summary>
    /// Retrieves daily logs within a date range for a specific project.
    /// </summary>
    /// <param name="projectId">Project ID</param>
    /// <param name="startDate">Start date (inclusive)</param>
    /// <param name="endDate">End date (inclusive)</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>List of daily logs within the date range</returns>
    [HttpGet("project/{projectId:guid}/range")]
    [ProducesResponseType(typeof(List<DailyLogResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<DailyLogResponse>>> GetLogsForProjectByDateRangeAsync(
        Guid projectId,
        [FromQuery] DateOnly startDate,
        [FromQuery] DateOnly endDate,
        CancellationToken ct)
    {
        if (projectId == Guid.Empty)
        {
            _logger.LogWarning("Get logs by date range failed: invalid project ID");
            return BadRequest(new { error = "Project ID must be a valid GUID" });
        }

        if (startDate > endDate)
        {
            _logger.LogWarning("Get logs by date range failed: start date after end date");
            return BadRequest(new { error = "Start date must be before or equal to end date" });
        }

        // Verify project exists
        var projectResult = await _projectRepository.GetByIdAsync(projectId, ct);
        if (!projectResult.IsSuccess)
        {
            _logger.LogWarning("Project not found: {ProjectId}", projectId);
            return NotFound(new { error = $"Project with ID {projectId} not found" });
        }

        var result = await _dailyLogRepository.GetByProjectAndDateRangeAsync(projectId, startDate, endDate, ct);

        if (!result.IsSuccess)
        {
            _logger.LogError("Failed to retrieve logs by date range: {Error}", result.Error);
            return BadRequest(new { error = result.Error });
        }

        _logger.LogInformation("Retrieved {Count} logs for project {ProjectId} from {StartDate} to {EndDate}",
            result.Value?.Count ?? 0, projectId, startDate, endDate);
        var responses = result.Value?.ConvertAll(MapToDailyLogResponse) ?? new List<DailyLogResponse>();
        return Ok(responses);
    }

    /// <summary>
    /// Updates an existing daily log entry (only within 24 hours of creation).
    /// </summary>
    /// <param name="id">Daily log ID</param>
    /// <param name="request">Daily log update request</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>The updated daily log</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(DailyLogResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DailyLogResponse>> UpdateDailyLogAsync(
        Guid id,
        [FromBody] UpdateDailyLogRequest request,
        CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (id == Guid.Empty)
        {
            _logger.LogWarning("Update daily log failed: invalid ID");
            return BadRequest(new { error = "Daily log ID must be a valid GUID" });
        }

        // Validation
        if (request.TimeSpentMinutes <= 0)
        {
            _logger.LogWarning("Update daily log failed: time spent must be positive");
            return BadRequest(new { error = "Time spent must be greater than 0 minutes" });
        }

        if (string.IsNullOrWhiteSpace(request.OutputDescription))
        {
            _logger.LogWarning("Update daily log failed: output description is empty");
            return BadRequest(new { error = "Output description is required and cannot be empty" });
        }

        if (request.OutputDescription.Length > 1000)
        {
            _logger.LogWarning("Update daily log failed: output description exceeds 1000 characters");
            return BadRequest(new { error = "Output description cannot exceed 1000 characters" });
        }

        if (request.Note?.Length > 500)
        {
            _logger.LogWarning("Update daily log failed: note exceeds 500 characters");
            return BadRequest(new { error = "Note cannot exceed 500 characters" });
        }

        // Retrieve existing log
        var getResult = await _dailyLogRepository.GetByIdAsync(id, ct);

        if (!getResult.IsSuccess)
        {
            _logger.LogWarning("Daily log not found for update: {LogId}", id);
            return NotFound(new { error = $"Daily log with ID {id} not found" });
        }

        var log = getResult.Value!;
        log.TimeSpentMinutes = request.TimeSpentMinutes;
        log.OutputDescription = request.OutputDescription.Trim();
        log.RevenueGenerated = request.RevenueGenerated;
        log.Note = request.Note?.Trim();

        var updateResult = await _dailyLogRepository.UpdateAsync(log, ct);

        if (!updateResult.IsSuccess)
        {
            _logger.LogError("Failed to update daily log {LogId}: {Error}", id, updateResult.Error);
            return BadRequest(new { error = updateResult.Error });
        }

        _logger.LogInformation("Daily log {LogId} updated successfully", id);
        var response = MapToDailyLogResponse(updateResult.Value!);
        return Ok(response);
    }

    /// <summary>
    /// Deletes a daily log entry.
    /// </summary>
    /// <param name="id">Daily log ID</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>No content on success</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteDailyLogAsync(Guid id, CancellationToken ct)
    {
        if (id == Guid.Empty)
        {
            _logger.LogWarning("Delete daily log failed: invalid ID");
            return BadRequest(new { error = "Daily log ID must be a valid GUID" });
        }

        // Retrieve log to verify it exists
        var getResult = await _dailyLogRepository.GetByIdAsync(id, ct);

        if (!getResult.IsSuccess)
        {
            _logger.LogWarning("Daily log not found for deletion: {LogId}", id);
            return NotFound(new { error = $"Daily log with ID {id} not found" });
        }

        // In a production system, you might implement soft delete or proper deletion logic
        // For now, we'll return a not-implemented response since the repository doesn't have a delete method
        _logger.LogWarning("Delete operation not implemented for daily logs");
        return BadRequest(new { error = "Delete operation is not currently supported" });
    }

    /// <summary>
    /// Maps a DailyLog model to a DailyLogResponse DTO.
    /// </summary>
    private static DailyLogResponse MapToDailyLogResponse(DailyLog log)
    {
        return new DailyLogResponse
        {
            Id = log.Id,
            Date = log.Date,
            ProjectId = log.ProjectId,
            TaskDescription = log.TaskDescription,
            TimeSpentMinutes = log.TimeSpentMinutes,
            OutputDescription = log.OutputDescription,
            RevenueGenerated = log.RevenueGenerated,
            Note = log.Note,
            CreatedAt = log.CreatedAt
        };
    }
}
