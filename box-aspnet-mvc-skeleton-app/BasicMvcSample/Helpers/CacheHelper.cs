using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace BasicMvcSample.Helpers
{
    public static class CacheHelper
    {
        static readonly string CACHE_PREFIX = ConfigurationManager.AppSettings["boxEnterpriseId"];

        public static object Fetch(string key, TimeSpan expiresIn, Func<object> generateObjectFunction)
        {
            var cache = HttpContext.Current.Cache;
            var keyWithPrefix = CACHE_PREFIX + "/" + key;

            object result = cache.Get(keyWithPrefix);
            if (result == null)
            {
                result = generateObjectFunction();
                cache.Add(keyWithPrefix, result, null, DateTime.Now.Add(expiresIn), System.Web.Caching.Cache.NoSlidingExpiration, System.Web.Caching.CacheItemPriority.Default, null);
            }

            return result;
        }
    }
}