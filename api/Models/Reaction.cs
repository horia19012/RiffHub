using api.Models;
namespace api.Models
{
    public class Reaction
    {
        public int Id { get; set; }
        public bool IsLike { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int RiffId { get; set; }
        public Riff Riff { get; set; } = null!;
    }
}