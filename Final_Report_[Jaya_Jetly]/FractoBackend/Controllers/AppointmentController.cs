using Microsoft.AspNetCore.Mvc;
using FractoBackend.Data;
using FractoBackend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using FractoBackend.Services;
using FractoBackend.DTOs;

namespace FractoBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AppointmentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly NotificationService _notificationService;

        public AppointmentController(ApplicationDbContext context, NotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        // GET: api/Appointment/doctor/{doctorId}/date/{date}
        [HttpGet("doctor/{doctorId}/date/{date}")]
        [AllowAnonymous] // Allow anyone to view available slots
        public async Task<ActionResult<IEnumerable<string>>> GetAvailableTimeSlots(int doctorId, DateTime date)
        {
            // Define all possible time slots (e.g., every hour from 9 AM to 5 PM)
            var allTimeSlots = new List<string>();
            for (int i = 9; i <= 17; i++)
            {
                allTimeSlots.Add($"{i:00}:00");
            }

            // Get booked slots for the doctor on the specified date
            var bookedSlots = await _context.Appointments
                .Where(a => a.DoctorId == doctorId && a.AppointmentDate.Date == date.Date && a.Status == "Booked")
                .Select(a => a.TimeSlot)
                .ToListAsync();

            // Calculate available slots
            var availableSlots = allTimeSlots.Except(bookedSlots).ToList();

            return Ok(availableSlots);
        }

        // POST: api/Appointment/book
        [HttpPost("book")]
        public async Task<IActionResult> BookAppointment([FromBody] Appointment appointment)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized("User not authenticated.");
            }

            // Ensure the appointment belongs to the authenticated user
            appointment.UserId = userId;
            appointment.Status = "Booked"; // Default status

            // Check if the slot is already booked
            var isBooked = await _context.Appointments.AnyAsync(
                a => a.DoctorId == appointment.DoctorId &&
                     a.AppointmentDate.Date == appointment.AppointmentDate.Date &&
                     a.TimeSlot == appointment.TimeSlot &&
                     a.Status == "Booked"
            );

            if (isBooked)
            {
                return BadRequest("This time slot is already booked.");
            }

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            // Send notification to the user who booked the appointment
            await _notificationService.CreateNotificationAsync(userId, $"Your appointment with Doctor {appointment.DoctorId} on {appointment.AppointmentDate.ToShortDateString()} at {appointment.TimeSlot} has been booked.");

            // Optionally, send notification to the doctor
            // You would need to get the doctor's UserId from the Doctor model or a related table
            // For now, let's assume we can get the doctor's user ID
            var doctor = await _context.Doctors.FindAsync(appointment.DoctorId);
            if (doctor != null && doctor.UserId.HasValue)
            {
                await _notificationService.CreateNotificationAsync(doctor.UserId.Value, $"A new appointment has been booked for you on {appointment.AppointmentDate.ToShortDateString()} at {appointment.TimeSlot}.");
            }

            // Optionally, send notification to admin
            // You would need a way to identify admin users (e.g., a specific admin user ID or a group)
            // For now, this is commented out.
            // await _notificationService.CreateNotificationAsync(adminUserId, $"New appointment booked by user {userId} with Doctor {appointment.DoctorId}.");

            return Ok("Appointment booked successfully.");
        }

        // GET: api/Appointment/user
        [HttpGet("user")]
        public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetUserAppointments()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized("User not authenticated.");
            }

            var appointments = await _context.Appointments
                .Where(a => a.UserId == userId)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d!.Specialization)
                .Select(a => new AppointmentDto
                {
                    AppointmentId = a.AppointmentId,
                    UserId = a.UserId,
                    User = a.User != null ? new UserDto
                    {
                        UserId = a.User!.UserId,
                        Username = a.User!.Username,
                        Role = a.User!.Role
                    } : null,
                    DoctorId = a.DoctorId,
                    Doctor = a.Doctor != null ? new DoctorDto
                    {
                        DoctorId = a.Doctor.DoctorId,
                        Name = a.Doctor.Name,
                        SpecializationId = a.Doctor.SpecializationId,
                        Specialization = a.Doctor.Specialization != null ? new SpecializationDto
                        {
                            SpecializationId = a.Doctor.Specialization!.SpecializationId,
                            SpecializationName = a.Doctor.Specialization!.SpecializationName
                        } : null,
                        City = a.Doctor.City,
                        Rating = (double)a.Doctor.Rating
                    } : null,
                    AppointmentDate = a.AppointmentDate,
                    TimeSlot = a.TimeSlot,
                    Status = a.Status
                })
                .ToListAsync();

            return Ok(appointments);
        }

        // PUT: api/Appointment/cancel/{id}
        [HttpPut("cancel/{id}")]
        public async Task<IActionResult> CancelAppointment(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized("User not authenticated.");
            }

            var appointment = await _context.Appointments.FindAsync(id);

            if (appointment == null)
            {
                return NotFound("Appointment not found.");
            }

            // Only allow the user who booked it or an admin to cancel
            if (appointment.UserId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            appointment.Status = "Cancelled";
            _context.Entry(appointment).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                // Send notification to the user who cancelled the appointment
                await _notificationService.CreateNotificationAsync(userId, $"Your appointment with Doctor {appointment.DoctorId} on {appointment.AppointmentDate.ToShortDateString()} at {appointment.TimeSlot} has been cancelled.");

                // Optionally, send notification to the doctor
                var doctor = await _context.Doctors.FindAsync(appointment.DoctorId);
                if (doctor != null && doctor.UserId.HasValue)
                {
                    await _notificationService.CreateNotificationAsync(doctor.UserId.Value, $"An appointment for you on {appointment.AppointmentDate.ToShortDateString()} at {appointment.TimeSlot} has been cancelled.");
                }

            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AppointmentExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // Admin Endpoints
        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<AppointmentDto>>> GetAllAppointments()
        {
            var appointments = await _context.Appointments
                .Include(a => a.User)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d.Specialization)
                .Select(a => new AppointmentDto
                {
                    AppointmentId = a.AppointmentId,
                    UserId = a.UserId,
                    User = a.User != null ? new UserDto
                    {
                        UserId = a.User!.UserId,
                        Username = a.User!.Username,
                        Role = a.User!.Role
                    } : null,
                    DoctorId = a.DoctorId,
                    Doctor = a.Doctor != null ? new DoctorDto
                    {
                        DoctorId = a.Doctor.DoctorId,
                        Name = a.Doctor.Name,
                        SpecializationId = a.Doctor.SpecializationId,
                        Specialization = a.Doctor.Specialization != null ? new SpecializationDto
                        {
                            SpecializationId = a.Doctor.Specialization!.SpecializationId,
                            SpecializationName = a.Doctor.Specialization!.SpecializationName
                        } : null,
                        City = a.Doctor.City,
                        Rating = (double)a.Doctor.Rating
                    } : null,
                    AppointmentDate = a.AppointmentDate,
                    TimeSlot = a.TimeSlot,
                    Status = a.Status
                })
                .ToListAsync();

            return Ok(appointments);
        }

        [HttpPut("admin/approve/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveAppointment(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);

            if (appointment == null)
            {
                return NotFound("Appointment not found.");
            }

            appointment.Status = "Approved";
            _context.Entry(appointment).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                // Send notification to the user whose appointment was approved
                await _notificationService.CreateNotificationAsync(appointment.UserId, $"Your appointment with Doctor {appointment.DoctorId} on {appointment.AppointmentDate.ToShortDateString()} at {appointment.TimeSlot} has been approved.");

                // Optionally, send notification to the doctor
                var doctor = await _context.Doctors.FindAsync(appointment.DoctorId);
                if (doctor != null && doctor.UserId.HasValue)
                {
                    await _notificationService.CreateNotificationAsync(doctor.UserId.Value, $"An appointment for you on {appointment.AppointmentDate.ToShortDateString()} at {appointment.TimeSlot} has been approved.");
                }

            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AppointmentExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpPut("admin/cancel/{id}")] // Admin can also cancel, reusing the existing cancel logic
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminCancelAppointment(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);

            if (appointment == null)
            {
                return NotFound("Appointment not found.");
            }

            appointment.Status = "Cancelled";
            _context.Entry(appointment).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                // Send notification to the user whose appointment was cancelled by admin
                await _notificationService.CreateNotificationAsync(appointment.UserId, $"Your appointment with Doctor {appointment.DoctorId} on {appointment.AppointmentDate.ToShortDateString()} at {appointment.TimeSlot} has been cancelled by an administrator.");

                // Optionally, send notification to the doctor
                var doctor = await _context.Doctors.FindAsync(appointment.DoctorId);
                if (doctor != null && doctor.UserId.HasValue)
                {
                    await _notificationService.CreateNotificationAsync(doctor.UserId.Value, $"An appointment for you on {appointment.AppointmentDate.ToShortDateString()} at {appointment.TimeSlot} has been cancelled by an administrator.");
                }

            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AppointmentExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpPut("admin/reject/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectAppointment(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);

            if (appointment == null)
            {
                return NotFound("Appointment not found.");
            }

            appointment.Status = "Rejected";
            _context.Entry(appointment).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                // Send notification to the user whose appointment was rejected
                await _notificationService.CreateNotificationAsync(appointment.UserId, $"Your appointment with Doctor {appointment.DoctorId} on {appointment.AppointmentDate.ToShortDateString()} at {appointment.TimeSlot} has been rejected by an administrator.");

                // Optionally, send notification to the doctor
                var doctor = await _context.Doctors.FindAsync(appointment.DoctorId);
                if (doctor != null && doctor.UserId.HasValue)
                {
                    await _notificationService.CreateNotificationAsync(doctor.UserId.Value, $"An appointment for you on {appointment.AppointmentDate.ToShortDateString()} at {appointment.TimeSlot} has been rejected by an administrator.");
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AppointmentExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        private bool AppointmentExists(int id)
        {
            return _context.Appointments.Any(e => e.AppointmentId == id);
        }
    }
}