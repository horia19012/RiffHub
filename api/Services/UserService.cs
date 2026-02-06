using api.Data;
using api.Models;
using Microsoft.EntityFrameworkCore;

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

        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _db.Users
                .Include(u => u.Riffs)
                .Include(u => u.Comments)
                .Include(u => u.Reactions)
                .Include(u => u.Friends)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _db.Users
                .Include(u => u.Riffs)
                .Include(u => u.Comments)
                .Include(u => u.Reactions)
                .Include(u => u.Friends)
                .ToListAsync();
        }
    }
}
