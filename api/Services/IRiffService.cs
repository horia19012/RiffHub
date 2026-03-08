using api.Models;
using api.Models.Dtos;

namespace api.Services
{
    public interface IRiffService
    {
        Task<Riff> AddAsync(Riff riff);
        Task<RiffDto?> GetByIdAsync(Guid id);
        Task<List<RiffDto>> GetAllAsync();
        Task<List<RiffDto>> GetByUserIdAsync(Guid userId);
        Task<List<RiffDto>> GetTrendingAsync(int top = 20);
        Task<Riff?> UpdateAsync(Guid id, Riff riff);
        Task<bool> DeleteAsync(Guid id);
    }
}