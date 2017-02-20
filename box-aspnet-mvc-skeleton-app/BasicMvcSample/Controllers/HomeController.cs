using BasicMvcSample.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace BasicMvcSample.Controllers
{
    public class HomeController : Controller
    {
        public async Task<ActionResult> Index()
        {
            object cacheMessageObject = CacheHelper.Fetch("cache-message", TimeSpan.FromSeconds(60), () => { return "Cache connection is live"; });
            ViewBag.Message = (String)cacheMessageObject;

            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
    }
}