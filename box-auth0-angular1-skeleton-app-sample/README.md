# box-auth0-angular1-skeleton-app

## Immediate Build and Run
This project includes sample configuration included so that you can download and immediately run the app.
Just download the assets as a `.zip` file, open a terminal in the root directory, and use `npm start` to build and run the project on a local development server.
The remaining documentation describes how to switch the existing credentials to target your own Box Developer and Auth0 accounts.

## Prerequisites
* [Node.js](https://nodejs.org/en/)
* [NPM](https://www.npmjs.com/)
* [Auth0 Account](https://auth0.com)
* [Box Developer Account](https://developer.box.com/)

### Configuration
#### Box Platform Configuration
##### Step 1. Create a Box application
1. Log into the [Box Developer Console](https://developer.box.com)
    * Switch to the open beta of the new Developer Console
2. Select "Create New App"
    * Select "Custom App" and press "Next"
    * Select "OAuth 2.0 with JWT (Server Authentication)" and press "Next"
    * Name the application "Box Auth0 Angular 1 App - YOUR NAME"
        * *Application names must be unique across Box*
    * Press "Create App" and then "View Your App"
3. In the "CORS Allowed Origins" section, add `http://localhost:3000`.
4. Click "Save Changes".

##### Step 2. Generate your private and public key and download your Box app credentials
1. Generate a private key and a public key to use with Server Authentication
2. Your Box application credentials will download in a JSON configuration file. You'll need this file when registering the Box Platform extension in Auth0.
3. Your application is ready to go

##### Step 3. Authorize the application into your Box account
1. In a new tab, log into your Box account as an admin and go to the Admin Console
    * *Applications that use Server Authentication must be authorized by the admin of the account*
2. Under the gear icon, go to Enterprise Settings (or Business Settings, depending on your account type)
3. Go to the Apps tab
3. Under "Custom Applications", press "Authorize New App"
4. Enter your "Client ID" from the developer console in the "API Key" field
    * Your application is now authorized to access your Box account

#### Auth0 Configuration
##### Step 1. Sign up for a free Auth0 account and configure your first client.
1. Sign up for a free trial account at [Auth0](https://auth0.com/).
2. You can optionally view setup and quickstart materials by selecting **Single Page App** from the [documentation page](https://auth0.com/docs).
3. Navigate to the [clients page](https://manage.auth0.com/#/clients). You should automatically have a client named **Default**.
4. Set the "Client Type" to "Single Page App".
5. Retrieve the following values:
    * Domain
    * Client ID
6. You'll need to register a callback URL for Auth0's Lock library. Follow the steps outlined [here](https://auth0.com/docs/quickstart/spa/angularjs#configure-callback-urls)

#### Step 2. Install the Box Platform Extension
1. Within your Auth0 Dashboard, click the *Extensions* tab.
2. Locate and click on the Box Platform Extension. 
    * You will need to provide the JSON configuration file containing your Box application credentials from creating your Box application.
    * Add http://localhost:3000 to the list of CORS approved domains for the Extension
    * You can reference the documentation provided [here](https://github.com/auth0-extensions/auth0-box-platform-extension) or the documentation on the Extension page for more instructions.
3. Once you've completed setup for the Box Platform Extension, be sure to retrieve your automatically generated Webtask URL.
    * Your URL should follow this pattern: https://<YOUR_DOMAIN>.us.webtask.io/auth0-box-platform/delegation

#### Angular 1 Application Configuration
##### Step 1. Download the project dependencies
1. Use `npm install` to download the needed depenedencies for this project.
2. Navigate to `public > js` and use `npm install` to download the dependencies for the front end application.
##### Step 2. Add environment variables to the Angular 1 App
1. Navigate to `public > js` and change the `app-config.js` file to the `AUTH0_CLIENT_ID` and `AUTH0_DOMAIN` from your Auth0 Client.
2. In the same `app-config.js` file, change `BOX_REFRESH_TOKEN_URL` to the Webtask URL generated for you when you installed the Box Platform Extension in Auth0.
##### Step 3. Run your app
1. Run your app by using the `npm start` command from the root directory.
2. Navigate your browser to `http://localhost:3000`.

*Please note: This project utilizes the Box JavaScript SDK maintained [here](https://github.com/amgrobelny-box/box-javascript-sdk). This SDK is not officially supported by Box.*

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

