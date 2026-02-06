using api.Models;
namespace api.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int RiffId { get; set; }
        public Riff Riff { get; set; } = null!;
    }
}