using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MVCExample.Models;

namespace MVCExample.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {
        internal object patients;

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        public DbSet<Patient> Patients { get; set; }
    }
}
