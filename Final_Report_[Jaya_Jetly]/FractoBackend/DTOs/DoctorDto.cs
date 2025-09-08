namespace FractoBackend.DTOs
{
    public class DoctorDto
    {
        public int DoctorId { get; set; }
        public required string Name { get; set; }
        public int SpecializationId { get; set; }
        public SpecializationDto? Specialization { get; set; }
        public required string City { get; set; }
        public double Rating { get; set; }
    }
}