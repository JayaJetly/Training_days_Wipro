using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using FractoBackend.Controllers;
using FractoBackend.Data;
using FractoBackend.Models;
using FractoBackend.Services;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;
using System.Linq;
using Microsoft.AspNetCore.SignalR;
using FractoBackend.Hubs;

namespace FractoBackend.Tests
{
    public class AppointmentControllerTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<NotificationService> _mockNotificationService;
        private readonly Mock<IHubContext<NotificationHub>> _mockHubContext;
        private readonly AppointmentController _controller;

        public AppointmentControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unique DB for each test
                .Options;
            _context = new ApplicationDbContext(options);
            _context.Database.EnsureCreated();

            // Seed data
            _context.Doctors.Add(new Doctor { DoctorId = 1, Name = "Dr. John Doe", SpecializationId = 1, City = "New York", Rating = 4.5m, UserId = 101 });
            _context.Users.Add(new User { UserId = 100, Username = "testuser", Password = BCrypt.Net.BCrypt.HashPassword("password"), Role = "User" });
            _context.Users.Add(new User { UserId = 101, Username = "testdoctor", Password = BCrypt.Net.BCrypt.HashPassword("password"), Role = "Doctor" });
            _context.Users.Add(new User { UserId = 102, Username = "testadmin", Password = BCrypt.Net.BCrypt.HashPassword("password"), Role = "Admin" });
            _context.SaveChanges();

            _mockHubContext = new Mock<IHubContext<NotificationHub>>();
            _mockNotificationService = new Mock<NotificationService>(_context, _mockHubContext.Object); // Pass null for IHubContext as it's mocked
            _controller = new AppointmentController(_context, _mockNotificationService.Object);

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
        public async Task BookAppointment_ReturnsOk_WhenAppointmentIsBookedSuccessfully()
        {
            // Arrange
            var appointment = new Appointment
            {
                DoctorId = 1,
                AppointmentDate = DateTime.Today,
                TimeSlot = "09:00",
                Status = "Booked"
            };

            // Act
            var result = await _controller.BookAppointment(appointment);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Appointment booked successfully.", okResult.Value);
            _mockNotificationService.Verify(s => s.CreateNotificationAsync(It.IsAny<int>(), It.IsAny<string>()), Times.AtLeastOnce());
        }

        [Fact]
        public async Task BookAppointment_ReturnsBadRequest_WhenTimeSlotIsAlreadyBooked()
        {
            // Arrange
            _context.Appointments.Add(new Appointment
            {
                DoctorId = 1,
                AppointmentDate = DateTime.Today,
                TimeSlot = "09:00",
                Status = "Booked"
            });
            _context.SaveChanges();

            var appointment = new Appointment
            {
                DoctorId = 1,
                AppointmentDate = DateTime.Today,
                TimeSlot = "09:00",
                Status = "Booked"
            };

            // Act
            var result = await _controller.BookAppointment(appointment);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("This time slot is already booked.", badRequestResult.Value);
            _mockNotificationService.Verify(s => s.CreateNotificationAsync(It.IsAny<int>(), It.IsAny<string>()), Times.Never());
        }

        [Fact]
        public async Task CancelAppointment_ReturnsNoContent_WhenAppointmentIsCancelledSuccessfully()
        {
            // Arrange
            _context.Appointments.Add(new Appointment
            {
                AppointmentId = 1,
                UserId = 100,
                DoctorId = 1,
                AppointmentDate = DateTime.Today,
                TimeSlot = "10:00",
                Status = "Booked"
            });
            _context.SaveChanges();

            // Act
            var result = await _controller.CancelAppointment(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
            var cancelledAppointment = await _context.Appointments.FindAsync(1);
            Assert.NotNull(cancelledAppointment);
            Assert.Equal("Cancelled", cancelledAppointment.Status);
            _mockNotificationService.Verify(s => s.CreateNotificationAsync(It.IsAny<int>(), It.IsAny<string>()), Times.AtLeastOnce());
        }

        [Fact]
        public async Task CancelAppointment_ReturnsNotFound_WhenAppointmentDoesNotExist()
        {
            // Act
            var result = await _controller.CancelAppointment(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task AdminCancelAppointment_ReturnsNoContent_WhenAppointmentIsCancelledSuccessfully()
        {
            // Arrange
            _context.Appointments.Add(new Appointment
            {
                AppointmentId = 2,
                UserId = 100,
                DoctorId = 1,
                AppointmentDate = DateTime.Today,
                TimeSlot = "11:00",
                Status = "Booked"
            });
            _context.SaveChanges();

            // Set admin role for the controller context
            var adminUser = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "102"),
                new Claim(ClaimTypes.Name, "testadmin"),
                new Claim(ClaimTypes.Role, "Admin")
            }, "mock"));
            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext() { User = adminUser }
            };

            // Act
            var result = await _controller.AdminCancelAppointment(2);

            // Assert
            Assert.IsType<NoContentResult>(result);
            var cancelledAppointment = await _context.Appointments.FindAsync(2);
            Assert.NotNull(cancelledAppointment);
            Assert.Equal("Cancelled", cancelledAppointment.Status);
            _mockNotificationService.Verify(s => s.CreateNotificationAsync(It.IsAny<int>(), It.IsAny<string>()), Times.AtLeastOnce());
        }

        [Fact]
        public async Task ApproveAppointment_ReturnsNoContent_WhenAppointmentIsApprovedSuccessfully()
        {
            // Arrange
            _context.Appointments.Add(new Appointment
            {
                AppointmentId = 3,
                UserId = 100,
                DoctorId = 1,
                AppointmentDate = DateTime.Today,
                TimeSlot = "12:00",
                Status = "Pending"
            });
            _context.SaveChanges();

            // Set admin role for the controller context
            var adminUser = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "102"),
                new Claim(ClaimTypes.Name, "testadmin"),
                new Claim(ClaimTypes.Role, "Admin")
            }, "mock"));
            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext() { User = adminUser }
            };

            // Act
            var result = await _controller.ApproveAppointment(3);

            // Assert
            Assert.IsType<NoContentResult>(result);
            var approvedAppointment = await _context.Appointments.FindAsync(3);
            Assert.NotNull(approvedAppointment);
            Assert.Equal("Approved", approvedAppointment.Status);
            _mockNotificationService.Verify(s => s.CreateNotificationAsync(It.IsAny<int>(), It.IsAny<string>()), Times.AtLeastOnce());
        }

        [Fact]
        public async Task GetAvailableTimeSlots_ReturnsAvailableSlots()
        {
            // Arrange
            _context.Appointments.Add(new Appointment
            {
                DoctorId = 1,
                AppointmentDate = DateTime.Today,
                TimeSlot = "09:00",
                Status = "Booked"
            });
            _context.SaveChanges();

            // Act
            var result = await _controller.GetAvailableTimeSlots(1, DateTime.Today);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var availableSlots = Assert.IsType<List<string>>(okResult.Value);
            Assert.DoesNotContain("09:00", availableSlots);
            Assert.Contains("10:00", availableSlots);
        }
    }
}
