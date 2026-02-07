using api.Models;
using api.Models.Dtos;
namespace api.Services
{
    public interface ICommentService
    {
        Task<Comment> AddAsync(Comment comment);
        Task<CommentDto?> GetByIdAsync(Guid id);
        Task<List<CommentDto>> GetAllAsync();
        Task<Comment?> UpdateAsync(Guid id, Comment comment);
        Task<bool> DeleteAsync(Guid id);
    }
}
