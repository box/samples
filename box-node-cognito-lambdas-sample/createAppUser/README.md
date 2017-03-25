# box-node-webhook-to-lambda-sample

This sample shows how to create an app user in Box based on the user id from Cognito.
When the user first time logs in to Cognito, a corresponding app user is created in Box.
Once the user is created in Box, the custom attribute box_appuser_id is created in the Cognito user object.
The subsequent login from Box will detect the box_appuser_id in the Cognito user object and does nothing.

This sample gives step-by-step instructions for creating the Lambda function.

#### Step 1. Create IAM role
1. Go to IAM
2. Press "Create New Role"
3. Give Role Name "box-node-cognito-create-appuser-sample-role". Click "Next Step"
4. Select "AWS Lambda".
5. Select Policies
    * AWSLambdaFullAccess
    * CloudWatchLogsFullAccess
    * AmazonCognitoPowerUser
6. Review and press "Create Role".

#### Step 2. Create an AWS Lambda function
1. Log into the [AWS Management Console](https://aws.amazon.com/console) and go to the Lambda Management Console
2. Press "Create a Lambda function"
    * Choose the "Blank Function" blueprint
3. Create the deployment package for the Lambda function
    * Run `npm install` to install the [Box Node SDK](https://github.com/box/box-node-sdk) and other dependencies.
    * Run `npm run zip` to create `box-node-cognito-create-appuser-lambda-sample.zip`
4. Configure the lambda function
    * Name = "box-node-cognito-create-appuser-lambda-sample"
    * Description = "Creates a Box app user for the given AWS cognito user"
    * Runtime = "Node.js"
    * Code entry type = "Upload a .ZIP file"
    * Function package = Browse and select `box-node-cognito-create-appuser-lambda-sample.zip`
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
    * Role Name = "box-node-cognito-create-appuser-sample-role"
    * Policy Templates = Leave blank
    * Leave all of the advanced settings with default values
    * Press Next
6. Press "Create function"

#### Step 3. Set Cognito Post Authentication trigger
1. Log into the [AWS Management Console](https://aws.amazon.com/console) and go to the Cognito console.
2. Press "Manage you User Pools". Press the user pools you have created. Here the name of the pool is "box-cognito-integration".
3. Press "Triggers".
4. In the "Post authentication" section, select the Lambda function "box-node-cognito-create-appuser-lambda-sample".
5. Press "Save changes".

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
