using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using FractoBackend.Controllers;
using FractoBackend.Data;
using FractoBackend.Models;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;
using System.Security.Claims;

namespace FractoBackend.Tests
{
    public class SpecializationControllerTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly SpecializationController _controller;

        public SpecializationControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unique DB for each test
                .Options;
            _context = new ApplicationDbContext(options);
            _context.Database.EnsureCreated();

            // Seed data
            _context.Specializations.Add(new Specialization { SpecializationId = 1, SpecializationName = "Cardiology" });
            _context.Specializations.Add(new Specialization { SpecializationId = 2, SpecializationName = "Pediatrics" });
            _context.Users.Add(new User { UserId = 100, Username = "adminuser", Password = BCrypt.Net.BCrypt.HashPassword("password"), Role = "Admin" });
            _context.SaveChanges();

            _controller = new SpecializationController(_context);

            // Setup admin claims for methods requiring authorization
            var adminUser = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "100"),
                new Claim(ClaimTypes.Role, "Admin")
            }, "mock"));
            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext() { User = adminUser }
            };
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task GetSpecializations_ReturnsAllSpecializations()
        {
            // Act
            var result = await _controller.GetSpecializations();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<Specialization>>>(result);
            var specializations = Assert.IsType<List<Specialization>>(actionResult.Value);
            Assert.Equal(2, specializations.Count);
        }

        [Fact]
        public async Task GetSpecialization_ReturnsSpecialization_WhenSpecializationExists()
        {
            // Act
            var result = await _controller.GetSpecialization(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Specialization>>(result);
            var specialization = Assert.IsType<Specialization>(actionResult.Value);
            Assert.Equal("Cardiology", specialization.SpecializationName);
        }

        [Fact]
        public async Task GetSpecialization_ReturnsNotFound_WhenSpecializationDoesNotExist()
        {
            // Act
            var result = await _controller.GetSpecialization(999);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task PostSpecialization_ReturnsCreatedAtAction_WhenSpecializationIsAdded()
        {
            // Arrange
            var newSpecialization = new Specialization { SpecializationName = "Dermatology" };

            // Act
            var result = await _controller.PostSpecialization(newSpecialization);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var specialization = Assert.IsType<Specialization>(createdAtActionResult.Value);
            Assert.Equal("Dermatology", specialization.SpecializationName);
            Assert.Equal(3, _context.Specializations.Count());
        }

        [Fact]
        public async Task PutSpecialization_ReturnsNoContent_WhenSpecializationIsUpdated()
        {
            // Arrange
            var specializationToUpdate = await _context.Specializations.FindAsync(1);
            Assert.NotNull(specializationToUpdate);
            specializationToUpdate.SpecializationName = "Updated Cardiology";

            // Act
            var result = await _controller.PutSpecialization(1, specializationToUpdate);

            // Assert
            Assert.IsType<NoContentResult>(result);
            var updatedSpecialization = await _context.Specializations.FindAsync(1);
            Assert.NotNull(updatedSpecialization);
            Assert.Equal("Updated Cardiology", updatedSpecialization.SpecializationName);
        }

        [Fact]
        public async Task PutSpecialization_ReturnsBadRequest_WhenIdMismatch()
        {
            // Arrange
            var specializationToUpdate = new Specialization { SpecializationId = 999, SpecializationName = "Mismatch" };

            // Act
            var result = await _controller.PutSpecialization(1, specializationToUpdate);

            // Assert
            Assert.IsType<BadRequestResult>(result);
        }

        [Fact]
        public async Task PutSpecialization_ReturnsNotFound_WhenSpecializationDoesNotExist()
        {
            // Arrange
            var specializationToUpdate = new Specialization { SpecializationId = 999, SpecializationName = "NonExistent" };

            // Act
            var result = await _controller.PutSpecialization(999, specializationToUpdate);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task DeleteSpecialization_ReturnsNoContent_WhenSpecializationIsDeleted()
        {
            // Act
            var result = await _controller.DeleteSpecialization(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
            Assert.Equal(1, _context.Specializations.Count());
            Assert.Null(await _context.Specializations.FindAsync(1));
        }

        [Fact]
        public async Task DeleteSpecialization_ReturnsNotFound_WhenSpecializationDoesNotExist()
        {
            // Act
            var result = await _controller.DeleteSpecialization(999);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }
    }
}
