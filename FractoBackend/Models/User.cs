using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FractoBackend.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        [MaxLength(255)]
        public string? Username { get; set; }

        [MaxLength(255)]
        public string? Password { get; set; } // Hashed password

        [Required]
        [MaxLength(50)]
        public string? Role { get; set; } // e.g., "User", "Admin"

        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public ICollection<Rating> Ratings { get; set; } = new List<Rating>();
    }
}