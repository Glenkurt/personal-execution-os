#nullable enable
using Microsoft.EntityFrameworkCore;
using PersonalExecutionOS.Infrastructure.Data;
using PersonalExecutionOS.Infrastructure.Repositories;
using PersonalExecutionOS.API.Middleware;
using PersonalExecutionOS.Core.Interfaces;
using PersonalExecutionOS.Core.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure Database - only add Postgres if not in test environment
if (!builder.Environment.IsEnvironment("Testing"))
{
    var connectionString = builder.Configuration.GetConnectionString("PostgresConnection")
        ?? throw new InvalidOperationException("Connection string 'PostgresConnection' not found.");

    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(connectionString));
}

// Register repositories
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<IDailyLogRepository, DailyLogRepository>();

// Register services
builder.Services.AddScoped<IMetricsService, MetricsService>();

builder.Services.AddLogging();

// Add controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // Use exact property names
    });

var app = builder.Build();

// Use global exception handler middleware
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

app.UseHttpsRedirection();

// Map controllers
app.MapControllers();

// Health check endpoint
app.MapGet("/health", () =>
{
    return Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
})
.WithName("Health");

app.Run();
