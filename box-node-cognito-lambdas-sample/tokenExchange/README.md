# box-node-rekognition-webhook-lambda-sample

This sample shows how to create Box app user token using the JWT access token created from Cognito.

This sample gives step-by-step instructions to set up this AWS Lambda function and trigger it from a Box webhook.

Note: For detailed information on setting up Box webhook with Lambda function, see [box-node-webhook-to-lambda-sample](https://github.com/box/samples/tree/rekognition_integration/box-node-webhook-to-lambda-sample)

#### Step 1. Create API in Amazon API Gateway
1. Log into the [AWS Management Console](https://aws.amazon.com/console) and go to the API Gateway console.
2. Press "Create API".
3. Click "New API". 
4. Give API name as "box-node-cognito-token-exchange" and fill description.
5. Press "Create API".

#### Step 2. Create IAM role
1. Go to IAM
2. Press "Create New Role"
3. Give Role Name "box-node-cognito-token-exchange-sample-role". Click "Next Step"
4. Select "AWS Lambda".
5. Select Policies
    * AWSLambdaFullAccess
    * CloudWatchLogsFullAccess
    * AmazonCognitoPowerUser
6. Review and press "Create Role".

#### Step 3. Create the AWS Lambda function
1. Log into the [AWS Management Console](https://aws.amazon.com/console) and go to the Lambda Management Console
2. Press "Create a Lambda function"
    * Choose the "Blank Function" blueprint
3. Configure a trigger for the Lambda function by clicking in the gray outlined area
    * Choose API Gateway created in Step 1.
    * Leave the API name and Deployment stage with default values
    * Choose "Open" for Security.  This enables the Box webhook to call the API externally
    * Press Next
4. Create the deployment package for the Lambda function
    * Run `npm install` to install the [Box Node SDK](https://github.com/box/box-node-sdk) and other depdencies.
    * Run `npm run zip` to create `box-node-cognito-token-exchange-lambda-sample.zip`
5. Configure the lambda function
    * Name = "box-node-cognito-token-exchange-lambda-sample"
    * Description = "Generate the Box app user token"
    * Runtime = "Node.js"
    * Code entry type = "Upload a .ZIP file"
    * Function package = Browse and select `box-node-cognito-token-exchange-lambda-sample.zip`
    * Environment variables:
    ```
    BOX_ENTERPRISE_ID = <YOUR_BOX_ENTERPRISE_ID>
    BOX_CLIENT_ID = <YOUR_APP_CLIENT_ID>
    BOX_CLIENT_SECRET = <YOUR_APP_CLIENT_SECRET>
    COGNITO_USER_POOL_ID = <YOUR_COGNITO_USER_POOL_ID>
    COGNITO_USER_ATTRIBUTE_BOX_APPUSER_ID_KEY = custom:box_appuser_id
    BOX_PUBLIC_KEY_ID = <YOUR_APP_PUBLIC_KEY_ID>
    BOX_PRIVATE_KEY_PASSPHRASE = <YOUR_APP_PRIVATE_KEY_PASSPHRASE>
    ```
    * Handler = "index.handler". This sets the entry point to be the handler() function of the `index.js` file
    * Role = "Create new role from template"
    * Role Name = "box-node-cognito-token-exchange-sample-role"
    * Policy Templates = Leave blank
    * Leave all of the advanced settings with default values.
    * Press Next
6. Press "Create function"

#### Step 4. Test the API Gateway API endpoint using curl
Find the URL for your API Gateway on the "Triggers" tab.  It look similar to:

    ```
    https://xxxxxxxxxx.execute-api.us-west-2.amazonaws.com/prod/box-node-cognito-token-exchange
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
