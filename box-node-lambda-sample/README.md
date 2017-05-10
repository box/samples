# box-node-lambda-sample

This sample demonstrates how to call Box APIs from a Lambda function using the [Box Node SDK](https://github.com/box/box-node-sdk).

#### Step 1. Create a Box application
1. Log into the [Box Developer Console](https://developers.box.com) in your Box developer account
2. Select "Create New App"
    * Select "Custom App" and press "Next"
    * Select "OAuth 2.0 with JWT (Server Authentication)" and press "Next"
    * Name the application "Box Node Lambda Sample - YOUR NAME"
        * *Application names must be unique across Box*
    * Press "Create App" and then "View Your App"
3. Press "Generate a Public/Private Keypair"
    * *You may need to enter a 2-factor confirmation code*
    * Save the JSON config file, which contains your application's secret key

#### Step 2. Authorize the application into your Box account
1. Log into your Box developer account as an admin and go to the [Apps Tab](https://app.box.com/master/settings/openbox) of Enterprise Settings
    * *Applications that use Server Authentication must be authorized by the admin of the enterprise*
2. Under "Custom Applications", press "Authorize New App"
3. Enter your "Client ID" from the developer console in the "API Key" field
4. Your application is now authorized to access your Box account!

#### Step 3. Create the AWS Lambda function
1. Log into the [AWS Management Console](https://aws.amazon.com/console) and go to the Lambda Management Console
2. Press "Create a Lambda function"
    * Search for "box" and choose the "box-node-lambda-sample" blueprint
    * *There is no need to configure a trigger for the Lambda function*
    * Press "Next"
3. Configure the lambda function
    * Name = "box-node-lambda-sample"
    * Environment variables:
        * Paste the contents of your JSON config file into the `BOX_CONFIG` environment variable.
            * *Storing the application config in an environment variable makes it easier to secure and manage*
    * Role = "Create new role from template"
    * Role Name = "box-node-lambda-sample-role"
    * Policy Templates = Leave blank
    * Leave all of the advanced settings with default values
    * Press "Next"
    * Review the information and press "Create function"
    
#### Step 4. Test the Lambda function
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

#### About the sample code
* This first section initializes the Lambda function (only run once):
    * First, it creates a `BoxSDK` object, initializing it with your application secrets from the `BOX_CONFIG` environment variable
    * Then, it creates a `BoxClient` object that obtains an access token for the Service Account in your Box enterprise
*  The Lambda's `handler` function will be called each time the Lambda function is invoked:
    * For this sample, the `handler` function simply retrieves info about the Service Account user and returns it as the response
    from the Lambda function

#### Modifying the sample code
You can edit the sample code directly in the inline editor in the Lambda Management Console.

If you need to add files or packages, you will need to rebuild the deployment package for the Lambda function:
1. `cd` into the `box-node-lambda-sample` directory
2. Run `npm install` to install the [Box Node SDK](https://github.com/box/box-node-sdk) 
3. Run `npm run zip` to create `box-node-lambda-sample.zip`
    * The ZIP file includes the sample code in `index.js` plus any modules in `node_modules`
4. Choose "Upload a .ZIP file" in the "Code entry type" drop-down button to load the new deployment package

#### Next steps
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
1. If your `clientID` is wrong, you will get: `"Please check the 'iss' claim."`
2. If your `enterpriseID` is wrong, you will get: `"Please check the 'sub' claim."`
3. If your `clientSecret` is wrong, you will get: `"The client credentials are invalid"`
4. If your `publicKeyID` is wrong, you will get: `"OpenSSL unable to verify data: "`
5. If your `privateKey` is wrong, you will get: `"OpenSSL unable to verify data: error:0906D06C:PEM routines:PEM_read_bio:no start line"`
6. If your `passphrase` is wrong, you will get: `"Error: error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt"`
7. If you pass an integer instead of a string for the `id` parameter of `getAppAuthClient()`, you wil get `"Please check the 'sub' claim."`
8. If you forgot to authorize the app, you wil get: `"This app is not authorized by the enterprise admin"`
9. If you get `"Task timed out after 3.00 seconds"`, you may be getting a network error or Box server error.
Try increasing the "Timeout" value in "Advanced Settings" of the Lambda function's "Configuration" tab to 30 seconds in order
to see more details of the error

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
