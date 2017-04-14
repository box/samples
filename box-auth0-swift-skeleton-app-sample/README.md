# box-auth0-swift-skeleton-app

## Immediate Build and Run
This project includes sample configuration included so that you can download and immediately run the app.
Just download the assets as a `.zip` file, open the `.xcworkspace` file, and click run in Xcode.
The remaining documentation describes how to switch the existing credentials to target your own Box Developer and Auth0 accounts.

## Prerequisites
* [Xcode](https://developer.apple.com/xcode/)
* [Auth0 Account](https://auth0.com)
* [Box Developer Account](https://developer.box.com/)

### Configuration
#### Box Platform Configuration
##### Step 1. Create a Box application
1. Log into the [Box Developer Console](https://developer.box.com)
    * Switch to the open beta of the new Developer Console, if needed
2. Select "Create New App"
    * Select "Custom App" and press "Next"
    * Select "Server Authentication" and press "Next"
        * *This sample demonstrates a server-to-server integration*
    * Name the application "Box Auth0 Swift App - YOUR NAME"
        * *Application names must be unique across Box*
    * Press "Create App" and then "View Your App"
    * Check the "Manage users" scope and press "Save Changes"

##### Step 2. Generate your private and public keys
*Note: You can skip this step if you generate your private and public keys through Box's Developer Console*
1. Generate a private key and a public key to use with Server Authentication
    * For example, you can use `openssl` if you are on a Unix based OS:
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
3. Go to the Apps tab
3. Under "Custom Applications", press "Authorize New App"
4. Enter your "Client ID" from the developer console in the "API Key" field
    * Your application is now authorized to access your Box account

##### Step 4. Download your Box application credentials 
1. Navigate to your Box application in the Box Developer Console.
2. You can download the credentials for your Box application in a JSON configuration file.

#### Auth0 Configuration
##### Step 1. Sign up for a free Auth0 account and configure your first client.
1. Sign up for a free trial account at [Auth0](https://auth0.com/).
2. You can optionally view setup and quickstart materials by selecting **Native** from the [documentation page](https://auth0.com/docs).
3. Navigate to the [clients page](https://manage.auth0.com/#/clients). You should automatically have a client named **Default**.
4. Set the "Client Type" to "Native".
5. Retrieve the following values:
    * Domain
    * Client ID
6. You'll need to register a callback URL for Auth0's Lock library. Follow the steps outlined [here](https://auth0.com/docs/quickstart/native/ios-swift#configure-callback-urls)
    * *Note: You can skip this step while testing.* 

#### Step 2. Install the Box Platform Extension
1. Within your Auth0 Dashboard, click the *Extensions* tab.
2. Locate and click on the Box Platform Extension. 
    * You will need to provide the JSON configuration file containing your Box application credentials from creating your Box application:
    * You can reference the documentation provided [here](https://github.com/auth0-extensions/auth0-box-platform-extension) or the documentation on the Extension page for more instructions.
3. Once you've completed setup for the Box Platform Extension, be sure to retrieve your automatically generated Webtask URL.
    * Your URL should follow this pattern: https://<YOUR_DOMAIN>.us.webtask.io/auth0-box-platform/api/token

#### iOS Application Configuration
##### Step 1. Open the project
1. Be sure to open the .xcworkspace file in XCode.

##### Step 2. Add environment variables to the iOS Swift App
1. Change the environment variables in the `Auth0.plist` file to those from your Auth0 Client.
2. Change the `refreshUrl` variable within `BoxAccessTokenDelegate.swift` to the Webtask URL generated for you when you installed the Box Platform Extension in Auth0.
3. Build and run your app from Xcode.

### Next Steps
* [Box Platform Developer Documentation](https://developer.box.com/).
* [Box Platform Blog](https://docs.box.com/blog/).
* [Auth0 Developer Documentation](https://auth0.com/docs).
* [Auth0 Blog](https://auth0.com/blog/).

Support
-------

Need to contact us directly?
* [Box Developer Forum](https://community.box.com/t5/Developer-Forum/bd-p/DeveloperForum).
* [Auth0 Developer Documentation](https://auth0.com/forum/)

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
