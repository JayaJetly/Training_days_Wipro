namespace FractoBackend.DTOs
{
    public class CreateDoctorDto
    {
        public required string Name { get; set; }
        public int SpecializationId { get; set; }
        public required string City { get; set; }
        public double Rating { get; set; }
    }
}