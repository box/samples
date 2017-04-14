# box-node-rekognition-lambdas-sample

This sample shows how to integrate AWS Rekognition with Box for image analysis.
Each time a image file is uploaded under a tree folder or it's sub folders, Box can be configured to generate the webhook event FILE.UPLOADED with the image file details. A AWS Lambda function that can receives the webhooks and stores the event in DyanmoDB. Another Lambda function receives the DynamoDB event that conatains the file id. It retrieves the content of the file from Box using the file id in the event. The image content is processed by AWS Rekognition service. The output labels from Rekognition service are created as metadata of the image file in Box.

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
    * Name the application "Box Node Lambda Sample - YOUR NAME"
        * *Application names must be unique across Box*
    * Press "Create App" and then "View Your App"
    * Select "Application Access" as "Enterprise".
    * Check the Application scopes "Manage users", "Manage webhooks", "Manage enterprise properties",
    * Enable both Advanced Features "Perform Actions as Users" and "Generate User Access Tokens".
    * Press "Save Changes"
        * *You'll need your "Client ID" and "Client Secret" later*

#### Step 2. Generate your private and public keys
1. Generate a private key and a public key to use with Server Authentication
    * In the `box-node-rekognition-lambdas-sample/rekognition` directory, run the following commands:
    ```
    openssl genrsa -aes256 -out private_key.pem 2048
    openssl rsa -pubout -in private_key.pem -out public_key.pem
    ```
    You'll need the passphrase for your private key later
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
    * Applications that use Server Authentication must be authorized by the admin of the account*
2. Under the gear icon, go to Enterprise Settings (or Business Settings, depending on your account type)
    * You'll need the "Enterprise ID" of your account later
3. Go to the Apps tab
3. Under "Custom Applications", press "Authorize New App"
4. Enter your "Client ID" from the developer console in the "API Key" field
    * Your application is now authorized to access your Box account

#### Step 4. Create a Lambda function to handle Box webhook FILE.UPLOADED events.
See [Webhook Lambda function](https://github.com/box/samples/tree/rekognition_integration/box-node-rekognition-lambdas-sample/webhook) for more info.

#### Step 5. Create a Lambda function that uses Rekognition service and updates the metadata of the image file in Box.
See [Rekognition Lambda function](https://github.com/box/samples/tree/rekognition_integration/box-node-rekognition-lambdas-sample/rekognition) for more info.

#### Step 6. Test
1. Login to box.com
2. Upload a image file in to the folder in which the webhook is enabled.
3. The webhook Lambda function should receive the event and store the event in DynamoDB. 
    * A new Item with the file name is created in 'box_file_uploaded' table.
    * If any errors, logs will provides more details.
4. The Rekognition Lambda function is triggered if the Item is added to the 'box_file_uploaded' table.
5. Once the Lambda function is successful, the image file in Box is updated with the meta data.
    * Click the image file to preview the file.
    * Click 'Info'. The 'CUSTOM METADATA' section is updated with the labels identified and their corresponding confidence level percentage.
    

#### Next Steps
Now that you are successfully integrated AWS Rekognition with Box to process the image files. You could also try other options for the integration.

1. Use the AWS SQS service instead of DynamoDD in the integration. The Rekognition Lambda function need to poll SQS queue to receive the events.
2.  Use the AWS "encryption helpers" to encrypt the environment variables that hold the application secrets
    * Modify the sample code to decrypt the secrets
2. [Rotate your app's signing keys](https://docs.box.com/reference#section-rotating-signatures)
    * Generate a new primary key on Box
        * *Messages will continue to be validated using the secondary key*
    * Update you Lambda function with the new primary key
    * Wait long enough for all in-flight messages to have been processed by the Lambda function
    * Repeat the process, this time rotating the secondary key

#### Troubleshooting
1. If the image file is not updated, the Lambda function logs can be analysed to find out the issue.
    * Go to "Monitoring" tab in the Lambda function.
    * Click "View logs in CloudWatch" link
    * Click the latest (or the best matches you execution time) log stream from the list of Log Streams. The errors will be displayed if any.

2. The DynamoDB trigger function failure. If there is a failure, the DyanmoDB event may contain the old image file that is sent multiple times. In that case, analyse the failure.


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
