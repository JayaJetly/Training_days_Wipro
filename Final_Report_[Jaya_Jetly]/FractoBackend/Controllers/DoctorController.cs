using Microsoft.AspNetCore.Mvc;
using FractoBackend.Data;
using FractoBackend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using FractoBackend.DTOs;

namespace FractoBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DoctorController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DoctorController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Doctor
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Doctor>>> GetDoctors()
        {
            return await _context.Doctors.Include(d => d.Specialization).ToListAsync();
        }

        // GET: api/Doctor/search
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Doctor>>> SearchDoctors(
            [FromQuery] string? city,
            [FromQuery] int? specializationId,
            [FromQuery] decimal? minRating,
            [FromQuery] string? date)
        {
            var query = _context.Doctors.Include(d => d.Specialization).AsQueryable();

            if (!string.IsNullOrEmpty(city))
            {
                query = query.Where(d => d.City != null && d.City.Contains(city));
            }

            if (specializationId.HasValue && specializationId.Value > 0)
            {
                query = query.Where(d => d.SpecializationId == specializationId.Value);
            }

            if (minRating.HasValue && minRating.Value >= 0)
            {
                query = query.Where(d => d.Rating >= minRating.Value);
            }

            if (!string.IsNullOrEmpty(date))
            {
                if (DateTime.TryParse(date, out DateTime appointmentDate))
                {
                    // Filter out doctors who have appointments on the specified date
                    query = query.Where(d => !_context.Appointments
                        .Any(a => a.DoctorId == d.DoctorId &&
                                  a.AppointmentDate.Date == appointmentDate.Date));
                }
            }

            return await query.ToListAsync();
        }

        // GET: api/Doctor/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Doctor>> GetDoctor(int id)
        {
            var doctor = await _context.Doctors.Include(d => d.Specialization).FirstOrDefaultAsync(d => d.DoctorId == id);

            if (doctor == null)
            {
                return NotFound();
            }

            return doctor;
        }

        // POST: api/Doctor
        [HttpPost]
        [Authorize(Roles = "Admin")] // Only Admins can add doctors
        public async Task<ActionResult<Doctor>> PostDoctor(CreateDoctorDto createDoctorDto)
        {
            var doctor = new Doctor
            {
                Name = createDoctorDto.Name,
                SpecializationId = createDoctorDto.SpecializationId,
                City = createDoctorDto.City,
                Rating = (decimal)createDoctorDto.Rating
            };

            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDoctor", new { id = doctor.DoctorId }, doctor);
        }

        // PUT: api/Doctor/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")] // Only Admins can update doctors
        public async Task<IActionResult> PutDoctor(int id, Doctor doctor)
        {
            if (id != doctor.DoctorId)
            {
                return BadRequest();
            }

            var existingDoctor = await _context.Doctors.FindAsync(id);
            if (existingDoctor == null)
            {
                return NotFound();
            }

            existingDoctor.Name = doctor.Name;
            existingDoctor.SpecializationId = doctor.SpecializationId;
            existingDoctor.City = doctor.City;
            existingDoctor.Rating = doctor.Rating;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DoctorExists(id))
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

        // DELETE: api/Doctor/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Only Admins can delete doctors
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            var doctor = await _context.Doctors.FindAsync(id);
            if (doctor == null)
            {
                return NotFound();
            }

            _context.Doctors.Remove(doctor);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DoctorExists(int id)
        {
            return _context.Doctors.Any(e => e.DoctorId == id);
        }
    }
}