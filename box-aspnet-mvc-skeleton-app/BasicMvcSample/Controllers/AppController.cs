using BasicMvcSample.Helpers;
using Box.V2.Models;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace BasicMvcSample.Controllers
{
    [Authorize]
    public class AppController : Controller
    {
        // GET: App
        public async Task<ActionResult> Index()
        {
            var items = await BoxHelper.UserClient().FoldersManager.GetFolderItemsAsync("0", 100);
            ViewBag.Folders = items.Entries.Where(item => item.Type == "folder");
            ViewBag.Files = items.Entries.Where(item => item.Type == "file");

            ViewBag.AccessToken = BoxHelper.UserToken();

            return View();
        }

        public async Task<ActionResult> Doc(string id)
        {
            var file = await BoxHelper.UserClient().FilesManager.GetInformationAsync(id);
            ViewBag.BoxFile = file;
     
            return View();
        }

        public async Task<ActionResult> Download(string id)
        {
            var downloadUrl = await BoxHelper.UserClient().FilesManager.GetDownloadUriAsync(id);
            return Redirect(downloadUrl.ToString());
        }

        public async Task<ActionResult> Upload(HttpPostedFileBase file)
        {
            if (file != null && file.ContentLength > 0)
            {
                var fileName = file.FileName;
                using (var fs = file.InputStream)
                {
                    // Create request object with name and parent folder the file should be uploaded to
                    BoxFileRequest request = new BoxFileRequest()
                    {
                        Name = fileName,
                        Parent = new BoxRequestEntity() { Id = "0" }
                    };
                    var boxFile = await BoxHelper.UserClient().FilesManager.UploadAsync(request, fs);
                }
            }

            return RedirectToAction("Index");
        }

        public async Task<FileStreamResult> Thumbnail(string id)
        {
            var thumbBytes = await BoxHelper.UserClient().FilesManager.GetThumbnailAsync(id, minHeight: 256, minWidth: 256, maxHeight: 256, maxWidth: 256);
            return new FileStreamResult(thumbBytes, "image/png");
        }

        public async Task<ActionResult> Preview(string id)
        {
            var previewUrl = await BoxHelper.UserClient().FilesManager.GetPreviewLinkAsync(id);
            return Redirect(previewUrl.ToString());
        }
    }
}