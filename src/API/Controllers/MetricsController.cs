#nullable enable
using Microsoft.AspNetCore.Mvc;
using PersonalExecutionOS.Core.Interfaces;
using PersonalExecutionOS.Core.Models;

namespace PersonalExecutionOS.API.Controllers;

/// <summary>
/// API controller for retrieving project metrics.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class MetricsController : ControllerBase
{
    private readonly IMetricsService _metricsService;
    private readonly IProjectRepository _projectRepository;
    private readonly ILogger<MetricsController> _logger;

    /// <summary>
    /// Initializes a new instance of the MetricsController.
    /// </summary>
    public MetricsController(
        IMetricsService metricsService,
        IProjectRepository projectRepository,
        ILogger<MetricsController> logger)
    {
        _metricsService = metricsService;
        _projectRepository = projectRepository;
        _logger = logger;
    }

    /// <summary>
    /// Retrieves all metrics for a project.
    /// </summary>
    /// <param name="projectId">Project ID</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>All project metrics</returns>
    [HttpGet("{projectId:guid}")]
    [ProducesResponseType(typeof(MetricsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MetricsResponse>> GetAllMetricsAsync(Guid projectId, CancellationToken ct)
    {
        if (projectId == Guid.Empty)
        {
            _logger.LogWarning("Get all metrics failed: project ID is empty");
            return BadRequest(new { error = "Project ID cannot be empty" });
        }

        // Verify project exists
        var projectResult = await _projectRepository.GetByIdAsync(projectId, ct);
        if (!projectResult.IsSuccess)
        {
            _logger.LogWarning("Get all metrics failed: project {ProjectId} not found", projectId);
            return NotFound(new { error = "Project not found" });
        }

        var metricsResult = await _metricsService.GetAllMetricsAsync(projectId, ct);

        if (!metricsResult.IsSuccess)
        {
            _logger.LogError("Failed to retrieve metrics for project {ProjectId}: {Error}", projectId, metricsResult.Error);
            return BadRequest(new { error = metricsResult.Error });
        }

        var metrics = metricsResult.Value!;
        _logger.LogInformation("Retrieved all metrics for project {ProjectId}", projectId);

        var response = MapToMetricsResponse(metrics);
        return Ok(response);
    }

    /// <summary>
    /// Retrieves total time spent on a project (in minutes).
    /// </summary>
    /// <param name="projectId">Project ID</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>Total time in minutes</returns>
    [HttpGet("{projectId:guid}/time")]
    [ProducesResponseType(typeof(IntValueResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IntValueResponse>> GetTotalTimeAsync(Guid projectId, CancellationToken ct)
    {
        if (projectId == Guid.Empty)
        {
            _logger.LogWarning("Get total time failed: project ID is empty");
            return BadRequest(new { error = "Project ID cannot be empty" });
        }

        // Verify project exists
        var projectResult = await _projectRepository.GetByIdAsync(projectId, ct);
        if (!projectResult.IsSuccess)
        {
            _logger.LogWarning("Get total time failed: project {ProjectId} not found", projectId);
            return NotFound(new { error = "Project not found" });
        }

        var timeResult = await _metricsService.CalculateTotalTimeAsync(projectId, ct);

        if (!timeResult.IsSuccess)
        {
            _logger.LogError("Failed to calculate total time for project {ProjectId}: {Error}", projectId, timeResult.Error);
            return BadRequest(new { error = timeResult.Error });
        }

        _logger.LogInformation("Retrieved total time for project {ProjectId}: {TotalMinutes} minutes", projectId, timeResult.Value);
        return Ok(new IntValueResponse(timeResult.Value));
    }

    /// <summary>
    /// Retrieves total revenue generated from a project.
    /// </summary>
    /// <param name="projectId">Project ID</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>Total revenue</returns>
    [HttpGet("{projectId:guid}/revenue")]
    [ProducesResponseType(typeof(DecimalValueResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DecimalValueResponse>> GetTotalRevenueAsync(Guid projectId, CancellationToken ct)
    {
        if (projectId == Guid.Empty)
        {
            _logger.LogWarning("Get total revenue failed: project ID is empty");
            return BadRequest(new { error = "Project ID cannot be empty" });
        }

        // Verify project exists
        var projectResult = await _projectRepository.GetByIdAsync(projectId, ct);
        if (!projectResult.IsSuccess)
        {
            _logger.LogWarning("Get total revenue failed: project {ProjectId} not found", projectId);
            return NotFound(new { error = "Project not found" });
        }

        var revenueResult = await _metricsService.CalculateTotalRevenueAsync(projectId, ct);

        if (!revenueResult.IsSuccess)
        {
            _logger.LogError("Failed to calculate total revenue for project {ProjectId}: {Error}", projectId, revenueResult.Error);
            return BadRequest(new { error = revenueResult.Error });
        }

        _logger.LogInformation("Retrieved total revenue for project {ProjectId}: {TotalRevenue}", projectId, revenueResult.Value);
        return Ok(new DecimalValueResponse(revenueResult.Value));
    }

    /// <summary>
    /// Retrieves revenue per hour for a project.
    /// </summary>
    /// <param name="projectId">Project ID</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>Revenue per hour</returns>
    [HttpGet("{projectId:guid}/revenue-per-hour")]
    [ProducesResponseType(typeof(DecimalValueResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DecimalValueResponse>> GetRevenuePerHourAsync(Guid projectId, CancellationToken ct)
    {
        if (projectId == Guid.Empty)
        {
            _logger.LogWarning("Get revenue per hour failed: project ID is empty");
            return BadRequest(new { error = "Project ID cannot be empty" });
        }

        // Verify project exists
        var projectResult = await _projectRepository.GetByIdAsync(projectId, ct);
        if (!projectResult.IsSuccess)
        {
            _logger.LogWarning("Get revenue per hour failed: project {ProjectId} not found", projectId);
            return NotFound(new { error = "Project not found" });
        }

        var revenuePerHourResult = await _metricsService.CalculateRevenuePerHourAsync(projectId, ct);

        if (!revenuePerHourResult.IsSuccess)
        {
            _logger.LogError("Failed to calculate revenue per hour for project {ProjectId}: {Error}", projectId, revenuePerHourResult.Error);
            return BadRequest(new { error = revenuePerHourResult.Error });
        }

        _logger.LogInformation("Retrieved revenue per hour for project {ProjectId}: {RevenuePerHour}", projectId, revenuePerHourResult.Value);
        return Ok(new DecimalValueResponse(revenuePerHourResult.Value));
    }

    /// <summary>
    /// Retrieves current execution streak (consecutive days with logs).
    /// </summary>
    /// <param name="projectId">Project ID</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>Current streak in days</returns>
    [HttpGet("{projectId:guid}/streak")]
    [ProducesResponseType(typeof(IntValueResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IntValueResponse>> GetCurrentStreakAsync(Guid projectId, CancellationToken ct)
    {
        if (projectId == Guid.Empty)
        {
            _logger.LogWarning("Get current streak failed: project ID is empty");
            return BadRequest(new { error = "Project ID cannot be empty" });
        }

        // Verify project exists
        var projectResult = await _projectRepository.GetByIdAsync(projectId, ct);
        if (!projectResult.IsSuccess)
        {
            _logger.LogWarning("Get current streak failed: project {ProjectId} not found", projectId);
            return NotFound(new { error = "Project not found" });
        }

        var streakResult = await _metricsService.CalculateCurrentStreakAsync(projectId, ct);

        if (!streakResult.IsSuccess)
        {
            _logger.LogError("Failed to calculate current streak for project {ProjectId}: {Error}", projectId, streakResult.Error);
            return BadRequest(new { error = streakResult.Error });
        }

        _logger.LogInformation("Retrieved current streak for project {ProjectId}: {Streak} days", projectId, streakResult.Value);
        return Ok(new IntValueResponse(streakResult.Value));
    }

    #region Response Mapping

    /// <summary>
    /// Maps ProjectMetrics to MetricsResponse.
    /// </summary>
    private static MetricsResponse MapToMetricsResponse(ProjectMetrics metrics)
    {
        return new MetricsResponse(
            ProjectId: metrics.ProjectId,
            TotalTimeMinutes: metrics.TotalTimeMinutes,
            TotalRevenue: metrics.TotalRevenue,
            RevenuePerHour: metrics.RevenuePerHour,
            DaysWorked: metrics.DaysWorked,
            CurrentStreak: metrics.CurrentStreak);
    }

    #endregion
}

/// <summary>
/// Response model for metrics that return a single integer value.
/// </summary>
public record IntValueResponse(int Value);

/// <summary>
/// Response model for metrics that return a single decimal value.
/// </summary>
public record DecimalValueResponse(decimal Value);

/// <summary>
/// Response model for all project metrics.
/// </summary>
public record MetricsResponse(
    Guid ProjectId,
    int TotalTimeMinutes,
    decimal TotalRevenue,
    decimal RevenuePerHour,
    int DaysWorked,
    int CurrentStreak);
