using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using CoreRazorApp.Data;
using CoreRazorApp.Models;

namespace CoreRazorApp.Pages.Organization
{
    public class IndexModel : PageModel
    {
        private readonly CoreRazorApp.Data.ApplicationDbContext _context;

        public IndexModel(CoreRazorApp.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        public IList<Organization> Organization { get;set; } = default!;

        public async Task OnGetAsync()
        {
            Organization = await _context.Organization.ToListAsync();
        }
    }
}
