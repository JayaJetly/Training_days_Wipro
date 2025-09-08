using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using FractoBackend.Controllers;
using FractoBackend.Data;
using FractoBackend.Models;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System;

namespace FractoBackend.Tests
{
    public class AuthControllerTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly AuthController _controller;
        private readonly Mock<IConfiguration> _mockConfiguration;

        public AuthControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unique DB for each test
                .Options;
            _context = new ApplicationDbContext(options);
            _context.Database.EnsureCreated();

            _mockConfiguration = new Mock<IConfiguration>();
            _mockConfiguration.Setup(c => c["Jwt:Key"]).Returns("ThisIsAStrongSecretKeyForTestingPurposes");
            _mockConfiguration.Setup(c => c["Jwt:Issuer"]).Returns("TestIssuer");

            _controller = new AuthController(_context, _mockConfiguration.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task Register_ReturnsOk_WhenUserRegistersSuccessfully()
        {
            // Arrange
            var registerDto = new DTOs.RegisterDto { Username = "newuser", Password = "Password123!" };

            // Act
            var result = await _controller.Register(registerDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Registration successful.", okResult.Value);
            Assert.NotNull(await _context.Users.SingleOrDefaultAsync(u => u.Username == "newuser"));
        }

        [Fact]
        public async Task Register_ReturnsBadRequest_WhenUsernameAlreadyExists()
        {
            // Arrange
            _context.Users.Add(new User { UserId = 1, Username = "existinguser", Password = "hashedpassword", Role = "User" });
            _context.SaveChanges();
            var registerDto = new DTOs.RegisterDto { Username = "existinguser", Password = "Password123!" };

            // Act
            var result = await _controller.Register(registerDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Username already exists.", badRequestResult.Value);
        }

        [Fact]
        public async Task Login_ReturnsLoginResponseDto_WhenCredentialsAreValid()
        {
            // Arrange
            var password = "Password123!";
            var user = new User { UserId = 1, Username = "testuser", Password = BCrypt.Net.BCrypt.HashPassword(password), Role = "User" };
            _context.Users.Add(user);
            _context.SaveChanges();
            var loginDto = new DTOs.LoginDto { Username = "testuser", Password = password };

            // Act
            var result = await _controller.Login(loginDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var loginResponse = Assert.IsType<DTOs.LoginResponseDto>(okResult.Value);
            
            Assert.NotNull(loginResponse.Token);
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenInvalidCredentials()
        {
            // Arrange
            var password = "Password123!";
            var user = new User { UserId = 1, Username = "testuser", Password = BCrypt.Net.BCrypt.HashPassword(password), Role = "User" };
            _context.Users.Add(user);
            _context.SaveChanges();
            var loginDto = new DTOs.LoginDto { Username = "testuser", Password = "WrongPassword" };

            // Act
            var result = await _controller.Login(loginDto);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Invalid credentials.", unauthorizedResult.Value);
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenUserDoesNotExist()
        {
            // Arrange
            var loginDto = new DTOs.LoginDto { Username = "nonexistentuser", Password = "AnyPassword" };

            // Act
            var result = await _controller.Login(loginDto);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Invalid credentials.", unauthorizedResult.Value);
        }
    }
}
