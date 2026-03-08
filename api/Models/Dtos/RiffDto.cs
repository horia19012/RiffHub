namespace api.Models.Dtos
{
    public class RiffDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Username { get; set; } = null!;
        public string Url { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public List<Guid> CommentIds { get; set; } = new();
        public List<Guid> ReactionIds { get; set; } = new();
        public int LikeCount { get; set; }
        public int DislikeCount { get; set; }
    }
}