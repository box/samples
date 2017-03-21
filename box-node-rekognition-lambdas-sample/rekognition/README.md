# box-node-webhook-to-lambda-sample

This sample shows how to receive DynamoDB stream event that represents the FILE.UPLOADED event from Box.
Each time an event occurs, using the file_id in the event the content of the image file is read from Box.
That content is given as input to the AWS Rekognition service. The Rekognition service will generate labels with confidence percentage. 
The labels and values are stored as metadata of the image file in Box.

This sample gives step-by-step instructions for creating the Lambda function.

#### Create an AWS Lambda function
1. Log into the [AWS Management Console](https://aws.amazon.com/console) and go to the Lambda Management Console
2. Press "Create a Lambda function"
    * Choose the "Blank Function" blueprint
3. Configure a trigger for the Lambda function by clicking in the gray outlined area
    * Choose DynamoDB as trigger
    * Select DynamoDB table 'box_file_uploaded' from dropdown.
    * Batch Size as 1.
    * Starting position as Latest.
    * Check the Enable trigger.
    * Click Next
4. Create the deployment package for the Lambda function
    * Run `npm install` to install the [Box Node SDK](https://github.com/box/box-node-sdk) and [AWS Node SDK](https://github.com/aws/aws-sdk-js) 
    * Run `npm run zip` to create `box-node-rekognition-metadata-sample.zip`
    * The zip file includes the sample code in `index.js`, the Box Node SDK and the AWS Node SDK.
5. Configure the lambda function
    * Name = "box-node-rekognition-metadata-sample"
    * Description = "Demonstrates connecting a Box webhook to an AWS Lambda function"
    * Runtime = "Node.js"
    * Code entry type = "Upload a .ZIP file"
    * Function package = Browse and select `box-node-rekognition-metadata-sample.zip`
    * Environment variables:
    ```
    BOX_AWS_ACCESS_KEY_ID = <AWS_ACCESS_KEY_ID>
    BOX_AWS_SECRET_ACCESS_KEY = <AWS_SECRET_ACCESS_KEY>
    BOX_AWS_REGION = <AWS_REGION>
    BOX_EVENT_TABLE_NAME = box_file_uploaded
    BOX_ENTERPRISE_ID = <YOUR_BOX_ENTERPRISE_ID>
    BOX_CLIENT_ID = <YOUR_APP_CLIENT_ID>
    BOX_CLIENT_SECRET = <YOUR_APP_CLIENT_SECRET>
    BOX_PUBLIC_KEY_ID = <YOUR_APP_PUBLIC_KEY_ID>
    BOX_PRIVATE_KEY_PASSPHRASE = <YOUR_APP_PRIVATE_KEY_PASSPHRASE>
    ```
    * Handler = "index.handler". This sets the entry point to be the handler() function of the `index.js` file
    * Role = "Create new role from template"
    * Role Name = "box-node-rekognition-metadata-sample-role"
    * Policy Templates = Leave blank
    * Leave all of the advanced settings with default values
    * Press Next
6. Press "Create function"

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
