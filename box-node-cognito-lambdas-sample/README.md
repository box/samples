# box-node-rekognition-lambdas-sample

This sample shows how to integrate AWS Cognito with Box. Every user created in the Cognito pool is created as an app user in the Box enterprise.
Using the Cognito JWT user token, the app user token can be generated from Box. Using Box's app user token, the user performs operations in Box.

This sample gives the step-by-step instructions.

#### Prerequisite
1. Install node.js version 4.3 or above.
2. Install npm.

#### Step 1. Create a Box application
1. Log into the [Box Developer Console](https://developers.box.com) in your Box developer account
    * Switch to the open beta of the new Developer Console, if needed
2. Select "Create New App"
    * Select "Custom App" and press "Next"
        * *You can also pick "Enterprise Integration" if your app will interact with existing Box enterprises*
    * Select "Server Authentication" and press "Next"
        * *This sample demonstrates a server-to-server integration*
    * Name the application "Box Node Cognito integration Sample - YOUR NAME"
        * *Application names must be unique across Box*
    * Press "Create App" and then "View Your App"
    * Select "Application Access" as "Enterprise".
    * Check the Application scopes "Manage users" and "Manage enterprise properties".
    * Enable both Advanced Features "Perform Actions as Users" and "Generate User Access Tokens".
    * Press "Save Changes"
        * *You'll need your "Client ID" and "Client Secret" later*

#### Step 2. Generate your private and public keys
1. Generate a private key and a public key to use with Server Authentication
    * In the `box-node-cognito-lambdas-sample` directory, run the following commands:
    ```
    openssl genrsa -aes256 -out private_key.pem 2048
    openssl rsa -pubout -in private_key.pem -out public_key.pem
    ```
    * Copy the private_key.pem file to the createAppUser and the tokenExchnage folders.  
    * You'll need the passphrase for your private key later
2. Add the public key to the application created in Step 1.
    * Press "Add Public Key"
        * *You will need to set up 2-factor authentication, if you haven't already.*
    * Copy the public key: `cat public_key.pem | pbcopy`
    * Paste it into the "Public Key" field
    * Press "Verify and Save"
        * *You will need to enter a 2-factor confirmation code.*
    * You'll need the ID of your public key later
3. Your application is ready to go

#### Step 3. Authorize the application into your Box account
1. In a new tab, log into your Box developer account as an admin and go to the Admin Console
    * Applications that use Server Authentication must be authorized by the admin of the account
2. Under the gear icon, go to Enterprise Settings (or Business Settings, depending on your account type)
    * You'll need the "Enterprise ID" of your account later
3. Go to the Apps tab
3. Under "Custom Applications", press "Authorize New App"
4. Enter your "Client ID" from the developer console in the "API Key" field
    * Your application is now authorized to access your Box account

#### Step 4. Create Cognito user pool
1. Log into the [AWS Management Console](https://aws.amazon.com/console) and go to the Cognito console.
2. Press "Manage you User Pools"
3. Press "Create user pool"
4. Fill pool name as "box-cognito-integration". Press the "Step through settings"
5. Press "Add a custom attribute"
6. Choose the String type. Give the attribute name as "box_appuser_id". Press "Next step".
7. Configure next steps based on the application needs.
8. Finally press "Create pool".

#### Step 5. Create a Lambda function that create the App user in Box, when the user logs in for the first time. The subsequent logins does not do any operations in Box.
See [Create App User Lambda function](https://github.com/box/samples/tree/cognito_integration/box-node-cognito-lambdas-sample/createAppUser) for more info.

#### Step 6. Create a Lambda function that generates Box app user token for the given Cognito JWT access token.
See [Token Exchange Lambda function](https://github.com/box/samples/tree/cognito_integration/box-node-cognito-lambdas-sample/tokenExchange) for more info.

#### Step 7. Register an App to access the pool
1. Log into the [AWS Management Console](https://aws.amazon.com/console) and go to the Cognito console.
2. Press "Manage you User Pools". Press the user pools you have created. Here the name of the pool is "box-cognito-integration".
3. Press the "App". Then, press "Add an app".
4. Give the app name and fill other configuration details based on the need.
5. Press "Create app". The app is created. 
6. Press "Save changes".

#### Step 8. Develop an app client
The app client should handle the login to Cognito.
Also it should support the newPasswordRequired operation to generate a new password for the first time login based on the configuration.

#### Step 9. Cognito admin user creates a user
1. Log into the [AWS Management Console](https://aws.amazon.com/console) and go to the Cognito console.
2. Press "Manage you User Pools". Press the user pools you have created. Here the name of the pool is "box-cognito-integration".
3. Press "Users and groups".
4. Press "Create user". Fille the details and press "Create user" button in the pop-up.
5. The user created successfully. The status of the user is "Enabled".

#### Step 10. Login as user
1. Login as the user that is created in the previous step. Change password if it asks for it.
2. It triggers the "Create App User Lambda Function". That creates the user in Box.
3. Verify in Box that the user is created successfully in the enterprise.

#### Step 11. Token exchange
1. Once a token is generated from Cognito, the app client should call the API gateway end point that is used as a trigger for the "Token Exchange Lambda function".
2. The Box token is sent as a successful response. The request body looks as below.
```
{
    "token" : "<cognito_token>"
}
```

Support
-------

Need to contact us directly? You can post to the
[Box Developer Forum](https://community.box.com/t5/Developer-Forum/bd-p/DeveloperForum).

Copyright and License
---------------------

Copyright 2016 Box, Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
