namespace FractoBackend.DTOs
{
    public class UserDto
    {
        public int UserId { get; set; }
        public required string Username { get; set; }
        public required string Role { get; set; }
    }
}