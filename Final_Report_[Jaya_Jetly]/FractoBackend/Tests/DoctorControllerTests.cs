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
using FractoBackend.DTOs;

namespace FractoBackend.Tests
{
    public class DoctorControllerTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly DoctorController _controller;

        public DoctorControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unique DB for each test
                .Options;
            _context = new ApplicationDbContext(options);
            _context.Database.EnsureCreated();

            // Seed data
            _context.Specializations.Add(new Specialization { SpecializationId = 1, SpecializationName = "Cardiology" });
            _context.Specializations.Add(new Specialization { SpecializationId = 2, SpecializationName = "Pediatrics" });
            _context.Doctors.Add(new Doctor { DoctorId = 1, Name = "Dr. Alice", SpecializationId = 1, City = "New York", Rating = 4.5m });
            _context.Doctors.Add(new Doctor { DoctorId = 2, Name = "Dr. Bob", SpecializationId = 2, City = "Los Angeles", Rating = 3.8m });
            _context.Doctors.Add(new Doctor { DoctorId = 3, Name = "Dr. Charlie", SpecializationId = 1, City = "New York", Rating = 4.9m });
            _context.Users.Add(new User { UserId = 100, Username = "adminuser", Password = BCrypt.Net.BCrypt.HashPassword("password"), Role = "Admin" });
            _context.SaveChanges();

            _controller = new DoctorController(_context);

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
        public async Task GetDoctors_ReturnsAllDoctors()
        {
            // Act
            var result = await _controller.GetDoctors();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<Doctor>>>(result);
            var doctors = Assert.IsType<List<Doctor>>(actionResult.Value);
            Assert.Equal(3, doctors.Count);
        }

        [Fact]
        public async Task GetDoctor_ReturnsDoctor_WhenDoctorExists()
        {
            // Act
            var result = await _controller.GetDoctor(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Doctor>>(result);
            var doctor = Assert.IsType<Doctor>(actionResult.Value);
            Assert.Equal("Dr. Alice", doctor.Name);
        }

        [Fact]
        public async Task GetDoctor_ReturnsNotFound_WhenDoctorDoesNotExist()
        {
            // Act
            var result = await _controller.GetDoctor(999);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task SearchDoctors_FiltersByCity()
        {
            // Act
            var result = await _controller.SearchDoctors(city: "New York", specializationId: null, minRating: null, date: null);

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<Doctor>>>(result);
            var doctors = Assert.IsType<List<Doctor>>(actionResult.Value);
            Assert.Equal(2, doctors.Count);
            Assert.All(doctors, d => Assert.Equal("New York", d.City));
        }

        [Fact]
        public async Task SearchDoctors_FiltersBySpecialization()
        {
            // Act
            var result = await _controller.SearchDoctors(city: null, specializationId: 2, minRating: null, date: null);

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<Doctor>>>(result);
            var doctors = Assert.IsType<List<Doctor>>(actionResult.Value);
            Assert.Single(doctors);
            Assert.Equal("Dr. Bob", doctors.First().Name);
        }

        [Fact]
        public async Task SearchDoctors_FiltersByMinRating()
        {
            // Act
            var result = await _controller.SearchDoctors(city: null, specializationId: null, minRating: 4.0m, date: null);

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<Doctor>>>(result);
            var doctors = Assert.IsType<List<Doctor>>(actionResult.Value);
            Assert.Equal(2, doctors.Count);
            Assert.All(doctors, d => Assert.True(d.Rating >= 4.0m));
        }

        [Fact]
        public async Task SearchDoctors_FiltersByDate_ExcludingBookedDoctors()
        {
            // Arrange
            _context.Appointments.Add(new Appointment { DoctorId = 1, AppointmentDate = DateTime.Today, TimeSlot = "09:00", Status = "Booked" });
            _context.SaveChanges();

            // Act
            var result = await _controller.SearchDoctors(city: null, specializationId: null, minRating: null, date: DateTime.Today.ToString("yyyy-MM-dd"));

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<Doctor>>>(result);
            var doctors = Assert.IsType<List<Doctor>>(actionResult.Value);
            Assert.DoesNotContain(doctors, d => d.DoctorId == 1);
            Assert.Equal(2, doctors.Count); // Dr. Bob and Dr. Charlie should still be there
        }

        [Fact]
        public async Task PostDoctor_ReturnsCreatedAtAction_WhenDoctorIsAdded()
        {
            // Arrange
            var newDoctorDto = new CreateDoctorDto { Name = "Dr. David", SpecializationId = 2, City = "Chicago", Rating = 4.0 }; // Note: Rating is double here

            // Act
            var result = await _controller.PostDoctor(newDoctorDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var doctor = Assert.IsType<Doctor>(createdAtActionResult.Value);
            Assert.Equal("Dr. David", doctor.Name);
            Assert.Equal(4, _context.Doctors.Count());
        }

        [Fact]
        public async Task PutDoctor_ReturnsNoContent_WhenDoctorIsUpdated()
        {
            // Arrange
            var doctorToUpdate = await _context.Doctors.FindAsync(1);
            Assert.NotNull(doctorToUpdate);
            doctorToUpdate.City = "New City";

            // Act
            var result = await _controller.PutDoctor(1, doctorToUpdate);

            // Assert
            Assert.IsType<NoContentResult>(result);
            var updatedDoctor = await _context.Doctors.FindAsync(1);
            Assert.NotNull(updatedDoctor);
            Assert.Equal("New City", updatedDoctor.City);
        }

        [Fact]
        public async Task PutDoctor_ReturnsBadRequest_WhenIdMismatch()
        {
            // Arrange
            var doctorToUpdate = new Doctor { DoctorId = 999, Name = "Dr. Mismatch", SpecializationId = 1, City = "Test", Rating = 4.0m };

            // Act
            var result = await _controller.PutDoctor(1, doctorToUpdate);

            // Assert
            Assert.IsType<BadRequestResult>(result);
        }

        [Fact]
        public async Task PutDoctor_ReturnsNotFound_WhenDoctorDoesNotExist()
        {
            // Arrange
            var doctorToUpdate = new Doctor { DoctorId = 999, Name = "Dr. NonExistent", SpecializationId = 1, City = "Test", Rating = 4.0m };

            // Act
            var result = await _controller.PutDoctor(999, doctorToUpdate);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task DeleteDoctor_ReturnsNoContent_WhenDoctorIsDeleted()
        {
            // Act
            var result = await _controller.DeleteDoctor(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
            Assert.Equal(2, _context.Doctors.Count());
            Assert.Null(await _context.Doctors.FindAsync(1));
        }

        [Fact]
        public async Task DeleteDoctor_ReturnsNotFound_WhenDoctorDoesNotExist()
        {
            // Act
            var result = await _controller.DeleteDoctor(999);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }
    }
}
