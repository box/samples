# box-aspnet-mvc-skeleton-app

## Prerequisites
A Windows environment and Visual Studio 2015 or above
ASP.NET MVC 5 
.NET 4.5 or greater

###Configuration
####Box Platform Configuration
##### Step 1. Create a Box application
1. Log into the [Box Developer Console](https://developers.box.com)
    * Switch to the open beta of the new Developer Console, if needed
2. Select "Create New App"
    * Select "Custom App" and press "Next"
    * Select "Server Authentication" and press "Next"
        * *This sample demonstrates a server-to-server integration*
    * Name the application "Box ASPNET MVC App - YOUR NAME"
        * *Application names must be unique across Box*
    * Press "Create App" and then "View Your App"
    * Check the "Manage users" scope and press "Save Changes"
        * You'll need your "Client ID" and "Client Secret" later
    * In the "CORS Allowed Origins" section, add `http://localhost:1655` (*Note*: your port number could vary) to use the clientside upload demo.

##### Step 2. Generate your private and public keys
1. Generate a private key and a public key to use with Server Authentication
    *Note*: You may need to download a tool like [Cygwin](https://www.cygwin.com/) to use commands like `openssl` in a Windows environment.
    * In the `box-aspnet-mvc-skeleton-app` directory, run the following commands:
    ```
    openssl genrsa -aes256 -out private_key.pem 2048
    openssl rsa -pubout -in private_key.pem -out public_key.pem
    ```
    You'll need the passphrase for your private key later
2. Add the public key to the application
    * Press "Add Public Key"
        * You will need to set up 2-factor authentication, if you haven't already
    * Copy the public key: `cat public_key.pem | pbcopy`
    * Paste it into the "Public Key" field
    * Press "Verify and Save"
        * You will need to enter a 2-factor confirmation code
    * You'll need the ID of your public key later
3. Your application is ready to go

##### Step 3. Authorize the application into your Box account
1. In a new tab, log into your Box account as an admin and go to the Admin Console
    * *Applications that use Server Authentication must be authorized by the admin of the account*
2. Under the gear icon, go to Enterprise Settings (or Business Settings, depending on your account type)
    * You'll need the "Enterprise ID" of your account later
3. Go to the Apps tab
3. Under "Custom Applications", press "Authorize New App"
4. Enter your "Client ID" from the developer console in the "API Key" field
    * Your application is now authorized to access your Box account

##### Step 4. Add environment variables to the ASPNET MVC App
1. Navigate to `box-aspnet-mvc-skeleton-app` > `BasicMVCSample` > `Web.config`.
2. Add the environment variables from your Box application to the `Web.config` file:
    * You can find each required value within Box's Developer Console and your Enterprise. For more information, you can reference our Quickstart guide:
    * [Box Platform Quickstart](https://docs.box.com/docs/getting-started-box-platform)
    ```
    boxClientId = Your Client ID
    boxClientSecret = Your Client Secret
    boxPrivateKeyFile = Your private key, stored in the root of `box-aspnet-mvc-skeleton-app`
    boxPublicKeyId = Your Public Key ID
    boxPrivateKeyPassword = Your Private Key Passphrase
    boxEnterpriseId = Your Enterprise ID
    ```

####Auth0 Configuration
Additionally, since you manage the identity and authorization for your Box App Users within your ASPNET MVC application, you'll need an identity service to fully utilize JWT authentication on behalf of your App Users.

For that reason, we've included the needed code and setup for an identity service provider named Auth0. You'll need to sign up for a free Auth0 account.

##### Step 1. Sign up for a free Auth0 account and configure your first client.
1. Sign up for a free trial account at [Auth0's site](https://auth0.com/).
2. You can optionally view their setup and quickstart materials by selecting **Web App** from their [documentation page](https://auth0.com/docs).
3. Navigate to the [clients page](https://manage.auth0.com/#/clients). You should automatically have a client name **Default**.
4. In the "Allowed Callback URLs" section, add `http://localhost:1655/signin-auth0`. (*Note*: your port number could vary)
5. Retrieve the following values:
    * Domain
    * Client ID
    * Client Secret

#### Step 2. Add Auth0 configuration values to the ASPNET MVC application.
1. Navigate to `box-aspnet-mvc-skeleton-app` > `BasicMVCSample` > `Web.config`
2. In the `Web.config` file, replace these values with those from your Auth0 client:
    * `auth0:ClientId`
    * `auth0:ClientSecret`
    * `auth0:Domain`


### Build and Run

Simply start your project from Visual Studio's start button. Your browser of choice should open automatically to the home page of your app.

Support
-------

Need to contact us directly? You can post to the
[Box Developer Forum](https://community.box.com/t5/Developer-Forum/bd-p/DeveloperForum).

Copyright and License
---------------------

Copyright 2017 Box, Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.