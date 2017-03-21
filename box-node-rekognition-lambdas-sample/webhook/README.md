# box-node-rekognition-webhook-lambda-sample

This sample shows how to connect a Box webhook to an AWS Lambda function via API Gateway.
Each time a image file uploaded in the designated folder, an event occurs that triggers the webhook on Box. The Lambda function will be called with the details of the event.
The messages are secured with a message signature that is validated in the Lambda function.


This sample gives step-by-step instructions to set up this AWS Lambda function and trigger it from a Box webhook.

Note: For detailed information on setting up Box webhook with Lambda function, see [box-node-webhook-to-lambda-sample](https://github.com/box/samples/tree/rekognition_integration/box-node-webhook-to-lambda-sample)

#### Step 1. Create API in Amazon API Gateway
1. Log into the [AWS Management Console](https://aws.amazon.com/console) and go to the API Gateway console.
2. Press "Create API".
3. Click "New API". 
4. Give API name as "box-node-rekognition-lambdas-sample" and fill description.
5. Press "Create API".

#### Step 2. Create DynamoDB table
1. Go to DynamoDB console.
2. Press "Create table".
3. Give Table name as "box_file_uploaded".
4. Give Primary key as "file_id". The code expects the exact name.
5. Leave the Table settings as default.
6. Press "Create".

#### Step 3. Create the AWS Lambda function
1. Log into the [AWS Management Console](https://aws.amazon.com/console) and go to the Lambda Management Console
2. Press "Create a Lambda function"
    * Choose the "Blank Function" blueprint
3. Configure a trigger for the Lambda function by clicking in the gray outlined area
    * Choose API Gateway
    * Leave the API name and Deployment stage with default values
    * Choose "Open" for Security.  This enables the Box webhook to call the API externally
    * Press Next
4. Create the deployment package for the Lambda function
    * Run `npm install` to install the [Box Node SDK](https://github.com/box/box-node-sdk) and [AWS Node SDK](https://github.com/aws/aws-sdk-js)
    * Run `npm run zip` to create `box-node-rekognition-webhook-lambda-sample.zip`
    * The zip file includes the sample code in `index.js`, Box Node SDK and AWS Node SDK.
5. Configure the lambda function
    * Name = "box-node-rekognition-webhook-lambda-sample"
    * Description = "Receives the FILE.UPLOADED webhook event and stores the event in DynamoDB"
    * Runtime = "Node.js"
    * Code entry type = "Upload a .ZIP file"
    * Function package = Browse and select `box-node-rekognition-webhook-lambda-sample.zip`
    * Environment variables:
    ```
    BOX_AWS_ACCESS_KEY_ID = <AWS_ACCESS_KEY_ID>
    BOX_AWS_SECRET_ACCESS_KEY = <AWS_SECRET_ACCESS_KEY>
    BOX_AWS_REGION = <AWS_REGION>
    BOX_EVENT_TABLE_NAME = box_file_uploaded
    BOX_WEBHOOK_PRIMARY_SIGNATURE_KEY = <YOUR_WEBHOOK_PRIMARY_KEY>
    BOX_WEBHOOK_SECONDARY_SIGNATURE_KEY = <YOUR_WEBHOOK_SECONDARY_KEY>
    ```
    * Handler = "index.handler". This sets the entry point to be the handler() function of the `index.js` file
    * Role = "Create new role from template"
    * Role Name = "box-node-rekognition-webhook-lambda-sample-role"
    * Policy Templates = Leave blank
    * Leave all of the advanced settings with default values.
    * Press Next
6. Press "Create function"

#### Step 4. Test the API Gateway API endpoint using curl
Find the URL for your API Gateway on the "Triggers" tab.  It look similar to:

    ```
    https://xxxxxxxxxx.execute-api.us-west-2.amazonaws.com/prod/box-node-rekognition-webhook-lambda-sample
    ```

#### Step 5. Create a Box webhook to call the Lambda function
Note: See [Getting Started with Webhooks V2](https://docs.box.com/v2.0/docs/getting-started-with-webhooks-v2) and [Overview of Webhooks V2](https://docs.box.com/reference#webhooks-v2) for more info.

1. Create a folder in your account on Box and record the "Folder ID"
    * See these [instructions](https://docs.box.com/v2.0/docs/getting-started-with-webhooks-v2#section-3-create-a-webhook) for how to find the "Folder ID" 
2. Create a webhook using `curl` to call the [Box webhook API](https://docs.box.com/reference#create-webhook):

    ```
    curl https://api.box.com/2.0/webhooks \
    -H "Authorization: Bearer <DEVELOPER_TOKEN>" \
    -d '{"target": {"id": "<FOLDER_ID>", "type": "folder"}, "address": "<YOUR_GATEWAY_API_URL>", "triggers": ["FILE.UPLOADED"]}'; echo
    ```

    *Note: You must use the API to create V2 webhooks -- there is no Web UI*
3. You should get a response confirming that the webhook has been created:

    ```
    {"id":"<WEBHOOK_ID>","type":"webhook","target":{"id":"<FOLDER_ID>","type":"folder"},"created_by":<YOUR_USER_INFO>,"created_at":"2016-11-10T15:00:10-08:00","address":"<YOUR_GATEWAY_API_URL>","triggers":["FILE.UPLOADED"]}
    ```
    
    * Note down the `<WEBHOOK_ID>` in case you need to modify or delete the webhook

4. The webhook will call the Lambda function each time a file is uploaded to the folder
    * *See [here](https://docs.box.com/reference#section-retries) for details on how Box webhooks handle timeouts, retries, and exponential backoff*

#### Step 7. Test the webhook on Box
1. Upload a file to the Box folder that you specified when creating the webhook
2. In the Lambda Management Console, click on the Monitoring tab and click on "View Logs in Cloudwatch"
3. Click on the most recent log stream (the top one)
4. You should see a new set of events appear in Cloudwatch that include the console logs created by the Lambda function:

    ```JSON
    {
        "statusCode": 200,
        "body": "webhook=386135, trigger=FILE.UPLOADED, source=<file id=99174057812 name=\"Electron 4.png\">"
    }
    ```

    *It may take a few seconds for the events to appear.  Press the "Retry" link or scroll down to see new events*
5. The "box_file_uploaded" DynamoDB table should show a row with the newly created file. The following columns are created.
    * file_id
    * event_id
    * file_etag
    * file_name
    * file_size
    * user_id

#### Troubleshooting
1. Each app can only have one webhook for a given target.  If you try to create a second one you will get an API error:

    ```JSON
    {
        "type": "error",
        "status": 409,
        "code": "conflict",
        "context_info": {
            "errors": [
                {
                    "reason": "invalid_parameter",
                    "name": "existWebhookId",
                    "message": "Webhook:<WEBHOOK_ID> already exists on the specified target."
                }]
        }
        ,
        "help_url": "http:\/\/developers.box.com\/docs\/#errors",
        "message": "Bad Request",
        "request_id": "87176267658a2217692375"
    }
    ```

2. To inspect the webhook, use:

The DEVELOPER_TOKEN can be retrieved from the app created in Box.

    ```
    curl https://api.box.com/2.0/webhooks/<WEBHOOK_ID> -H "Authorization: Bearer <DEVELOPER_TOKEN>"
    ```

3. To delete the webhook when you are done, use:

The DEVELOPER_TOKEN can be retrieved from the app created in Box.

    ```
    curl https://api.box.com/2.0/webhooks/<WEBHOOK_ID> -H "Authorization: Bearer <DEVELOPER_TOKEN>" -X DELETE
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
