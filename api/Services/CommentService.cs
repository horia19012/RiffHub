using api.Data;
using api.Models;
using api.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace api.Services
{
    public class CommentService : ICommentService
    {
        private readonly ApplicationDbContext _db;

        public CommentService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<List<CommentDto>> GetAllAsync()
        {
            return await _db.Comments
                .Select(c => new CommentDto
                {
                    Id = c.Id,
                    UserId = c.UserId,
                    RiffId = c.RiffId,
                    Username = c.Username,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();
        }


        public async Task<CommentDto?> GetByIdAsync(Guid id)
        {
            var comment = await _db.Comments
                .Where(c => c.Id == id)
                .Select(c => new CommentDto
                {
                    Id = c.Id,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt,
                    UserId = c.UserId,
                    RiffId = c.RiffId
                })
                .FirstOrDefaultAsync();

            return comment;
        }

        public async Task<Comment> AddAsync(Comment comment)
        {
            _db.Comments.Add(comment);
            await _db.SaveChangesAsync();
            return comment;
        }

        public async Task<Comment?> UpdateAsync(Guid id, Comment comment)
        {
            var existing = await _db.Comments.FindAsync(id);
            if (existing == null) return null;

            existing.Content = comment.Content;
            existing.RiffId = comment.RiffId;
            existing.UserId = comment.UserId;

            await _db.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var existing = await _db.Comments.FindAsync(id);
            if (existing == null) return false;

            _db.Comments.Remove(existing);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
