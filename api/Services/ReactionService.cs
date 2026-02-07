using api.Data;
using api.Models;
using api.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace api.Services
{
    public class ReactionService : IReactionService
    {
        private readonly ApplicationDbContext _db;

        public ReactionService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<List<ReactionDto>> GetAllAsync()
        {
            return await _db.Reactions
                .Select(r => new ReactionDto
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    RiffId = r.RiffId,
                    Type = r.Type
                })
                .ToListAsync();
        }

        public async Task<ReactionDto?> GetByIdAsync(Guid id)
        {
            var reaction = await _db.Reactions
                .Where(r => r.Id == id)
                .Select(r => new ReactionDto
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    RiffId = r.RiffId,
                    Type = r.Type
                })
                .FirstOrDefaultAsync();

            return reaction;
        }

        public async Task<Reaction> AddAsync(Reaction reaction)
        {
            _db.Reactions.Add(reaction);
            await _db.SaveChangesAsync();
            return reaction;
        }

        public async Task<Reaction?> UpdateAsync(Guid id, Reaction reaction)
        {
            var existing = await _db.Reactions.FindAsync(id);
            if (existing == null) return null;

            existing.Type = reaction.Type;

            await _db.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var existing = await _db.Reactions.FindAsync(id);
            if (existing == null) return false;

            _db.Reactions.Remove(existing);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
