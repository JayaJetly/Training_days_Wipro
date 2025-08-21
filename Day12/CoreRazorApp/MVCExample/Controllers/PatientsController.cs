using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using MVCExample.Data;
using MVCExample.Data.Migrations;
using MVCExample.Models;
using System.ComponentModel;

namespace MVCExample.Controllers
{
    public class PatientsController : Controller
    {
        private readonly ApplicationDbContext _context;
        //private readonly object context;
        private string Descriptions;

        public PatientsController(ApplicationDbContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            List<Patient> plist = _context.Patients.ToList();
            return View(plist);
        }
        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }
        [HttpPost]

        public IActionResult Edit(int Id)
        {
            if(Id== null) 
            {
                return NotFound();
            }
                Patient p = _context.Patients.Find(Id);
                return View(p);
        }
            [HttpPost]

        public IActionResult Edit(Patient p)
            {
                _context.Patients.Update(p);
                _context.SaveChanges(); 
                return RedirectToAction("index");
            }
        public IActionResult Delete(int Id)
        {
            return View(_context.Patients.Find(Id));
        }

        [HttpPost, ActionName("Delete")]
        public IActionResult DeleteMethod(int Id)
        {
            _context.Patients.Remove(_context.Patients.Find(Id));
            _context.SaveChanges();
            return RedirectToAction("Index");

        }

        [HttpPost]
        public IActionResult Create(string Name, string Description)
        {
            Patient p = new Patient();
            p.Description = Description;
            p.Name = Name;
            _context.Patients.Add(p);
            _context.SaveChanges();
            return RedirectToAction("index");
        }
    }
}

