using Microsoft.AspNetCore.Mvc;
using FractoBackend.Data;
using FractoBackend.Models;
using FractoBackend.DTOs;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace FractoBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (string.IsNullOrEmpty(registerDto.Username) || string.IsNullOrEmpty(registerDto.Password))
            {
                return BadRequest("Username and password are required.");
            }

            if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
            {
                return BadRequest("Username already exists.");
            }

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);
            var userRole = registerDto.Role ?? "User"; // Default to "User" if not provided

            if (userRole.Equals("Admin", StringComparison.OrdinalIgnoreCase))
            {
                var adminInvitationCode = _configuration["AdminInvitationCode"];
                if (string.IsNullOrEmpty(registerDto.InvitationCode) || registerDto.InvitationCode != adminInvitationCode)
                {
                    return BadRequest("Invalid or missing invitation code for admin registration.");
                }
            }

            var user = new User
            {
                Username = registerDto.Username,
                Password = hashedPassword,
                Role = userRole
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("Registration successful.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (loginDto.Username == null || loginDto.Password == null) {
                return BadRequest("Username and password are required.");
            }

            var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == loginDto.Username);

            if (user == null || user.Password == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
            {
                return Unauthorized("Invalid username or password.");
            }

            var token = GenerateJwtToken(user);

            return Ok(new LoginResponseDto { Token = token });
        }

        private string GenerateJwtToken(User user)
        {
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtKey = _configuration["Jwt:Key"];

            if (string.IsNullOrEmpty(jwtIssuer) || string.IsNullOrEmpty(jwtKey) || user.Username == null || user.Role == null)
            {
                throw new InvalidOperationException("JWT Issuer and Key must be configured, and user must have a username and role.");
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: null, // Audience is not used in this project
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}