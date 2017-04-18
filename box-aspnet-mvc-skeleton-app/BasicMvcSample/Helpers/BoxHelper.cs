using Box.V2;
using Box.V2.Auth;
using Box.V2.Config;
using Box.V2.JWTAuth;
using Box.V2.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;

namespace BasicMvcSample.Helpers
{
    public class BoxHelper
    {
        static readonly string CLIENT_ID = ConfigurationManager.AppSettings["boxClientId"];
        static readonly string CLIENT_SECRET = ConfigurationManager.AppSettings["boxClientSecret"];
        static readonly string ENTERPRISE_ID = ConfigurationManager.AppSettings["boxEnterpriseId"];
        static readonly string JWT_PRIVATE_KEY_PASSWORD = ConfigurationManager.AppSettings["boxPrivateKeyPassword"];
        static readonly string JWT_PRIVATE_KEY = File.ReadAllText(HttpContext.Current.Server.MapPath("~") + "/private_key.pem");
        static readonly string JWT_PUBLIC_KEY_ID = ConfigurationManager.AppSettings["boxPublicKeyId"];

        static readonly string BOX_USER_ID_KEY = "box_id";
        static readonly TimeSpan CACHE_EXPIRES_IN_DEFAULT = TimeSpan.FromMinutes(45);
        static readonly string ENTERPRISE_TOKEN_CACHE_KEY = "enterprise_token";
        static readonly string USER_TOKEN_CACHE_KEY = "user_token";

        static readonly Auth0.Client AUTH0_CLIENT = new Auth0.Client(ConfigurationManager.AppSettings["auth0:ClientId"], ConfigurationManager.AppSettings["auth0:ClientSecret"], ConfigurationManager.AppSettings["auth0:Domain"]);
        
        static readonly BoxConfig boxConfig = new BoxConfig(CLIENT_ID, CLIENT_SECRET, ENTERPRISE_ID, JWT_PRIVATE_KEY, JWT_PRIVATE_KEY_PASSWORD, JWT_PUBLIC_KEY_ID);
        public static readonly BoxJWTAuth BOX_JWT_HELPER = new BoxJWTAuth(boxConfig);


        public static BoxClient AdminClient()
        {
            return BOX_JWT_HELPER.AdminClient(EnterpriseToken());
        }

        public static BoxClient UserClient(string boxUserId=null)
        {
            return BOX_JWT_HELPER.UserClient(UserToken(boxUserId), boxUserId);
        }

        public static string EnterpriseToken()
        {
            object enterpriseTokenObject = CacheHelper.Fetch(ENTERPRISE_TOKEN_CACHE_KEY, CACHE_EXPIRES_IN_DEFAULT, () => { return BOX_JWT_HELPER.AdminToken(); });
            return (string)enterpriseTokenObject;
        }

        public static string UserToken(string boxUserId=null)
        {
            if (boxUserId == null) 
            { 
                //first check the session
                var id = (string)HttpContext.Current.Session[BOX_USER_ID_KEY];
                if (id==null)
                {
                    //didn't find in session so call Auth0 and look in user's metadata
                    var auth0UserId = ClaimsPrincipal.Current.Claims.FirstOrDefault(c => c.Type == "user_id").Value;
                    id = GetBoxIdFromAuth0(auth0UserId);

                    //save it in the session
                    HttpContext.Current.Session[BOX_USER_ID_KEY] = id;
                }

                boxUserId = id;  
            }

            string cache_key = USER_TOKEN_CACHE_KEY + "/" + boxUserId;
            object userTokenObject = CacheHelper.Fetch(cache_key, CACHE_EXPIRES_IN_DEFAULT, () => { return BOX_JWT_HELPER.UserToken(boxUserId); });
            return (string)userTokenObject;
        }

        public static async Task PrepareBoxAppUser(ClaimsIdentity externalIdentity)
        {
            var auth0UserId = externalIdentity.Claims.FirstOrDefault(c => c.Type == "user_id").Value;
            var boxId = GetBoxIdFromAuth0(auth0UserId);
            
            if (boxId == null)
            {
                //create a new app user in Box
                string email = externalIdentity.Claims.FirstOrDefault(c => c.Type == "email").Value;
                var userRequest = new BoxUserRequest() { Name = email, IsPlatformAccessOnly = true };
                var appUser = await AdminClient().UsersManager.CreateEnterpriseUserAsync(userRequest);
                boxId = appUser.Id;

                //store the boxId in the user's Auth0 metadata
                var meta = new Dictionary<string,object>();
                meta.Add(BOX_USER_ID_KEY,boxId);
                AUTH0_CLIENT.UpdateUserMetadata(auth0UserId, meta);

                //now do the initial box account setup
                var boxClient = UserClient((string)boxId);
                var folderRequest = new BoxFolderRequest() { Name = "Test Folder", Parent = new BoxRequestEntity() { Id = "0" } };
                var newFolder = await boxClient.FoldersManager.CreateAsync(folderRequest);

                var pathToFile = HttpContext.Current.Server.MapPath("~/Assets/");
                var fileName = "test.txt";
                using (FileStream fs = File.Open(pathToFile + fileName, FileMode.Open))
                {
                    // Create request object with name and parent folder the file should be uploaded to
                    BoxFileRequest request = new BoxFileRequest()
                    {
                        Name = fileName,
                        Parent = new BoxRequestEntity() { Id = "0" }
                    };
                    var boxFile = await boxClient.FilesManager.UploadAsync(request, fs);
                }
            }
            
            HttpContext.Current.Session[BOX_USER_ID_KEY] = (string)boxId;
        }

        private static string GetBoxIdFromAuth0(string auth0UserId)
        {
            var auth0User = AUTH0_CLIENT.GetUser(auth0UserId);
            var boxId = auth0User.ExtraProperties.FirstOrDefault(p => p.Key == BOX_USER_ID_KEY).Value;
            return (string)boxId;
        }
    }
}