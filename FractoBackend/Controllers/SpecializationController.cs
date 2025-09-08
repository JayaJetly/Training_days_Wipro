using Microsoft.AspNetCore.Mvc;
using FractoBackend.Data;
using FractoBackend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace FractoBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] // Only Admins can manage specializations
    public class SpecializationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SpecializationController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Specialization
        [HttpGet]
        [AllowAnonymous] // Allow anyone to view specializations
        public async Task<ActionResult<IEnumerable<Specialization>>> GetSpecializations()
        {
            return await _context.Specializations.ToListAsync();
        }

        // GET: api/Specialization/5
        [HttpGet("{id}")]
        [AllowAnonymous] // Allow anyone to view specializations
        public async Task<ActionResult<Specialization>> GetSpecialization(int id)
        {
            var specialization = await _context.Specializations.FindAsync(id);

            if (specialization == null)
            {
                return NotFound();
            }

            return specialization;
        }

        // POST: api/Specialization
        [HttpPost]
        public async Task<ActionResult<Specialization>> PostSpecialization(Specialization specialization)
        {
            if (string.IsNullOrEmpty(specialization.SpecializationName))
            {
                return BadRequest("Specialization name cannot be empty.");
            }

            if (await _context.Specializations.AnyAsync(s => s.SpecializationName != null && s.SpecializationName.ToLower() == specialization.SpecializationName.ToLower()))
            {
                return Conflict("A specialization with this name already exists.");
            }

            _context.Specializations.Add(specialization);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSpecialization", new { id = specialization.SpecializationId }, specialization);
        }

        // PUT: api/Specialization/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSpecialization(int id, Specialization specialization)
        {
            if (id != specialization.SpecializationId)
            {
                return BadRequest();
            }

            var existingSpecialization = await _context.Specializations.FindAsync(id);
            if (existingSpecialization == null)
            {
                return NotFound();
            }

            existingSpecialization.SpecializationName = specialization.SpecializationName;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SpecializationExists(id))
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

        // DELETE: api/Specialization/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSpecialization(int id)
        {
            var specialization = await _context.Specializations.FindAsync(id);
            if (specialization == null)
            {
                return NotFound();
            }

            _context.Specializations.Remove(specialization);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SpecializationExists(int id)
        {
            return _context.Specializations.Any(e => e.SpecializationId == id);
        }
    }
}