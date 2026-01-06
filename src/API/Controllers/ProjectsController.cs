#nullable enable
using Microsoft.AspNetCore.Mvc;
using PersonalExecutionOS.Core.DTOs;
using PersonalExecutionOS.Core.Interfaces;
using PersonalExecutionOS.Core.Models;

namespace PersonalExecutionOS.API.Controllers;

/// <summary>
/// API controller for managing projects.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectRepository _projectRepository;
    private readonly ILogger<ProjectsController> _logger;

    /// <summary>
    /// Initializes a new instance of the ProjectsController.
    /// </summary>
    public ProjectsController(IProjectRepository projectRepository, ILogger<ProjectsController> logger)
    {
        _projectRepository = projectRepository;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new project.
    /// </summary>
    /// <param name="request">Project creation request</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>The created project</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ProjectResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProjectResponse>> CreateProjectAsync(
        [FromBody] CreateProjectRequest request,
        CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(request);

        // Validation
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            _logger.LogWarning("Create project failed: name is empty");
            return BadRequest(new { error = "Project name is required and cannot be empty" });
        }

        if (request.Name.Length > 100)
        {
            _logger.LogWarning("Create project failed: name exceeds 100 characters");
            return BadRequest(new { error = "Project name cannot exceed 100 characters" });
        }

        if (request.Goal?.Length > 500)
        {
            _logger.LogWarning("Create project failed: goal exceeds 500 characters");
            return BadRequest(new { error = "Project goal cannot exceed 500 characters" });
        }

        if (request.StartDate > DateOnly.FromDateTime(DateTime.UtcNow))
        {
            _logger.LogWarning("Create project failed: start date is in the future");
            return BadRequest(new { error = "Project start date cannot be in the future" });
        }

        var project = new Project
        {
            Name = request.Name.Trim(),
            Goal = request.Goal?.Trim(),
            StartDate = request.StartDate,
            IsActive = request.IsActive
        };

        var result = await _projectRepository.CreateAsync(project, ct);

        if (!result.IsSuccess)
        {
            _logger.LogError("Failed to create project: {Error}", result.Error);
            return BadRequest(new { error = result.Error });
        }

        _logger.LogInformation("Project created with ID {ProjectId}", result.Value?.Id);
        var response = MapToProjectResponse(result.Value!);
        return Created($"/api/projects/{response.Id}", response);
    }

    /// <summary>
    /// Retrieves a project by its ID.
    /// </summary>
    /// <param name="id">Project ID</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>The project if found</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ProjectResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectResponse>> GetProjectByIdAsync(Guid id, CancellationToken ct)
    {
        if (id == Guid.Empty)
        {
            _logger.LogWarning("Get project failed: invalid ID");
            return BadRequest(new { error = "Project ID must be a valid GUID" });
        }

        var result = await _projectRepository.GetByIdAsync(id, ct);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("Project not found: {ProjectId}", id);
            return NotFound(new { error = $"Project with ID {id} not found" });
        }

        var response = MapToProjectResponse(result.Value!);
        return Ok(response);
    }

    /// <summary>
    /// Retrieves all projects.
    /// </summary>
    /// <param name="ct">Cancellation token</param>
    /// <returns>List of all projects</returns>
    [HttpGet]
    [ProducesResponseType(typeof(List<ProjectResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ProjectResponse>>> GetAllProjectsAsync(CancellationToken ct)
    {
        var result = await _projectRepository.GetAllAsync(ct);

        if (!result.IsSuccess)
        {
            _logger.LogError("Failed to retrieve all projects: {Error}", result.Error);
            return BadRequest(new { error = result.Error });
        }

        _logger.LogInformation("Retrieved {Count} projects", result.Value?.Count ?? 0);
        var responses = result.Value?.ConvertAll(MapToProjectResponse) ?? new List<ProjectResponse>();
        return Ok(responses);
    }

    /// <summary>
    /// Retrieves the currently active project.
    /// </summary>
    /// <param name="ct">Cancellation token</param>
    /// <returns>The active project if one exists</returns>
    [HttpGet("active/current")]
    [ProducesResponseType(typeof(ProjectResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult<ProjectResponse>> GetActiveProjectAsync(CancellationToken ct)
    {
        var result = await _projectRepository.GetActiveAsync(ct);

        if (!result.IsSuccess)
        {
            _logger.LogError("Failed to retrieve active project: {Error}", result.Error);
            return BadRequest(new { error = result.Error });
        }

        if (result.Value is null)
        {
            _logger.LogInformation("No active project found");
            return NoContent();
        }

        var response = MapToProjectResponse(result.Value);
        return Ok(response);
    }

    /// <summary>
    /// Updates an existing project.
    /// </summary>
    /// <param name="id">Project ID</param>
    /// <param name="request">Project update request</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>The updated project</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ProjectResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectResponse>> UpdateProjectAsync(
        Guid id,
        [FromBody] UpdateProjectRequest request,
        CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (id == Guid.Empty)
        {
            _logger.LogWarning("Update project failed: invalid ID");
            return BadRequest(new { error = "Project ID must be a valid GUID" });
        }

        // Validation
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            _logger.LogWarning("Update project failed: name is empty");
            return BadRequest(new { error = "Project name is required and cannot be empty" });
        }

        if (request.Name.Length > 100)
        {
            _logger.LogWarning("Update project failed: name exceeds 100 characters");
            return BadRequest(new { error = "Project name cannot exceed 100 characters" });
        }

        if (request.Goal?.Length > 500)
        {
            _logger.LogWarning("Update project failed: goal exceeds 500 characters");
            return BadRequest(new { error = "Project goal cannot exceed 500 characters" });
        }

        // Retrieve existing project
        var getResult = await _projectRepository.GetByIdAsync(id, ct);

        if (!getResult.IsSuccess)
        {
            _logger.LogWarning("Project not found for update: {ProjectId}", id);
            return NotFound(new { error = $"Project with ID {id} not found" });
        }

        var project = getResult.Value!;
        project.Name = request.Name.Trim();
        project.Goal = request.Goal?.Trim();

        var updateResult = await _projectRepository.UpdateAsync(project, ct);

        if (!updateResult.IsSuccess)
        {
            _logger.LogError("Failed to update project {ProjectId}: {Error}", id, updateResult.Error);
            return BadRequest(new { error = updateResult.Error });
        }

        _logger.LogInformation("Project {ProjectId} updated successfully", id);
        var response = MapToProjectResponse(updateResult.Value!);
        return Ok(response);
    }

    /// <summary>
    /// Sets a project as active (deactivates all others).
    /// </summary>
    /// <param name="id">Project ID to activate</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>The activated project</returns>
    [HttpPost("{id:guid}/activate")]
    [ProducesResponseType(typeof(ProjectResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectResponse>> ActivateProjectAsync(
        Guid id,
        CancellationToken ct)
    {
        if (id == Guid.Empty)
        {
            _logger.LogWarning("Activate project failed: invalid ID");
            return BadRequest(new { error = "Project ID must be a valid GUID" });
        }

        var result = await _projectRepository.SetActiveAsync(id, ct);

        if (!result.IsSuccess)
        {
            _logger.LogWarning("Failed to activate project {ProjectId}: {Error}", id, result.Error);

            // Check if this is a "not found" error
            var getResult = await _projectRepository.GetByIdAsync(id, ct);
            if (!getResult.IsSuccess)
            {
                return NotFound(new { error = $"Project with ID {id} not found" });
            }

            return BadRequest(new { error = result.Error });
        }

        _logger.LogInformation("Project {ProjectId} activated successfully", id);
        var response = MapToProjectResponse(result.Value!);
        return Ok(response);
    }

    /// <summary>
    /// Deletes a project (soft delete - marks as inactive and removes from active status).
    /// </summary>
    /// <param name="id">Project ID</param>
    /// <param name="ct">Cancellation token</param>
    /// <returns>No content on success</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProjectAsync(Guid id, CancellationToken ct)
    {
        if (id == Guid.Empty)
        {
            _logger.LogWarning("Delete project failed: invalid ID");
            return BadRequest(new { error = "Project ID must be a valid GUID" });
        }

        // Retrieve project
        var getResult = await _projectRepository.GetByIdAsync(id, ct);

        if (!getResult.IsSuccess)
        {
            _logger.LogWarning("Project not found for deletion: {ProjectId}", id);
            return NotFound(new { error = $"Project with ID {id} not found" });
        }

        var project = getResult.Value!;
        project.IsActive = false;

        var updateResult = await _projectRepository.UpdateAsync(project, ct);

        if (!updateResult.IsSuccess)
        {
            _logger.LogError("Failed to delete project {ProjectId}: {Error}", id, updateResult.Error);
            return BadRequest(new { error = updateResult.Error });
        }

        _logger.LogInformation("Project {ProjectId} deleted successfully", id);
        return NoContent();
    }

    /// <summary>
    /// Maps a Project model to a ProjectResponse DTO.
    /// </summary>
    private static ProjectResponse MapToProjectResponse(Project project)
    {
        return new ProjectResponse
        {
            Id = project.Id,
            Name = project.Name,
            Goal = project.Goal,
            StartDate = project.StartDate,
            IsActive = project.IsActive,
            CreatedAt = project.CreatedAt
        };
    }
}
