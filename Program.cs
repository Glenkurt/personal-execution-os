#nullable enable
using Microsoft.EntityFrameworkCore;
using PersonalExecutionOS.Infrastructure.Data;
using PersonalExecutionOS.Infrastructure.Repositories;
using PersonalExecutionOS.API.Middleware;
using PersonalExecutionOS.Core.Interfaces;
using PersonalExecutionOS.Core.Services;

var builder = WebApplication.CreateBuilder(args);

var useHttpsRedirection = builder.Configuration.GetValue("UseHttpsRedirection", true);
var applyMigrationsOnStartup = builder.Configuration.GetValue("ApplyMigrationsOnStartup", false);

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

// Add CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? new[] { "http://localhost:4200" };
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecifiedOrigins", policyBuilder =>
    {
        policyBuilder
            .WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Add controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

var app = builder.Build();

// Use global exception handler middleware
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

// Enable CORS
app.UseCors("AllowSpecifiedOrigins");

if (applyMigrationsOnStartup && !app.Environment.IsEnvironment("Testing"))
{
    app.Logger.LogInformation("ApplyMigrationsOnStartup enabled. Applying EF Core migrations...");

    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();

    app.Logger.LogInformation("EF Core migrations applied successfully.");
}

if (useHttpsRedirection)
{
    app.UseHttpsRedirection();
}

// Serve static files (wwwroot)
// UseDefaultFiles enables serving / as /index.html
app.UseDefaultFiles();
app.UseStaticFiles();

// Map controllers
app.MapControllers();

// Health check endpoint
app.MapGet("/health", () =>
{
    return Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
})
.WithName("Health");

app.Run();
