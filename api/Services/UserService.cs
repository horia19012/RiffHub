using api.Data;
using api.Models;
using Microsoft.EntityFrameworkCore;
using api.Models.Dtos;

namespace api.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _db;

        public UserService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<User> AddUserAsync(User user)
        {
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            return user;
        }

        public async Task<UserDto?> GetUserByIdAsync(Guid id)
        {
            var user = await _db.Users
                .Where(u => u.Id == id)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    Riffs = u.Riffs.Select(r => new RiffDto
                    {
                        Id = r.Id,
                        Url = r.Url,
                        CreatedAt = r.CreatedAt,
                        UserId = r.UserId,
                        CommentIds = r.Comments.Select(c => c.Id).ToList(),
                        ReactionIds = r.Reactions.Select(rx => rx.Id).ToList()
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            return user;
        }

        public async Task<List<UserDto>> GetAllUsersAsync()
        {
            return await _db.Users
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    Riffs = u.Riffs.Select(r => new RiffDto
                    {
                        Id = r.Id,
                        Url = r.Url,
                        CreatedAt = r.CreatedAt,
                        UserId = r.UserId,
                        CommentIds = r.Comments.Select(c => c.Id).ToList(),
                        ReactionIds = r.Reactions.Select(rx => rx.Id).ToList()
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<User?> UpdateAsync(Guid id, User user)
        {
            var existing = await _db.Users.FindAsync(id);
            if (existing == null) return null;

            existing.Username = user.Username;
            existing.Email = user.Email;
            existing.Password = user.Password;

            await _db.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return false;

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
