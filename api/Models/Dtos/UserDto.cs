using System;
using System.Collections.Generic;

namespace api.Models.Dtos
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public List<RiffDto> Riffs { get; set; } = new List<RiffDto>();
    }
}
