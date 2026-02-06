using api.Models;
using Microsoft.EntityFrameworkCore;
namespace api.Data
{

    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Riff> Riffs { get; set; } = null!;
        public DbSet<Comment> Comments { get; set; } = null!;
        public DbSet<Reaction> Reactions { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User-Riff one-to-many
            modelBuilder.Entity<Riff>()
                .HasOne(r => r.User)
                .WithMany(u => u.Riffs)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Comment-Riff
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Riff)
                .WithMany(r => r.Comments)
                .HasForeignKey(c => c.RiffId)
                .OnDelete(DeleteBehavior.Cascade); 

            // Comment-User
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict); 

            // Reaction-Riff
            modelBuilder.Entity<Reaction>()
                .HasOne(r => r.Riff)
                .WithMany(rf => rf.Reactions)
                .HasForeignKey(r => r.RiffId)
                .OnDelete(DeleteBehavior.Cascade); 

            // Reaction-User
            modelBuilder.Entity<Reaction>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reactions)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict); 

            // Self-referencing Friends (many-to-many)
            modelBuilder.Entity<User>()
                .HasMany(u => u.Friends)
                .WithMany() 
                .UsingEntity<Dictionary<string, object>>(
                    "UserFriend",
                    j => j.HasOne<User>()
                          .WithMany()
                          .HasForeignKey("FriendId")
                          .OnDelete(DeleteBehavior.Restrict), 
                    j => j.HasOne<User>()
                          .WithMany()
                          .HasForeignKey("UserId")
                          .OnDelete(DeleteBehavior.Restrict)  
                );
        }
    }
}