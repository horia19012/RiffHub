using api.Data;
using api.Models;
using api.Models.Dtos;
using api.Models.Enums;
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

        private IQueryable<RiffDto> ProjectToDto(IQueryable<Riff> query)
        {
            return query.Select(r => new RiffDto
            {
                Id = r.Id,
                UserId = r.UserId,
                Username = r.User != null ? r.User.Username : "Unknown",
                Url = r.Url,
                CreatedAt = r.CreatedAt,
                CommentIds = r.Comments.Select(c => c.Id).ToList(),
                ReactionIds = r.Reactions.Select(rx => rx.Id).ToList(),
                LikeCount = r.Reactions.Count(rx => rx.Type == ReactionType.Like),
                DislikeCount = r.Reactions.Count(rx => rx.Type == ReactionType.Dislike)
            });
        }

        public async Task<List<RiffDto>> GetAllAsync()
        {
            return await ProjectToDto(_db.Riffs.Include(r => r.User))
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<RiffDto?> GetByIdAsync(Guid id)
        {
            return await ProjectToDto(_db.Riffs.Include(r => r.User).Where(r => r.Id == id))
                .FirstOrDefaultAsync();
        }

        public async Task<List<RiffDto>> GetByUserIdAsync(Guid userId)
        {
            return await ProjectToDto(_db.Riffs.Include(r => r.User).Where(r => r.UserId == userId))
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<RiffDto>> GetTrendingAsync(int top = 20)
        {
            return await ProjectToDto(_db.Riffs.Include(r => r.User))
                .OrderByDescending(r => r.LikeCount)
                .ThenByDescending(r => r.CreatedAt)
                .Take(top)
                .ToListAsync();
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