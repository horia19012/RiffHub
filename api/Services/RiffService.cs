using api.Data;
using api.Models;
using api.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace api.Services
{
    public class RiffService : IRiffService
    {
        private readonly ApplicationDbContext _db;

        public RiffService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<List<RiffDto>> GetAllAsync()
        {
            return await _db.Riffs
                .Select(r => new RiffDto
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    Url = r.Url,
                    CreatedAt = r.CreatedAt,
                    CommentIds = r.Comments.Select(c => c.Id).ToList(),
                    ReactionIds = r.Reactions.Select(rx => rx.Id).ToList()
                })
                .ToListAsync();
        }

        public async Task<RiffDto?> GetByIdAsync(Guid id)
        {
            var riff = await _db.Riffs
                .Where(r => r.Id == id)
                .Select(r => new RiffDto
                {
                    Id = r.Id,
                    Url = r.Url,
                    CreatedAt = r.CreatedAt,
                    UserId = r.UserId,
                    CommentIds = r.Comments.Select(c => c.Id).ToList(),
                    ReactionIds = r.Reactions.Select(rx => rx.Id).ToList()
                })
                .FirstOrDefaultAsync();

            return riff;
        }

        public async Task<Riff> AddAsync(Riff riff)
        {
            _db.Riffs.Add(riff);
            await _db.SaveChangesAsync();
            return riff;
        }

        public async Task<Riff?> UpdateAsync(Guid id, Riff riff)
        {
            var existing = await _db.Riffs.FindAsync(id);
            if (existing == null) return null;

            existing.Url = riff.Url;
            await _db.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var riff = await _db.Riffs.FindAsync(id);
            if (riff == null) return false;

            _db.Riffs.Remove(riff);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
