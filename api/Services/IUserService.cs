using api.Models;
using api.Models.Dtos;

namespace api.Services
{
    public interface IUserService
    {
        Task<User> AddUserAsync(User user);
        Task<UserDto?> GetUserByIdAsync(Guid id);
        Task<List<UserDto>> GetAllUsersAsync();
        Task<User?> UpdateAsync(Guid id, User user);
        Task<bool> DeleteAsync(Guid id);
    }
}
