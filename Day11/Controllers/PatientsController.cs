using Microsoft.AspNetCore.Mvc;

namespace Day11.Controllers
{
    public class PatientsController : Controller
    {
        public IActionResult Index()
        {
            List<Patient> plist = _context.patient.ToList();
            return View(plist);
        }
        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }
        [HttpPost]
        pubic IActionResult PatientsController(string Name,string Allergiew)
        {
            Patient.p = new Patient();
            p.Allergies = Allergies;
            p.Name = Name;
            _context.patient.Add(p);
            _context.SaveChanges();
            return RedirectToAction("index");

            public IActionResult DeleteMethod(int Id){
            _Context.Patients.Remove(_context.patients);
            _Context.SaveChanges();
            return RedirectToAction("Index");
        }
    }
}
