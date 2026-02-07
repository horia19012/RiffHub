using api.Models;
using api.Models.Dtos;

namespace api.Services
{
    public interface IReactionService
    {
        Task<Reaction> AddAsync(Reaction reaction);
        Task<ReactionDto?> GetByIdAsync(Guid id);
        Task<List<ReactionDto>> GetAllAsync();
        Task<Reaction?> UpdateAsync(Guid id, Reaction reaction);
        Task<bool> DeleteAsync(Guid id);
    }
}
