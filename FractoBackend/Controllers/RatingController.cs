
using Microsoft.AspNetCore.Mvc;
using FractoBackend.Data;
using FractoBackend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Linq;
using System.Threading.Tasks;

namespace FractoBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RatingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RatingController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/Rating
        [HttpPost]
        public async Task<IActionResult> PostRating([FromBody] Rating rating)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized("User not authenticated.");
            }

            rating.UserId = userId;

            // Optional: Check if the user has had a completed appointment with the doctor before allowing a rating.
            // This logic can be added if needed.

            // Check if the user has already rated this doctor
            var existingRating = await _context.Ratings
                .FirstOrDefaultAsync(r => r.DoctorId == rating.DoctorId && r.UserId == userId);

            if (existingRating != null)
            {
                // Update existing rating
                existingRating.RatingValue = rating.RatingValue;
                _context.Ratings.Update(existingRating);
            }
            else
            {
                // Add new rating
                _context.Ratings.Add(rating);
            }

            await _context.SaveChangesAsync();

            // Recalculate and update the doctor's average rating
            var doctor = await _context.Doctors.FindAsync(rating.DoctorId);
            if (doctor != null)
            {
                var ratings = await _context.Ratings
                    .Where(r => r.DoctorId == rating.DoctorId)
                    .ToListAsync();

                if (ratings.Any())
                {
                    doctor.Rating = (decimal)ratings.Average(r => r.RatingValue);
                }
                else
                {
                    doctor.Rating = 0; // Or some default value
                }

                _context.Doctors.Update(doctor);
                await _context.SaveChangesAsync();
            }

            return Ok("Rating submitted successfully.");
        }
    }
}
