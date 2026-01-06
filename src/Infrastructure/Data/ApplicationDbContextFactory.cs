using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using PersonalExecutionOS.Infrastructure.Data;

namespace PersonalExecutionOS;

/// <summary>
/// Design-time DbContext factory for Entity Framework migrations.
/// This allows EF Core CLI tools to create migrations without requiring a full application startup.
/// </summary>
public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        
        var connectionString = "Host=localhost;Port=5432;Database=PersonalExecutionOS;Username=postgres;Password=postgres";
        optionsBuilder.UseNpgsql(connectionString);

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
