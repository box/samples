# box-node-lambda-sample

This sample demonstrates how to call Box APIs from an AWS Lambda function using the [Box Node SDK](https://github.com/box/box-node-sdk).

#### Step 1. Create a Box application
1. Log into the [Box Developer Console](https://developers.box.com)
    * Switch to the open beta of the new Developer Console, if needed
2. Select "Create New App"
    * Select "Custom App" and press "Next"
        * *You can also pick "Enterprise Integration" if your app will interact with existing Box enterprises*
    * Select "Server Authentication" and press "Next"
        * *This sample demonstrates a server-to-server integration*
    * Name the application "Box Node Lambda Sample - YOUR NAME"
        * *Application names must be unique across Box*
    * Press "Create App" and then "View Your App"
        * *You can leave all of the default settings for the sample app*
        * Note your "Client ID" and "Client Secret" for later

#### Step 2. Generate your private and public keys
1. Generate a private key and a public key to use with Server Authentication
    * In the `box-node-lambda-sample` directory, run the following commands:
    ```
    openssl genrsa -aes256 -out private_key.pem 2048
    openssl rsa -pubout -in private_key.pem -out public_key.pem
    ```
    You'll need your "Private Key Passphrase" later
2. Add the public key to the application
    * Press "Add Public Key"
        * You will need to set up 2-factor authentication, if you haven't already
    * Copy the public key: `cat public_key.pem | pbcopy`
    * Paste it into the "Public Key" field
    * Press "Verify and Save"
        * You will need to enter a 2-factor confirmation code
    * Note your "Public Key ID" for later
3. Your application is ready to go

#### Step 3. Authorize the application into your Box account
1. In a new tab, log into your Box account as an admin and go to the Admin Console
    * *Applications that use Server Authentication must be authorized by the admin of the account*
2. Under the gear icon, go to Enterprise Settings (or Business Settings, depending on your account type)
    * Note the "Enterprise ID" of your account
3. Go to the Apps tab
3. Under "Custom Applications", press "Authorize New App"
4. Enter your "Client ID" from the developer console in the "API Key" field
    * Your application is now authorized to access your Box account

#### Step 4. Create the AWS Lambda function
1. Build the deployment package for the Lambda function
    * `cd` into the `box-node-lambda-sample` directory
    * Run `npm install` to install the [Box Node SDK](https://github.com/box/box-node-sdk) 
    * Ensure that the `private_key.pem` file is in the directory 
    * Run `npm run zip` to create `box-node-lambda-sample.zip`
    * The ZIP file includes the sample code in `index.js`, the private key in `private_key.pem`, plus the Box Node SDK
2. Log into the [AWS Management Console](https://aws.amazon.com/console) and go to the Lambda Management Console
3. Press "Create a Lambda function"
    * Choose the "Blank Function" blueprint
    * There is no need to configure a trigger for the Lambda function
    * Press "Next"
4. Configure the lambda function
    * Name = "box-node-lambda-sample"
    * Description = "Demonstrates how to call Box APIs from an AWS Lambda function using the Box Node SDK"
    * Runtime = "Node.js 4.3"
    * Code entry type = "Upload a .ZIP file"
    * Function package = Browse and select `box-node-lambda-sample.zip`
    * Environment variables:
        * *Storing the application secrets in environment variables makes them easier to secure and manage*
    ```
    BOX_CLIENT_ID = Your Client ID
    BOX_CLIENT_SECRET = Your Client Secret
    BOX_PUBLIC_KEY_ID = Your Public Key ID
    BOX_PRIVATE_KEY_PASSPHRASE = Your Private Key Passphrase
    BOX_ENTERPRISE_ID = Your Enterprise ID
    ```
    * Handler = "index.handler". This sets the entry point to be the `handler()` function of the `index.js` module
    * Role = "Create new role from template"
    * Role Name = "box-node-lambda-sample-role"
    * Policy Templates = Leave blank
    * Leave all of the advanced settings with default values
    * Press "Next"
6. Press "Create function"
    * Once the Lambda function is created, you will see the sample code from `index.js` that was uploaded in the ZIP file
    * This first section initializes the Lambda function:
        * First, it creates a `BoxSDK` object, initializing it with your application secrets from the environment variables
        * Then, it creates a `BoxClient` object that obtains an access token for the Service Account in your Box enterprise
    *  The Lambda's `handler` function will be called each time the Lambda function is invoked:
        * For this example, the `handler` function simply retrieves info about the Service Account user and returns it as the response
        from the Lambda function

#### Step 5. Test the Lambda function
1. Press the "Test" button
    * This Lambda function does not require any input, so just leave the sample test data as is and press "Save and test"
2. The result should be similar to the following JSON response:

    ```JSON
    {
      "type": "user",
      "id": "12345678",
      "name": "Box Node Lambda Sample",
      "login": "AutomationUser_123456_A1Z2abcdef@boxdevedition.com",
      "created_at": "2017-01-25T15:39:38-08:00",
      "modified_at": "2017-01-25T17:21:56-08:00",
      "language": "en",
      "timezone": "America/Los_Angeles",
      "space_amount": 5368709120,
      "space_used": 0,
      "max_upload_size": 5368709120,
      "status": "active",
      "job_title": "",
      "phone": "",
      "address": "",
      "avatar_url": "https://xyz.app.box.com/api/avatar/large/12345678"
    }
    ```
    
3. Your Lambda function is sucessfully calling the Box API!

#### Next Steps
Now that you can call Box from your AWS Lambda function, modify the sample Lambda function to make other Box API calls
using the [Box Node SDK](https://github.com/box/box-node-sdk):
1. Create and view content owned by the service account

    ```Javascript
    client.folders.create(0, 'Test Folder', (err, result) => {...});
    client.folders.getItems(0, null, (err, result) => {...});
    ```
    
2. Create app users
    * Add the "Manage users" scope to the application in the Developer Console
    * Whenever you add scopes to your application, you need to re-authorize it in the Admin Console
    
    ```Javascript
    client.enterprise.addUser(null, 'Test App User', {is_platform_access_only: true}, (err, result) => {...});
    ```
    
3. Make API calls using a user's account
    * Add the "Generate User Access Tokens" scope to the application and re-authorize it in the Admin Console
    * Create a user client that makes API calls as a specific user
    
    ```Javascript
    const userClient = sdk.getAppAuthClient('user', user_id);
    userClient.folders.create(0, 'User Folder', (err, result) => {...});
    ```
    
4. Alternatively, you can make API calls on behalf of a user using the service account client
    * Add the "Perform Actions as Users" scope to the application and re-authorize it in the Admin Console
    * Use the `asUser()` and `asSelf()` functions to make API calls as a specific user
    
    ```Javascript
    client.asUser(user_id);
    client.folders.create(0, 'User Folder', (err, result) => {...});
    client.asSelf();
    ```
    
5. Use the AWS ["encryption helpers"](http://docs.aws.amazon.com/lambda/latest/dg/tutorial-env_console.html)
   to encrypt the environment variables that hold the application secrets
    * Modify the sample code to decrypt the secrets before creating the Box SDK and client objects

#### Troubleshooting
1. If you didn't set the `BOX_CLIENT_ID` environment variable, you will get: `"clientID" must be set via init() before using the SDK.`
2. If you didn't set the `BOX_PRIVATE_KEY_PASSPHRASE` environment variable, you will get: `"Passphrase must be provided in app auth params"`
3. If you didn't set the `BOX_PUBLIC_KEY_ID` environment variable, you will get: `"Must provide app auth configuration to use JWT Grant"`
4. If your Private Key Passphrase is wrong, you will get: `"Error: error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt"`
5. If your Client ID is wrong, you will get: `"Please check the 'iss' claim."`
6. If your Enterprise ID is wrong, you will get: `"Please check the 'sub' claim."`
7. If your Public Key ID is wrong, you will get: `"OpenSSL unable to verify data: "`
8. If your `private_key.pem` is wrong, you will get: `"OpenSSL unable to verify data: error:0906D06C:PEM routines:PEM_read_bio:no start line"`
9. If your Client Secret is wrong, you will get: `"The client credentials are invalid"`
10. If you forgot to add your public key, you will get: `"This app is not configured properly. No public key(s) added"`
11. If you forgot to authorize the app, you wil get: `"This app is not authorized by the enterprise admin"`
12. If you get `"Task timed out after 3.00 seconds"`, you may be getting a network error or Box server error.
Try increasing the "Timeout" value in "Advanced Settings" of the Lambda function's "Configuration" tab in order
to see more details of the error
13. If you pass an integer instead of a string for the `id` parameter of `getAppAuthClient()`, you wil get `"Please check the 'sub' claim."`

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