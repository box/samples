using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(BasicMvcSample.Startup))]
namespace BasicMvcSample
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}