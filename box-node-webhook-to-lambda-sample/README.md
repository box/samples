# box-node-webhook-to-lambda-sample

This sample shows how to connect a Box webhook to an AWS Lambda function via API Gateway.
Each time an event occurs that triggers the webhook on Box, the Lambda function will be called with the details of the event.
The messages are secured with a message signature that is validated in the Lambda function.

There are several use cases for using Lambda functions with Box:

* **Trigger external systems.**  Send an SMS when certain events occur in Box
* **Extend Box with external processing.**  When an image file is uploaded to Box, use image analysis to extract information and add that as metadata to the file in Box
* **Build analytics.**  Record events that happen in Box in an external analytics system

This sample gives step-by-step instructions to set up an AWS Lambda function and trigger it from a Box webhook.

#### Step 1. Create an AWS Lambda function
1. Log into the [AWS Management Console](https://aws.amazon.com/console) and go to the Lambda Management Console
2. Press "Create a Lambda function"
    * Choose the "Blank Function" blueprint
3. Configure a trigger for the Lambda function by clicking in the gray outlined area
    * Choose API Gateway
    * Leave the API name and Deployment stage with default values
    * Choose "Open" for Security.  This enables the Box webhook to call the API externally
    * Press Next
4. Create the deployment package for the Lambda function
    * Run `npm install` to install the [Box Node SDK](https://github.com/box/box-node-sdk) 
    * Run `npm run zip` to create `box-node-webhook-to-lambda-sample.zip`
    * The zip file includes the sample code in `index.js` plus the Box Node SDK
5. Configure the lambda function
    * Name = "box-node-webhook-to-lambda-sample"
    * Description = "Demonstrates connecting a Box webhook to an AWS Lambda function"
    * Runtime = "Node.js"
    * Code entry type = "Upload a .ZIP file"
    * Function package = Browse and select `box-node-webhook-to-lambda-sample.zip`
    * Environment variables:
    ```
    BOX_WEBHOOK_PRIMARY_SIGNATURE_KEY = SamplePrimaryKey
    BOX_WEBHOOK_SECONDARY_SIGNATURE_KEY = SampleSecondaryKey
    ```
    * Handler = "index.handler". This sets the entry point to be the handler() function of the `index.js` file
    * Role = "Create new role from template"
    * Role Name = "box-node-webhook-to-lambda-sample-role"
    * Policy Templates = Leave blank
    * Leave all of the advanced settings with default values
    * Press Next
6. Press "Create function"

#### Step 2. Test the Lambda function in the Lambda Console
1. Press the "Test" button and copy and paste the test data below (also in the file `lambda-test.json`):

    ```JSON
    {
      "headers": {
        "box-delivery-id": "f96bb54b-ee16-4fc5-aa65-8c2d9e5b546f",
        "box-delivery-timestamp": "2020-01-01T00:00:00-07:00",
        "box-signature-algorithm": "HmacSHA256",
        "box-signature-primary": "6TfeAW3A1PASkgboxxA5yqHNKOwFyMWuEXny/FPD5hI=",
        "box-signature-secondary": "v+1CD1Jdo3muIcbpv5lxxgPglOqMfsNHPV899xWYydo=",
        "box-signature-version": "1"
      },
      "body": "{\"type\":\"webhook_event\",\"webhook\":{\"id\":\"1234567890\"},\"trigger\":\"FILE.UPLOADED\",\"source\":{\"id\":\"1234567890\",\"type\":\"file\",\"name\":\"Test.txt\"}}"
    }
    ```
    
    This sample message has been signed with the keys `SamplePrimaryKey` and `SampleSecondaryKey`.
    
    *Note that the API Gateway will pass the incoming HTTP request headers and body to the Lambda function as a JSON object.
    See the [API Gateway documentation](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html#api-gateway-simple-proxy-for-lambda-input-format) for more information on the input and output formats for the Lambda Proxy Integration.*
2. The result should be the following JSON response:

    ```JSON
    {
      "statusCode": 200,
      "body": "webhook=1234567890, trigger=FILE.UPLOADED, source=<file id=1234567890 name=Test.txt>"
    }
    ```

3. Your Lambda function is working properly!

#### Step 3. Test the API Gateway API endpoint using curl
1. Find the URL for your API Gateway on the "Triggers" tab.  It should look like:

    ```
    https://xxxxxxxxxx.execute-api.us-west-2.amazonaws.com/prod/box-node-webhook-to-lambda-sample
    ```

2. Run the following `curl` command:

    ```
    curl <YOUR_GATEWAY_API_URL> -d @curl-test.json \
    -H "box-delivery-id: f96bb54b-ee16-4fc5-aa65-8c2d9e5b546f" \
    -H "box-delivery-timestamp: 2020-01-01T00:00:00-07:00" \
    -H "box-signature-algorithm: HmacSHA256" \
    -H "box-signature-primary: 6TfeAW3A1PASkgboxxA5yqHNKOwFyMWuEXny/FPD5hI=" \
    -H "box-signature-secondary: v+1CD1Jdo3muIcbpv5lxxgPglOqMfsNHPV899xWYydo=" \
    -H "box-signature-version: 1"; echo
    ```

3. The file `curl-test.json` contains the following test data:

    ```JSON
    {"type":"webhook_event","webhook":{"id":"1234567890"},"trigger":"FILE.UPLOADED","source":{"id":"1234567890","type":"file","name":"Test.txt"}}
    ```

4. This should return the following response message from the Lambda function:

    ```
    webhook=1234567890, trigger=FILE.UPLOADED, source=<file id=1234567890 name="Test.txt">
    ```

    *If you have trouble, try using `curl -v` to see the HTTP response code*
5. Your public API endpoint is working properly!

#### Step 4. Create a Box application and get a developer token
1. Log into the [Box Developer Console](https://developers.box.com)
    * Switch to the open beta of the new Developer Console, if needed
2. Select "Create New App"
    * Select "Enterprise Integration" and press "Next"
    * Select "Server Authentication" and press "Next"
    * Name the application "Box Webhook to Lambda Sample - YOUR NAME"
        * *Application names must be unique across Box*
    * Press "Create App" and then "View Your App"
    * Check "Manage webhooks" and press "Save Changes"
        * This enables the application to create and use webhooks
    * In the left navbar, switch to the "Webhooks" section
        * Press "Generate Key" for both the "Primary Key" and "Secondary Key" to create keys for signing the events
        * These are the keys that Box will use to sign events sent by your application's webhooks
        * The events are signed using two separate keys to make it easier to [rotate your signing keys](https://docs.box.com/reference#section-rotating-signatures)
    * Return to the "Configuration" section and get your "Developer Token"
        * *The token is valid for an hour, but you can get another one if it expires*

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

#### Step 6. Update the Lambda function with your app's signing keys
1. In the Code tab of the Lambda Management Console, update the environment variables to the primary and secondary signing keys from the Box Developer Console
    * *Storing the application secrets in environment variables makes them easier to secure and manage*
    ```
    BOX_WEBHOOK_PRIMARY_SIGNATURE_KEY = <YOUR_PRIMARY_KEY>
    BOX_WEBHOOK_SECONDARY_SIGNATURE_KEY = <YOUR_SECONDARY_KEY>
    ```

2. Press "Save and Test"
3. You should get an error response, because the sample test data is not signed with the keys you just added to the Lambda function

    ```JSON
    {
      "statusCode": 403,
      "body": "Message authenticity not verified"
    }
    ```

4. Publish the new version of your lambda function by selecting "Publish new version" in the "Actions" menu

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
5. Note that if your developer token expires, the webhook will no longer send events with a full payload.  In that case, the event trigger will be `NO_ACTIVE_SESSION`

    ```JSON
    {
        "statusCode": 200,
        "body": "webhook=386135, trigger=NO_ACTIVE_SESSION, source=<file id=99174057812 name=\"unknown\">"
    }
    ```

6. To get the webhook to send the full payload again, generate a new developer token in the Box Developer Console
    * *Note that you don't need to recreate the webhook with the new developer token -- there just needs to be a non-expired token associated with the user that created the webhook*

#### Next Steps
Now that you are successfully calling your AWS Lambda function from a Box webhook, here are some things you can try next:

1. Use the AWS "encryption helpers" to encrypt the environment variables that hold the application secrets
    * Modify the sample code to decrypt the secrets
2. Modify the sample Lambda function to call an external service with the event data
3. Have the Lambda function download additional information from Box in response to the event (such as the contents of a newly uploaded file)
    * See the documentation for the [Box Node SDK](https://github.com/box/box-node-sdk) for how to call Box APIs 
4. [Rotate your app's signing keys](https://docs.box.com/reference#section-rotating-signatures)
    * Generate a new primary key on Box
        * Messages will continue to be validated using the secondary key
    * Update you Lambda function with the new primary key
    * Wait long enough for all in-flight messages to have been processed by the Lambda function
    * Repeat the process, this time rotating the secondary key

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

    ```
    curl https://api.box.com/2.0/webhooks/<WEBHOOK_ID> -H "Authorization: Bearer <DEVELOPER_TOKEN>"
    ```

3. To delete the webhook when you are done, use:

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
