# box-java-servlet-skeleton-app

## Prerequisites

In order to run this example you will need to have Maven installed. On a Mac, you can install Maven with [brew](http://brew.sh/):

```sh
brew install maven
```

Check that your maven version is 3.0.x or above:
```sh
mvn -v
```

#### Java Cryptography Extension (JCE) Unlimited Strength Jurisdiction Policy Files
*Note: If you utilize the Docker container contained in this project, you won't need to alter the installed Java version on your local machine.*

If you don't install this, you'll get an exception about key length. This is not a Box thing, this is a U.S. Government requirement concerning strong encryption. Please follow the instructions *exactly*.
> [Java 7 installer](http://www.oracle.com/technetwork/java/javase/downloads/jce-7-download-432124.html)

> [Java 8 installer](http://www.oracle.com/technetwork/java/javase/downloads/jce8-download-2133166.html)

### Configuration
#### Box Platform Configuration
#### Step 1. Create a Box Application
1. Sign up for a [free Box Developer account](https://account.box.com/signup/n/developer) or log in to the [Box Developer Console](https://app.box.com/developers/console).
2. Select "Create New App".
    * Select "Custom App" and click "Next".
    * Select "OAuth 2.0 with JWT (Server Authentication)" and click "Next".
    * Name the application "Box Java Servlet Sample - YOUR NAME".
        * *Application names must be unique across Box.*
    * Click "Create App" and then "View Your App".
3. Click "Generate a Public/Private Keypair".
    * *You may need to enter a 2-factor confirmation code.*
    * Save the JSON config file -- this config file also contains the private key generated for your application.
        * *Note: Box does not store the generated private key and this config file is the only copy of the private key. You can always delete this keypair from your application and generate a new keypair if you lose this config file.*
4. Be sure to add your configuration file to the root of this project directory.
5. In the "CORS Allowed Origins" section, add `http://localhost:8080`.

#### Step 2. Authorize the Application in Your Box Account
1. In a new tab, log in to your Box account with the admin account and go to the Admin Console.
    * Applications that use Server Authentication must be authorized by the admin of the account.
    * Signing up for a [free Box Developer account](https://account.box.com/signup/n/developer) gives you access to a Box Enterprise.
2. Under the gear icon, go to Enterprise Settings (or Business Settings, depending on your account type).
3. Navigate to the Apps tab.
4. Under "Custom Applications", click "Authorize New App".
5. Enter the "Client ID" value from your Box application in the "API Key" field.
    * Your application is now authorized to access your Box account.

##### Step 3. Add Configuration File to the Java App
1. Add your generated Box config file to the root of this project and name the file `config.json`.

#### Auth0 Configuration
Additionally, since you manage the identity and authorization for your Box App Users within your Java application, you'll need an identity service to fully utilize JWT authentication on behalf of your App Users.

For that reason, we've included the needed code and setup for an identity service provider named Auth0. You'll need to sign up for a free Auth0 account.

##### Step 1. Sign Up for a Free Auth0 Account and Configure Your First Client.
1. Sign up for a free trial account at [Auth0's site](https://auth0.com/).
2. You can optionally view their setup and quickstart materials by selecting **Web App** from their [documentation page](https://auth0.com/docs).
3. Navigate to the [clients page](https://manage.auth0.com/#/clients). You should automatically have a client name **Default**.
4. In the "Allowed Callback URLs" section, add `http://localhost:8080/callback`.
5. Retrieve the following values:
    * Domain
    * Client ID
    * Client Secret

#### Step 2. Add Auth0 Configuration Values to the Java application.
1. Navigate to `box-java-servlet-skeleton-app` > `src` > `main` > `webapp` > `WEB-INF` > `web.xml`
2. In the `web.xml` file, in the `<!-- Auth0 Configuration -->` section, find each value you retrieved from the Auth0 client in the previous step.
3. In the `<param-value>` portion of each setting, replace with the values you retrieved from your default Auth0 client.


### Build and Run

In order to build and run the project locally, you must execute:
```sh
mvn clean install org.mortbay.jetty:jetty-maven-plugin:run
```

If you have Docker installed, you can run the following to use the Docker configuration included in this repo:
```sh
mvn clean package
docker-compose up --build
```

Then, go to [http://localhost:8080/login](http://localhost:8080/login).

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