namespace FractoBackend.DTOs
{
    public class AppointmentDto
    {
        public int AppointmentId { get; set; }
        public int UserId { get; set; }
        public UserDto? User { get; set; }
        public int DoctorId { get; set; }
        public DoctorDto? Doctor { get; set; }
        public DateTime AppointmentDate { get; set; }
        public required string TimeSlot { get; set; }
        public required string Status { get; set; }
    }
}