# box-node-express-skeleton-app

## Prerequisites
* [Node.js](https://nodejs.org/en/)
* [NPM](https://www.npmjs.com/)
* [Docker](https://docs.docker.com/docker-for-mac/)
* [Docker Compose](https://docs.docker.com/compose/install/)

### Configuration
#### Box Platform Configuration
#### Step 1. Create a Box Application
1. Sign up for a [free Box Developer account](https://account.box.com/signup/n/developer) or log in to the [Box Developer Console](https://app.box.com/developers/console).
2. Select "Create New App".
    * Select "Custom App" and click "Next".
    * Select "OAuth 2.0 with JWT (Server Authentication)" and click "Next".
    * Name the application "Box Node Express Sample - YOUR NAME".
        * *Application names must be unique across Box.*
    * Click "Create App" and then "View Your App".
3. Click "Generate a Public/Private Keypair".
    * *You may need to enter a 2-factor confirmation code.*
    * Save the JSON config file -- this config file also contains the private key generated for your application.
        * *Note: Box does not store the generated private key and this config file is the only copy of the private key. You can always delete this keypair from your application and generate a new keypair if you lose this config file.*
4. Be sure to add your configuration file to the `app` directory.
5. In the "CORS Allowed Origins" section, add `http://localhost:3000`.

#### Step 2. Authorize the Application in Your Box Account
1. In a new tab, log in to your Box account with the admin account and go to the Admin Console.
    * Applications that use Server Authentication must be authorized by the admin of the account.
    * Signing up for a [free Box Developer account](https://account.box.com/signup/n/developer) gives you access to a Box Enterprise.
2. Under the gear icon, go to Enterprise Settings (or Business Settings, depending on your account type).
3. Navigate to the Apps tab.
4. Under "Custom Applications", click "Authorize New App".
5. Enter the "Client ID" value from your Box application in the "API Key" field.
    * Your application is now authorized to access your Box account.

##### Step 3. Add environment variables to the Node Express App
1. Navigate to `box-node-express-skeleton-app` > `app` > `config` > `default.js`.
2. Add your own Box Config to the `app` directory under `box-node-express-skeleton-app` > `app`.
3. Add the environment variables from your Box application to the `default.js` file:
    * *Note: If you name your config file `config.json`, there are no changes needed.*
    * Under `module.exports.BoxSDKConfig`:
    ```
    boxConfigFilePath: Path to your Box Config file generated when creating a new Box App.
    // For example, boxConfigFilePath: "config.json"
    ```

#### Auth0 Configuration
Additionally, since you manage the identity and authorization for your Box App Users within your Node Express application, you'll need an identity service to fully utilize JWT authentication on behalf of your App Users.

For that reason, we've included the needed code and setup for an identity service provider named Auth0. You'll need to sign up for a free Auth0 account.

##### Step 1. Sign up for a free Auth0 account and configure your first client.
1. Sign up for a free trial account at [Auth0's site](https://auth0.com/).
2. You can optionally view their setup and quickstart materials by selecting **Web App** from their [documentation page](https://auth0.com/docs).
3. Navigate to the [clients page](https://manage.auth0.com/#/clients). You should automatically have a client name **Default**.
4. In the "Allowed Callback URLs" section, add `http://localhost:3000/callback`.
5. Set the "Client Type" to "Regular Web Application".
6. Retrieve the following values:
    * Domain
    * Client ID
    * Client Secret

#### Step 2. Add Auth0 configuration values to the Node Express application.
1. Navigate to `box-node-express-skeleton-app` > `config` > `default.js`
2. In the `default.js` file, replace these values with those from your Auth0 client:
    * Under `module.exports.Auth0Config`
    * `clientId`
    * `clientSecret`
    * `domain`


### Build and Run

For convenience, we've included a `docker-compose.yml` file for running Redis and this application. Redis is used in caching tokens and improving performance.

Make sure you have Docker and Docker Compose installed and use the command `docker-compose up` to start this application.
* Download Docker here:
* [Docker Community Edition](https://www.docker.com/community-edition) 

If you need to bring the application down, run `docker-compose down`.

The following port must be available on your machine:
- `3000`

Once the server is running, navigate to [http://localhost:3000](http://localhost:3000). 

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
