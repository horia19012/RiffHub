using api.Models.Enums;
using System;

namespace api.Models
{
    public class Reaction
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid UserId { get; set; }
        public Guid RiffId { get; set; }

        public ReactionType Type { get; set; }

        public User? User { get; set; }
        public Riff? Riff { get; set; }
    }
}
