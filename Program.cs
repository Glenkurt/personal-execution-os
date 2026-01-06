#nullable enable
using Microsoft.EntityFrameworkCore;
using PersonalExecutionOS.Infrastructure.Data;
using PersonalExecutionOS.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Configure PostgreSQL Database
var connectionString = builder.Configuration.GetConnectionString("PostgresConnection")
    ?? throw new InvalidOperationException("Connection string 'PostgresConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddLogging();

var app = builder.Build();

// Use global exception handler middleware
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

app.UseHttpsRedirection();

// Health check endpoint
app.MapGet("/health", () =>
{
    return Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
})
.WithName("Health");

app.Run();
