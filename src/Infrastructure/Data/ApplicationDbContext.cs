#nullable enable
namespace PersonalExecutionOS.Infrastructure.Data;

using Microsoft.EntityFrameworkCore;
using PersonalExecutionOS.Core.Models;

/// <summary>
/// Application database context for Personal Execution OS.
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<DailyLog> DailyLogs => Set<DailyLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Project entity
        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(100);
            entity.Property(p => p.Goal).HasMaxLength(500);
            entity.Property(p => p.StartDate).IsRequired();
            
            // Only one active project at a time
            entity.HasIndex(p => p.IsActive)
                .IsUnique()
                .HasFilter("\"IsActive\" = true");
        });

        // Configure DailyLog entity
        modelBuilder.Entity<DailyLog>(entity =>
        {
            entity.HasKey(dl => dl.Id);
            entity.Property(dl => dl.Date).IsRequired();
            entity.Property(dl => dl.TaskDescription).IsRequired().HasMaxLength(500);
            entity.Property(dl => dl.OutputDescription).IsRequired().HasMaxLength(1000);
            entity.Property(dl => dl.RevenueGenerated).HasPrecision(18, 2);
            entity.Property(dl => dl.Note).HasMaxLength(1000);

            // Relationships
            entity.HasOne<Project>()
                .WithMany()
                .HasForeignKey(dl => dl.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // Index for performance queries
            entity.HasIndex(dl => dl.ProjectId);
            entity.HasIndex(dl => dl.Date);
        });
    }
}
