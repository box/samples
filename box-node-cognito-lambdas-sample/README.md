# box-node-cognito-lambdas-sample

This sample shows how to integrate AWS Cognito with Box. Every user created in the Cognito user pool automatically maps to a corresponding Box App User.
Additionally, you create an API endpoint used to exchange the Cognito user JWT ID token for a Box App User token. With this Box App User token, the user performs operations against the Box API without the need to sign up for a Box account.

This sample gives the step-by-step instructions.

#### Prerequisite
1. Install node.js version 6.10 or above.
2. Install npm.
    
#### Step 1. Create a Box Application
1. Sign up for a [free Box Developer account](https://account.box.com/signup/n/developer) or log in to the [Box Developer Console](https://app.box.com/developers/console).
2. Select "Create New App".
    * Select "Custom App" and click "Next".
    * Select "OAuth 2.0 with JWT (Server Authentication)" and click "Next".
    * Name the application "Box Node Cognito Integration Sample - YOUR NAME".
        * *Application names must be unique across Box.*
    * Click "Create App" and then "View Your App".
3. Click "Generate a Public/Private Keypair".
    * *You may need to enter a 2-factor confirmation code.*
    * Save the JSON config file -- this config file also contains the private key generated for your application.
        * *Note: Box does not store the generated private key and this config file is the only copy of the private key. You can always delete this keypair from your application and generate a new keypair if you lose this config file.*

#### Step 2. Authorize the Application in Your Box Account
1. In a new tab, log in to your Box account with the admin account and go to the Admin Console.
    * Applications that use Server Authentication must be authorized by the admin of the account.
    * Signing up for a [free Box Developer account](https://account.box.com/signup/n/developer) gives you access to a Box Enterprise.
2. Under the gear icon, go to Enterprise Settings (or Business Settings, depending on your account type).
3. Navigate to the Apps tab.
4. Under "Custom Applications", click "Authorize New App".
5. Enter the "Client ID" value from your Box application in the "API Key" field.
    * Your application is now authorized to access your Box account.

#### Step 3. Create Cognito User Pool
1. In your [AWS Management Console](https://aws.amazon.com/console), access Cognito.
2. Click "Manage your User Pools".
3. Click "Create user pool".
4. Name the pool `box-cognito-integration`.
5. Continue configuring your user pool based on the application needs.

#### Step 4. Create a Lambda Function to Create a Box App User
*  When the user logs in using Cognito for the first time, a Box App User is created and mapped to the Cognito user. Any subsequent logins do not perform any operations in Box.
See [Create App User Lambda function](https://github.com/box/samples/tree/cognito_integration/box-node-cognito-lambdas-sample/createAppUser) for more info.

#### Step 5. Create a Lambda Function that Generates Box App User Tokens from a Cognito JWT Access Token
* While a Cognito user is logged in on a web or mobile client, your application will need an API endpoint to generate Box App User tokens for the Cognito user. You'll use AWS API Gateway and a Lambda function to generate and send new Box App User tokens based on the Cognito user's identity.
See [Token Exchange Lambda function](https://github.com/box/samples/tree/cognito_integration/box-node-cognito-lambdas-sample/tokenExchange) for more info.

#### Step 6. Register an App to Access the Cognito User Pool
1. In your [AWS Management Console](https://aws.amazon.com/console), access Cognito.
2. Click "Manage your User Pools" and select the pool you created named `box-cognito-integration`.
3. Click "App Clients" and then "Add an app client".
4. Provide a name for the app client and choose other configuration details based on the application needs.
5. Click "Create app client". 
6. You'll use the app client to handle login with Cognito.

#### Step 7. Create a User
1. In your [AWS Management Console](https://aws.amazon.com/console), access Cognito.
2. Click "Manage your User Pools" and select the pool you created named `box-cognito-integration`.
3. Click "Users and groups" and then "Create user".
4. Complete the user details form and click "Create user".
5. If the user was created successfully, the status of the user should be "Enabled".

#### Step 8. Login as User
1. Log in as the user you created and change the password if required. AWS offers several samples for web and mobile client logins with Cognito, or you can use the [Box sample for Angular](https://github.com/box/samples/tree/master/box-aws-cognito-angular2-skeleton-app-sample).
2. The Post authentication trigger should fire the "Create App User Lambda Function" which creates the a new Box App User.
3. In your Box Enterprise, use the "Users and Groups" feature in the Admin Console to see the new App User. You can also view AWS CloudWatch logs from the "Create App User Lambda Function" to see output from the App User creation.

#### Step 9. Token Exchange
1. Once an ID token is generated from Cognito, the app client should call the API Gateway endpoint you created with a GET request. You must include the Cognito JWT ID token in the `Authorization` header in the GET request to your endpoint.
```bash
curl -X GET \
https://<api_gateway_id>.execute-api.<region>.amazonaws.com/prod/token \
-H 'Authorization: <cognito_id_token>' 
```
2. The Box token is sent as a successful response.

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
