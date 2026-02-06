using api.Models;

namespace api.Services
{
    public interface IUserService
    {
        Task<User> AddUserAsync(User user);
        Task<User?> GetUserByIdAsync(int id);
        Task<IEnumerable<User>> GetAllUsersAsync();
    }
}