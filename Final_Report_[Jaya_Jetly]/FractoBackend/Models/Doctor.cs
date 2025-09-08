using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization; // Added for [JsonIgnore]

namespace FractoBackend.Models
{
    public class Doctor
    {
        [Key]
        public int DoctorId { get; set; }

        [Required]
        [MaxLength(255)]
        public string? Name { get; set; }

        [Required]
        public int SpecializationId { get; set; }

        [ForeignKey("SpecializationId")]
        public Specialization? Specialization { get; set; }

        [Required]
        [MaxLength(255)]
        public string? City { get; set; }

        public decimal Rating { get; set; } = 0.0m;

        // Foreign key for User
        public int? UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [JsonIgnore] // Ignore to prevent circular reference during serialization
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        [JsonIgnore] // Ignore to prevent circular reference during serialization
        public ICollection<Rating> Ratings { get; set; } = new List<Rating>();
    }
}