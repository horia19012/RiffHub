using System;
using api.Models.Enums;

namespace api.Models.Dtos
{
    public class ReactionDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid RiffId { get; set; }
        public ReactionType Type { get; set; }
    }
}
