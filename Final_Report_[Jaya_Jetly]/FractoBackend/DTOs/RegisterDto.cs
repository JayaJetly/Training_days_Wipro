using System.ComponentModel.DataAnnotations;

namespace FractoBackend.DTOs
{
    public class RegisterDto
    {
        [Required]
        public string? Username { get; set; }

        [Required]
        public string? Password { get; set; }

        public string? Role { get; set; } = "User"; // Default to "User"

        public string? InvitationCode { get; set; }
    }
}