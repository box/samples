# box-node-rekognition-webhook-lambda-sample

This sample shows how to create Box App User tokens using the JWT ID token from Cognito.

#### Step 1. Create IAM role
*Note: You can reuse the `box-node-cognito-create-appuser-lambda-role` if already created since both share the same permissions.*
1. Go to IAM and click "Roles".
2. Click "Create Role" and select "Lambda" under AWS Service.
3. Select AWSLambdaBasicExecutionRole for the Policy.
4. Give the Role name `box-node-cognito-token-exchange-lambda-role` and click "Next Step".
5. Review and click "Create Role".

#### Step 2. Create the AWS Lambda function
1. In your [AWS Management Console](https://aws.amazon.com/console), access the Lambda Management Console.
2. Click "Create a Lambda function".
    * Choose to "Author from scratch".
3. Add the basic information for the Lambda.
    * Name = "box-node-cognito-token-exchange-lambda"
    * Role = "Choose an existing role"
    * Existing role = "box-node-cognito-token-exchange-lambda-role"
    *Note: If reusing `box-node-cognito-create-appuser-lambda-role`, select this role instead.*
4. Click "Create function".
5. Create the deployment package for the Lambda function.
    * Run `npm install` locally to install the [Box Node SDK](https://github.com/box/box-node-sdk).
    * Run `npm run zip` locally to create `box-node-cognito-token-exchange-lambda-sample.zip`.
6. Configure the Lambda function.
    * Description = "Generate Box App User tokens based on a Cognito JWT ID token."
    * Runtime = "Node.js 6.10"
    * Code entry type = "Upload a .ZIP file"
    * Function package = Browse and select `box-node-cognito-token-exchange-lambda-sample.zip`
    * Environment variables:
        * Paste the contents of your JSON config file into the `BOX_CONFIG` environment variable.
            * *Storing the application config in an environment variable makes it easier to secure and manage.*
            * *You can use AWS KMS to encrypt your environment variable.*
    * Handler = Leave as "index.handler". This sets the entry point to be the handler() function of the `index.js` file.
    * Leave all of the advanced settings with default values.
    * Click Save.

#### Step 3. Create API in AWS API Gateway
*Note: There is an optional Swagger definition you can use to automatically generate this API. To use, skip this step and see the optional step below for instructions on using the Swagger definition.*
##### Create the API
1. In the [AWS Management Console](https://aws.amazon.com/console), navigate to the API Gateway console.
2. Click "Create API" and select "New API". 
3. Name the API `box-node-cognito-token-exchange-api` and click "Create API".
##### Create the Endpoint
1. Click "Actions" and select "Create Resource".
2. Name the resource "token" and provide "token" as the path. You can optionally enable CORS if you plan on using this API endpoint from a web browser. Click "Create Resource".
3. Select "/token" and click "Actions" and select "Create Method". Select "GET" and click the checkmark.
4. For "Integration type" choose "Lambda Function", check "Use Lambda Proxy integration", select the region in which you created your Lambda function. Finally, type `box-node-cognito-token-exchange-lambda` in "Lambda function" and click "Save".
##### Create an Authorizer
1. Under `box-node-cognito-token-exchange-api`, click "Authorizers" and click "Create New Authorizer".
2. Name the authorizer `box-cognito-integration-authorizer`.
3. Select "Cognito" for "Type".
4. Enter `box-cognito-integration` for "Cognito User Pool".
5. Enter `Authorization` for "Token Source".
6. Click "Save".
##### Apply Authorizer on GET Method
1. Under `box-node-cognito-token-exchange-api`, click "Resources" and click "GET" under "/token".
2. Click "Method Request" and click the pencil icon next to "Authorization". 
3. Select "Cognito user pool authorizers > box-cognito-integration-authorizer" and click the checkmark. 

#### Optional Step: Use `swagger.yaml` to Generate the API in AWS API Gateway
1. You'll first need to create a custom role with the following policy and trust relationship:
    * Policy:
    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "lambda:InvokeFunction",
                    "iam:PassRole"
                ],
                "Resource": "*"
            }
        ]
    }
    ```
    * Trust Relationship:
    ```json
    {
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {
                "Service": "apigateway.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }]
    }
    ```
2. The easiest way to create this custom role is with the [AWS CLI](https://aws.amazon.com/cli/). See the [AWS documentation](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html) on how to install and configure the CLI. Once installed and configured, use the following commands to create the custom role:
```sh
aws iam create-policy --policy-name box-node-cognito-token-exchange-api-policy  --policy-document '{"Version": "2012-10-17","Statement": [{"Effect": "Allow","Action": ["lambda:InvokeFunction","iam:PassRole"],"Resource": "*"}]}'

aws iam create-role --role-name box-node-cognito-token-exchange-api-role --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{"Effect": "Allow","Principal": {"Service": "apigateway.amazonaws.com"},"Action": "sts:AssumeRole"}]}'

# Note: Before running this command, replace <account_id> with your AWS account ID.
aws iam attach-role-policy --role-name box-node-cognito-token-exchange-api-role --policy-arn arn:aws:iam::<account_id>:policy/box-node-cognito-token-exchange-api-policy
```
3. In the [AWS Management Console](https://aws.amazon.com/console), navigate to the API Gateway console.
4. Click "Create API" and select "Import from Swagger". 
5. Copy and paste the `swagger.yaml` file from the [box-node-cognito-sample repo](https://github.com/box/samples/blob/master/box-node-cognito-lambdas-sample/swagger.yaml).

*Note: You'll need to change the following values in `swagger.yaml`*
```yaml
...
x-amazon-apigateway-integration:
    credentials: arn:aws:iam::{account_id}:role/box-node-cognito-token-exchange-api-role
    responses:
        default:
        statusCode: "200"
    uri: arn:aws:apigateway:{region}:lambda:path/2015-03-31/functions/arn:aws:lambda:{region}:{account_id}:function:box-node-cognito-token-exchange-lambda/invocations
    passthroughBehavior: "when_no_match"
    httpMethod: "POST"
    contentHandling: "CONVERT_TO_TEXT"
    type: "aws_proxy"
...
```
* `arn:aws:iam::{account_id}:role/box-node-cognito-token-exchange-api-role`
    * Replace {account_id} 
*  `arn:aws:apigateway:{region}:lambda:path/2015-03-31/functions/arn:aws:lambda:{region}:{account_id}:function:box-node-cognito-token-exchange-lambda/invocations`
    * Replace {account_id} and {region}
```yaml
...
securityDefinitions: 
  box-cognito-integration-authorizer: 
    type: apiKey
    name: Authorization
    in: header
    x-amazon-apigateway-authtype: cognito_user_pools
    x-amazon-apigateway-authorizer:
      type: cognito_user_pools
      providerARNs:
        - arn:aws:cognito-idp:{region}:{account_id}:userpool/{user_pool_id}
...
```
* arn:aws:cognito-idp:{region}:{account_id}:userpool/{user_pool_id}
    * Replace {region}, {account_id}, and {user_pool_id}


#### Step 4. Delpoy the API Gateway
1. In the [AWS Management Console](https://aws.amazon.com/console), navigate to the API Gateway console.
2. Under `box-node-cognito-token-exchange-api`, click "Resources".
3. Click "Actions" and select "Deploy API".
4. Choose "New Stage" and enter "prod" as the "Stage name". Click "Deploy".
5. Click "Stages" and expand the "prod" API. Select "GET" under "/token". To test the API, copy the "Invoke URL" listed.
    * The URL will look like `https://<api_gateway_id>.execute-api.<region>.amazonaws.com/prod/token`. 

#### Step 5. Register an App to Access the Cognito User Pool
1. In your [AWS Management Console](https://aws.amazon.com/console), access Cognito.
2. Click "Manage your User Pools" and select the pool you created named `box-cognito-integration`.
3. Click "App Clients" and then "Add an app client".
4. Provide a name for the app client and choose other configuration details based on the application needs.
5. Click "Create app client". 
6. You'll use the app client to handle login with Cognito.

#### Step 6. Create a User
1. In your [AWS Management Console](https://aws.amazon.com/console), access Cognito.
2. Click "Manage your User Pools" and select the pool you created named `box-cognito-integration`.
3. Click "Users and groups" and then "Create user".
4. Complete the user details form and click "Create user".
5. If the user was created successfully, the status of the user should be "Enabled".

#### Step 7. Generate an ID Token and Test the API with curl
1. Generate a Cognito ID token with a user you've created in the `box-cognito-integration` Cognito User Pool. To generate a Cognito ID token, AWS offers several samples for web and mobile client logins with Cognito. You can also try the [Box sample for Angular](https://github.com/box/samples/tree/master/box-aws-cognito-angular2-skeleton-app-sample).
2. You can use the following `curl` example to test the endpoint when you've generated a Cognito ID token:
```bash
curl -X GET \
https://<api_gateway_id>.execute-api.<region>.amazonaws.com/prod/token \
-H 'Authorization: <cognito_id_token>' 
```
3. The Box token is sent as a successful response.

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
