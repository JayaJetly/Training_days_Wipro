using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using FractoBackend.Controllers;
using FractoBackend.Data;
using FractoBackend.Models;
using System.Threading.Tasks;
using System.Security.Claims;
using System;
using System.Linq;

namespace FractoBackend.Tests
{
    public class RatingControllerTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly RatingController _controller;

        public RatingControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unique DB for each test
                .Options;
            _context = new ApplicationDbContext(options);
            _context.Database.EnsureCreated();

            // Seed data
            _context.Doctors.Add(new Doctor { DoctorId = 1, Name = "Dr. Alice", SpecializationId = 1, City = "New York", Rating = 0m });
            _context.Doctors.Add(new Doctor { DoctorId = 2, Name = "Dr. Bob", SpecializationId = 2, City = "Los Angeles", Rating = 0m });
            _context.Users.Add(new User { UserId = 100, Username = "testuser", Password = BCrypt.Net.BCrypt.HashPassword("password"), Role = "User" });
            _context.Users.Add(new User { UserId = 101, Username = "anotheruser", Password = BCrypt.Net.BCrypt.HashPassword("password"), Role = "User" });
            _context.SaveChanges();

            _controller = new RatingController(_context);

            // Setup user claims for the controller
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "100"),
                new Claim(ClaimTypes.Name, "testuser"),
                new Claim(ClaimTypes.Role, "User")
            }, "mock"));
            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext() { User = user }
            };
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task PostRating_AddsNewRatingAndRecalculatesDoctorRating()
        {
            // Arrange
            var rating = new Rating { DoctorId = 1, RatingValue = 5 };

            // Act
            var result = await _controller.PostRating(rating);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Rating submitted successfully.", okResult.Value);

            var savedRating = await _context.Ratings.FirstOrDefaultAsync(r => r.DoctorId == 1 && r.UserId == 100);
            Assert.NotNull(savedRating);
            Assert.Equal(5, savedRating.RatingValue);

            var doctor = await _context.Doctors.FindAsync(1);
            Assert.NotNull(doctor);
            Assert.Equal(5.0m, doctor.Rating);
        }

        [Fact]
        public async Task PostRating_UpdatesExistingRatingAndRecalculatesDoctorRating()
        {
            // Arrange
            _context.Ratings.Add(new Rating { DoctorId = 1, UserId = 100, RatingValue = 3 });
            _context.SaveChanges();

            var rating = new Rating { DoctorId = 1, RatingValue = 4 };

            // Act
            var result = await _controller.PostRating(rating);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Rating submitted successfully.", okResult.Value);

            var savedRating = await _context.Ratings.FirstOrDefaultAsync(r => r.DoctorId == 1 && r.UserId == 100);
            Assert.NotNull(savedRating);
            Assert.Equal(4, savedRating.RatingValue);

            var doctor = await _context.Doctors.FindAsync(1);
            Assert.NotNull(doctor);
            Assert.Equal(4.0m, doctor.Rating);
        }

        [Fact]
        public async Task PostRating_RecalculatesDoctorRatingWithMultipleRatings()
        {
            // Arrange
            _context.Ratings.Add(new Rating { DoctorId = 2, UserId = 100, RatingValue = 3 });
            _context.Ratings.Add(new Rating { DoctorId = 2, UserId = 101, RatingValue = 5 }); // Assuming another user exists
            _context.SaveChanges();

            var rating = new Rating { DoctorId = 2, RatingValue = 4 }; // User 100 updates their rating

            // Act
            var result = await _controller.PostRating(rating);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Rating submitted successfully.", okResult.Value);

            var doctor = await _context.Doctors.FindAsync(2);
            Assert.NotNull(doctor);
            // (3 + 5) / 2 = 4.0. If user 100 updates to 4, then (4 + 5) / 2 = 4.5
            Assert.Equal(4.5m, doctor.Rating);
        }

        [Fact]
        public async Task PostRating_ReturnsUnauthorized_WhenUserNotAuthenticated()
        {
            // Arrange
            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext() { User = new ClaimsPrincipal() }
            };
            var rating = new Rating { DoctorId = 1, RatingValue = 5 };

            // Act
            var result = await _controller.PostRating(rating);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("User not authenticated.", unauthorizedResult.Value);
        }
    }
}
