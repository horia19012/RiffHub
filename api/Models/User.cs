
namespace api.Models
{
    public class User
    {
       public int Id { get; set; }
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;

    public ICollection<Riff> Riffs { get; set; } = new List<Riff>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();

    public ICollection<User> Friends { get; set; } = new List<User>();

    }
}