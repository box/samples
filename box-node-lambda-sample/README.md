# box-node-lambda-sample

This sample demonstrates how to call Box APIs from an AWS Lambda function using the [Box Node SDK](https://github.com/box/box-node-sdk).

#### Step 1. Create a Box application
1. Log into the [Box Developer Console](https://developers.box.com)
2. Select "Create a Box application"
    * Name the application "Box Node Lambda Sample - YOUR NAME"
        * *Application names must be unique across Box*
    * Set the redirect_uri to "https://example.com"
        * *This isn't needed for this sample app, but it is a required field*
    * Choose Authentication Type: "Server Authentication"
        * *Because this is a server-to-server integration, rather than an end-user application*
    * Press "Save Application" before proceeding

#### Step 2. Generate the private and public keys
1. Generate a private key and a public key
    * In the `box-node-lambda-sample` directory, run the following commands:
    ```
    openssl genrsa -aes256 -out private_key.pem 2048
    openssl rsa -pubout -in private_key.pem -out public_key.pem
    ```
2. Add the public key to the application
    * Press "Add Public Key"
        * You will need to set up 2-factor authentication, if you haven't already
    * Copy the public key: `cat public_key.pem | pbcopy`
    * Paste it into the "Public Key" field
    * Press "Verify" and then "Save"
        * You will need to enter a 2-factor confirmation code
    * Press "Save Application"
3. Your application is ready.
    * Note the "Api Key" for the next step

#### Step 3. Authorize the application in your account
1. In a new tab, log in to your Box account as an admin and go to the Admin Console
    * *Applications that use Server Authentication must be authorized by the admin of the account*
2. Under the gear icon, go to Business Settings (or Enterprise Settings, depending on your account type)
    * Note the "Enterprise ID" of your account
3. Go to the Apps tab
3. Under "Custom Applications", press "Authorize New App"
4. Copy and paste the "API Key" from the developer console
    * Your application is now authorized to access your Box account

#### Step 4. Create the AWS Lambda function
1. Build the deployment package for the Lambda function
    * `cd` into the `box-node-lambda-sample` directory
    * Run `npm install` to install the [Box Node SDK](https://github.com/box/box-node-sdk) 
    * Ensure that the `private_key.pem` file is in the directory 
    * Run `npm run zip` to create `box-node-lambda-sample.zip`
    * The zip file includes the sample code in `index.js`, the private key in `private_key.pem`, plus the Box Node SDK
2. Log into the [AWS Management Console](https://aws.amazon.com/console) and go to the Lambda Management Console
3. Press "Create a Lambda function"
    * Choose the "Blank Function" blueprint
    * There is no need to configure a trigger for the Lambda function
    * Press Next
4. Configure the lambda function
    * Name = "box-node-lambda-sample"
    * Description = "Demonstrates how to call Box APIs from an AWS Lambda function using the Box Node SDK"
    * Runtime = "Node.js 4.3"
    * Code entry type = "Upload a .ZIP file"
    * Function package = Browse and select `box-node-lambda-sample.zip`
    * Environment variables:
        * *Storing the application secrets in environment variables makes them easier to secure and manage*
    ```
    BOX_CLIENT_ID = Your CLIENT_ID
    BOX_CLIENT_SECRET = Your CLIENT_SECRET
    BOX_PUBLIC_KEY_ID = Your PUBLIC_KEY_ID
    BOX_PRIVATE_KEY_PASSPHRASE = Your PRIVATE_KEY_PASSPHRASE
    BOX_ENTERPRISE_ID = Your ENTERPRISE_ID
    ```
    * Handler = "index.handler". This sets the entry point to be the `handler()` function of the `index.js` module
    * Role = "Create new role from template"
    * Role Name = "box-node-lambda-sample-role"
    * Policy Templates = Leave blank
    * Leave all of the advanced settings with default values
    * Press Next
6. Press "Create function"

#### Step 5. Test the Lambda function
1. Press the "Test" button.
    * *This Lambda function does not require any input, so just leave the sample test data*
    * Press "Save and test"
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

3. Your Lambda function is working properly!

#### Next Steps
Now that you are successfully calling Box from your AWS Lambda function, here are some things you can try next:

1. Use the AWS "encryption helpers" to encrypt the environment variables that hold the application secrets
    * Modify the sample code to decrypt the secrets before creating the Box SDK and client objects
    * *Note that the client object is only created once, outside the event handler*
2. Modify the sample Lambda function to make other Box API calls using the [Box Node SDK](https://github.com/box/box-node-sdk)
    * Create and view content in the service account:
    ```Javascript
    client.folders.create(0, 'Test Folder', (err, result) => {...});
    client.folders.getItems(0, null, (err, result) => {...});
    ```
    * Create app users:
        * Add the "Manage app users" scope to the application and re-authorize it in the Admin Console
    ```Javascript
    client.enterprise.addUser(null, 'Test App User', {is_platform_access_only: true}, (err, result) => {...});
    ```
    * Perform actions as an app user:
        * Add the "Generate access tokens for users" scope to the application and re-authorize it in the Admin Console
        * Create a user client that performs actions as a specific app user:
            * *Note that the* `user_id` *must be a string even though the values looks like integers*
    ```Javascript
    const userClient = sdk.getAppAuthClient('user', user_id);
    userClient.folders.create(0, 'App User Folder', (err, result) => {...});
    ```

#### Troubleshooting
1. If your `PRIVATE_KEY_PASSPHRASE` is wrong, you will get: `"Error: error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt"`
2. If your `CLIENT_ID` is wrong, you will get: `"Please check the 'iss' claim."`
3. If your `ENTERPRISE_ID` is wrong, you will get: `"Please check the 'sub' claim."`
4. If your `PUBLIC_KEY_ID` is wrong, you will get: `"OpenSSL unable to verify data: "`
5. If your `private_key.pem` is wrong, you will get: `"OpenSSL unable to verify data: error:0906D06C:PEM routines:PEM_read_bio:no start line"`
6. If your `CLIENT_SECRET` is wrong, you will get: `"The client credentials are invalid"`

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