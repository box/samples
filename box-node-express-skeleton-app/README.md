# box-node-express-skeleton-app

## Prerequisites
* [Node.js](https://nodejs.org/en/)
* [NPM](https://www.npmjs.com/)
* [Docker](https://docs.docker.com/docker-for-mac/)
* [Docker Compose](https://docs.docker.com/compose/install/)

### Configuration
#### Box Platform Configuration
##### Step 1. Create a Box application
1. Log into the [Box Developer Console](https://developers.box.com)
    * Switch to the open beta of the new Developer Console, if needed
2. Select "Create New App"
    * Select "Custom App" and press "Next"
    * Select "Server Authentication" and press "Next"
        * *This sample demonstrates a server-to-server integration*
    * Name the application "Box Node Express App - YOUR NAME"
        * *Application names must be unique across Box*
    * Press "Create App" and then "View Your App"
    * Check the "Manage users" scope and press "Save Changes"
        * You'll need your "Client ID" and "Client Secret" later
    * In the "CORS Allowed Origins" section, add `http://localhost:3000` to use the clientside upload demo.

##### Step 2. Generate your private and public keys
1. Generate a private key and a public key to use with Server Authentication
    * In the `box-node-express-skeleton-app` directory, run the following commands:
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

##### Step 4. Add environment variables to the Node Express App
1. Navigate to `box-node-express-skeleton-app` > `config.js`.
2. Add the environment variables from your Box application to the `config.js` file:
    * You can find each required value within Box's Developer Console and your Enterprise. For more information, you can reference our Quickstart guide:
    * [Box Platform Quickstart](https://docs.box.com/docs/getting-started-box-platform)
    * Under `module.exports.BoxConfig`:
    ```
    boxClientId = Your Client ID
    boxClientSecret = Your Client Secret
    boxPrivateKey = Your private key, stored in the root of `box-aspnet-mvc-skeleton-app`
    boxPublicKeyId = Your Public Key ID
    boxPrivateKeyPassword = Your Private Key Passphrase
    boxEnterpriseId = Your Enterprise ID
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

#### Step 2. Create an Auth0 Management API Token Client Grant
1. This project makes use of Auth0's Management API. You'll need to grant your Default client to have access to the Management API.
    * Read more about this [here](https://auth0.com/docs/api/management/v2/tokens#1-create-and-authorize-a-client)
2. Navigate to the [APIs](https://manage.auth0.com/#/apis) portion and click "Auth0 Management API".
3. Under "Non Interactive Clients" click the slider to "Authorized".
4. Add the following scopes:
    * read:users_app_metadata
    * create:users_app_metadata
    * update:users_app_metadata

#### Step 3. Add Auth0 configuration values to the Node Express application.
1. Navigate to `box-node-express-skeleton-app` > `config.js`
2. In the `config.js` file, replace these values with those from your Auth0 client:
    * Under `module.exports.Auth0Config`
    * `clientId`
    * `clientSecret`
    * `domain`


### Build and Run

For convenience, we've included a `docker-compose.yml` file for running Redis. Redis is used in caching tokens and improving performance.

Make sure you have Docker and Docker Compose installed and use the command `docker-compose up` to start Redis.

If you need to bring Redis down, run `docker-compose down`.

The following ports must be available on your machine:
- `6379`
- `3000`

Run `npm install` to download all needed dependencies for this project. There are two ways to start the server:
1. Use `npm start` to run the server. The server will run until you end the process.
2. If you want to make changes and have the server restart automatically, use `npm run dev-start`.

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
