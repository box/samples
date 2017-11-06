# box-node-webhook-to-lambda-sample

This sample shows how to create a Box App User based on the user id from Cognito.

When the user logs in to Cognito for the first time, a corresponding App User is created in Box and the user's Cognito ID is used in the Box App User's `external_app_user_id` field. The `external_app_user_id` field is enforced to be unique within a Box Enterprise and the field is used to retrieve the Box App User and generate an access token for that Box App User.

All subsequent user logins to Cognito detects an existing Box App User and performs no action.

This sample gives step-by-step instructions for creating the Lambda function.

#### Step 1. Create IAM role
1. Go to IAM and click "Roles".
2. Click "Create Role" and select "Lambda" under AWS Service.
3. Select AWSLambdaBasicExecutionRole for the Policy.
4. Give the Role name `box-node-cognito-create-appuser-lambda-role` and click "Next Step".
5. Review and click "Create Role".

#### Step 2. Create an AWS Lambda function
1. In your [AWS Management Console](https://aws.amazon.com/console), access the Lambda Management Console.
2. Click "Create a Lambda function".
    * Choose to "Author from scratch".
3. Add the basic information for the Lambda.
    * Name = "box-node-cognito-create-appuser-lambda"
    * Role = "Choose an existing role"
    * Existing role = "box-node-cognito-create-appuser-sample-role"
4. Click "Create function".
5. Create the deployment package for the Lambda function.
    * Run `npm install` locally to install the [Box Node SDK](https://github.com/box/box-node-sdk).
    * Run `npm run zip` locally to create `box-node-cognito-create-appuser-lambda-sample.zip`.
6. Configure the Lambda function.
    * Description = "Creates a Box app user for the given AWS cognito user"
    * Runtime = "Node.js 6.10"
    * Code entry type = "Upload a .ZIP file"
    * Function package = Browse and select `box-node-cognito-create-appuser-lambda-sample.zip`
    * Environment variables:
        * Paste the contents of your JSON config file into the `BOX_CONFIG` environment variable.
            * *Storing the application config in an environment variable makes it easier to secure and manage.*
            * *You can use AWS KMS to encrypt your environment variable.*
    * Handler = Leave as "index.handler". This sets the entry point to be the handler() function of the `index.js` file.
    * Leave all of the advanced settings with default values.
    * Click Save

#### Step 3. Set Cognito Post Authentication Trigger
1. Log into the [AWS Management Console](https://aws.amazon.com/console) and access Cognito.
2. Select "Manage your User Pools" and choose a User Pool.
3. Select "Triggers".
4. In the "Post authentication" section, select the Lambda function "box-node-cognito-create-appuser-lambda-sample".
5. Click "Save changes".

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
