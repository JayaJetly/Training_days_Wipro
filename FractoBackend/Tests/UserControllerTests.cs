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
using Microsoft.Extensions.Configuration;

namespace FractoBackend.Tests
{
    public class UserControllerTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly UserController _controller;
        private readonly Mock<IConfiguration> _mockConfiguration;

        public UserControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unique DB for each test
                .Options;
            _context = new ApplicationDbContext(options);
            _context.Database.EnsureCreated();

            // Seed data
            _context.Users.Add(new User { UserId = 1, Username = "user1", Password = BCrypt.Net.BCrypt.HashPassword("password"), Role = "User" });
            _context.Users.Add(new User { UserId = 2, Username = "user2", Password = BCrypt.Net.BCrypt.HashPassword("password"), Role = "Doctor" });
            _context.Users.Add(new User { UserId = 3, Username = "admin1", Password = BCrypt.Net.BCrypt.HashPassword("password"), Role = "Admin" });
            _context.SaveChanges();

            _mockConfiguration = new Mock<IConfiguration>();
            // Setup any configuration values if needed by UserController, e.g., AdminInvitationCode
            _mockConfiguration.Setup(c => c["AdminInvitationCode"]).Returns("admincode");

            _controller = new UserController(_context, _mockConfiguration.Object);

            // Setup admin claims for methods requiring authorization
            var adminUser = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "3"),
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
        public async Task GetAllUsers_ReturnsAllUsers()
        {
            // Act
            var result = await _controller.GetAllUsers();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<User>>>(result);
            var users = Assert.IsType<List<User>>(actionResult.Value);
            Assert.Equal(3, users.Count);
        }

        [Fact]
        public async Task GetUser_ReturnsUser_WhenUserExists()
        {
            // Act
            var result = await _controller.GetUser(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<User>>(result);
            var user = Assert.IsType<User>(actionResult.Value);
            Assert.Equal("user1", user.Username);
        }

        [Fact]
        public async Task GetUser_ReturnsNotFound_WhenUserDoesNotExist()
        {
            // Act
            var result = await _controller.GetUser(999);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task UpdateUser_ReturnsNoContent_WhenUserIsUpdated()
        {
            // Arrange
            var userToUpdate = await _context.Users.FindAsync(1);
            Assert.NotNull(userToUpdate);
            userToUpdate.Username = "updateduser1";

            // Act
            var result = await _controller.UpdateUser(1, userToUpdate);

            // Assert
            Assert.IsType<NoContentResult>(result);
            var updatedUser = await _context.Users.FindAsync(1);
            Assert.NotNull(updatedUser);
            Assert.Equal("updateduser1", updatedUser.Username);
        }

        [Fact]
        public async Task UpdateUser_ReturnsBadRequest_WhenIdMismatch()
        {
            // Arrange
            var userToUpdate = new User { UserId = 999, Username = "mismatchuser", Role = "User" };

            // Act
            var result = await _controller.UpdateUser(1, userToUpdate);

            // Assert
            Assert.IsType<BadRequestResult>(result);
        }

        [Fact]
        public async Task UpdateUser_ReturnsNotFound_WhenUserDoesNotExist()
        {
            // Arrange
            var userToUpdate = new User { UserId = 999, Username = "nonexistentuser", Role = "User" };

            // Act
            var result = await _controller.UpdateUser(999, userToUpdate);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task DeleteUser_ReturnsNoContent_WhenUserIsDeleted()
        {
            // Act
            var result = await _controller.DeleteUser(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
            Assert.Equal(2, _context.Users.Count());
            Assert.Null(await _context.Users.FindAsync(1));
        }

        [Fact]
        public async Task DeleteUser_ReturnsNotFound_WhenUserDoesNotExist()
        {
            // Act
            var result = await _controller.DeleteUser(999);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }
    }
}

