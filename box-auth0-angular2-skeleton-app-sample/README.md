# box-auth0-angular2-skeleton-app

## Immediate Build and Run
This project includes sample configuration included so that you can download and immediately run the app.
Just download the assets as a `.zip` file, open a terminal in the root directory, and use `ng serve` to build and run the project on a local development server.
The remaining documentation describes how to switch the existing credentials to target your own Box Developer and Auth0 accounts.

## Prerequisites
* [Angular 2 CLI](https://cli.angular.io/)
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
    * Name the application "Box Auth0 Angular2 App - YOUR NAME"
        * *Application names must be unique across Box*
    * Press "Create App" and then "View Your App"
    * Check the "Manage users" scope and press "Save Changes"
3. In the "CORS Allowed Origins" section, add `http://localhost:4200`.
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
6. You'll need to register a callback URL for Auth0's Auth library. Follow the steps outlined [here](https://auth0.com/docs/quickstart/spa/angular2#configure-callback-urls)
 * This project uses `http://localhost:4200`

#### Step 2. Install the Box Platform Extension
1. Within your Auth0 Dashboard, click the *Extensions* tab.
2. Locate and click on the Box Platform Extension. 
    * You will need to provide the JSON configuration file containing your Box application credentials from creating your Box application.
    * Add http://localhost:4200 to the list of CORS approved domains for the Extension
    * You can reference the documentation provided [here](https://github.com/auth0-extensions/auth0-box-platform-extension) or the documentation on the Extension page for more instructions.
3. Once you've completed setup for the Box Platform Extension, be sure to retrieve your automatically generated Webtask URL.
    * Your URL should follow this pattern: https://<YOUR_DOMAIN>.us.webtask.io/auth0-box-platform/delegation

#### Angular 2 Application Configuration
##### Step 1. Download the project dependencies
1. Use `npm install` to download the needed depenedencies for this project.
2. Don't forget to install the [Angular 2 CLI](https://cli.angular.io/) if you haven't already.
##### Step 2. Add environment variables to the Angular 2 App
1. Navigate to `src > app > config > auth` and change the `auth.config.ts` file to the `domain` and `clientID` from your Auth0 Client.
2. Navigate to `src > app > config > box` and change the `box.config.ts` file `refreshTokenUrl` to the Webtask URL generated for you when you installed the Box Platform Extension in Auth0.
3. Build and run your app by using the `ng serve` command from the root directory.
4. Navigate your browser to `http://localhost:4200`.

#### Angular CLI Commands
##### Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

##### Code scaffolding
Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

##### Build
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

##### Running unit tests
Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

##### Running end-to-end tests
Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

##### Further help
To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

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

