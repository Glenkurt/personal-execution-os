#nullable enable
namespace PersonalExecutionOS.Infrastructure.Repositories;

using Microsoft.EntityFrameworkCore;
using PersonalExecutionOS.Core.Interfaces;
using PersonalExecutionOS.Core.Models;
using PersonalExecutionOS.Infrastructure.Data;

/// <summary>
/// Repository implementation for Project entity.
/// </summary>
public class ProjectRepository : IProjectRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ProjectRepository> _logger;

    public ProjectRepository(ApplicationDbContext context, ILogger<ProjectRepository> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<ServiceResult<Project>> CreateAsync(Project project, CancellationToken ct = default)
    {
        try
        {
            ArgumentNullException.ThrowIfNull(project);

            // If this project is being set as active, deactivate others
            if (project.IsActive)
            {
                var activeProjects = await _context.Projects
                    .Where(p => p.IsActive)
                    .ToListAsync(ct);

                foreach (var activeProject in activeProjects)
                {
                    activeProject.IsActive = false;
                }
            }

            _context.Projects.Add(project);
            await _context.SaveChangesAsync(ct);

            _logger.LogInformation("Project created: {ProjectId} - {ProjectName}", project.Id, project.Name);
            return ServiceResult<Project>.Success(project);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating project");
            return ServiceResult<Project>.Failure($"Failed to create project: {ex.Message}");
        }
    }

    public async Task<ServiceResult<Project>> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        try
        {
            var project = await _context.Projects.FindAsync(new object[] { id }, cancellationToken: ct);

            if (project is null)
            {
                _logger.LogWarning("Project not found: {ProjectId}", id);
                return ServiceResult<Project>.Failure($"Project with ID {id} not found");
            }

            return ServiceResult<Project>.Success(project);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving project {ProjectId}", id);
            return ServiceResult<Project>.Failure($"Failed to retrieve project: {ex.Message}");
        }
    }

    public async Task<ServiceResult<List<Project>>> GetAllAsync(CancellationToken ct = default)
    {
        try
        {
            var projects = await _context.Projects.ToListAsync(ct);
            return ServiceResult<List<Project>>.Success(projects);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all projects");
            return ServiceResult<List<Project>>.Failure($"Failed to retrieve projects: {ex.Message}");
        }
    }

    public async Task<ServiceResult<Project>> SetActiveAsync(Guid projectId, CancellationToken ct = default)
    {
        try
        {
            var project = await _context.Projects.FindAsync(new object[] { projectId }, cancellationToken: ct);

            if (project is null)
            {
                return ServiceResult<Project>.Failure($"Project with ID {projectId} not found");
            }

            // Deactivate all other projects
            var otherProjects = await _context.Projects
                .Where(p => p.IsActive && p.Id != projectId)
                .ToListAsync(ct);

            foreach (var otherProject in otherProjects)
            {
                otherProject.IsActive = false;
            }

            // Activate the target project
            project.IsActive = true;

            await _context.SaveChangesAsync(ct);

            _logger.LogInformation("Project activated: {ProjectId}", projectId);
            return ServiceResult<Project>.Success(project);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting project as active: {ProjectId}", projectId);
            return ServiceResult<Project>.Failure($"Failed to activate project: {ex.Message}");
        }
    }

    public async Task<ServiceResult<Project>> UpdateAsync(Project project, CancellationToken ct = default)
    {
        try
        {
            ArgumentNullException.ThrowIfNull(project);

            var existingProject = await _context.Projects.FindAsync(new object[] { project.Id }, cancellationToken: ct);

            if (existingProject is null)
            {
                return ServiceResult<Project>.Failure($"Project with ID {project.Id} not found");
            }

            existingProject.Name = project.Name;
            existingProject.Goal = project.Goal;
            existingProject.IsActive = project.IsActive;

            if (existingProject.IsActive)
            {
                var otherProjects = await _context.Projects
                    .Where(p => p.IsActive && p.Id != project.Id)
                    .ToListAsync(ct);

                foreach (var otherProject in otherProjects)
                {
                    otherProject.IsActive = false;
                }
            }

            await _context.SaveChangesAsync(ct);

            _logger.LogInformation("Project updated: {ProjectId}", project.Id);
            return ServiceResult<Project>.Success(existingProject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating project {ProjectId}", project.Id);
            return ServiceResult<Project>.Failure($"Failed to update project: {ex.Message}");
        }
    }

    public async Task<ServiceResult<Project?>> GetActiveAsync(CancellationToken ct = default)
    {
        try
        {
            var activeProject = await _context.Projects
                .FirstOrDefaultAsync(p => p.IsActive, cancellationToken: ct);

            return ServiceResult<Project?>.Success(activeProject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active project");
            return ServiceResult<Project?>.Failure($"Failed to retrieve active project: {ex.Message}");
        }
    }
}
