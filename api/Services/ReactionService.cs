using api.Data;
using api.Models;
using api.Models.Dtos;
using api.Models.Enums;
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
                .Select(r => new ReactionDto { Id = r.Id, UserId = r.UserId, RiffId = r.RiffId, Type = r.Type })
                .ToListAsync();
        }

        public async Task<ReactionDto?> GetByIdAsync(Guid id)
        {
            return await _db.Reactions
                .Where(r => r.Id == id)
                .Select(r => new ReactionDto { Id = r.Id, UserId = r.UserId, RiffId = r.RiffId, Type = r.Type })
                .FirstOrDefaultAsync();
        }

        public async Task<ReactionDto> UpsertAsync(Guid userId, Guid riffId, ReactionType type)
        {
            var existing = await _db.Reactions
                .FirstOrDefaultAsync(r => r.UserId == userId && r.RiffId == riffId);

            if (existing != null)
            {
                existing.Type = type;
            }
            else
            {
                existing = new Reaction { UserId = userId, RiffId = riffId, Type = type };
                _db.Reactions.Add(existing);
            }

            await _db.SaveChangesAsync();

            return new ReactionDto { Id = existing.Id, UserId = existing.UserId, RiffId = existing.RiffId, Type = existing.Type };
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