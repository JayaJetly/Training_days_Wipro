using Microsoft.EntityFrameworkCore;
using CoreRazorApp.Models;

public class OrgContext : DbContext
{
    public OrgContext(DbContextOptions<OrgContext> options) : base(options)
    {

    }

  
    public DbSet<Organization> organizations { get; set; }
    public DbSet<Department> departments { get; set; }
    public DbSet<Employee> employees { get; set; }

}