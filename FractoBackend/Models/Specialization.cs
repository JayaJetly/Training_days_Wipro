using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization; // Added for [JsonIgnore]

namespace FractoBackend.Models
{
    public class Specialization
    {
        [Key]
        public int SpecializationId { get; set; }

        [Required]
        [MaxLength(255)]
        public string? SpecializationName { get; set; }

        [JsonIgnore] // Ignore to prevent circular reference during serialization
        public ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
    }
}