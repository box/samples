# box-node-webhook-to-lambda-sample

This sample shows how to connect a Box webhook to an AWS Lambda function.
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
    * Choose "Open" for Security.  This enables the Box webhook to call the API
    * Press Next
4. Configure the lambda function
    * Name = "box-node-webhook-to-lambda-sample"
    * Description = "Box webhook to Lambda sample"
    * Runtime = "Node.js"
    * Code = Copy and paste the code from the `index.js` sample file
    * Handler = "index.handler". This sets the entry point to be the handler() function of the `index.js` file
    * Role = "Create new role from template"
    * Role Name = "box-node-webhook-to-lambda-sample-role"
    * Policy Templates = Leave blank
    * Leave all of the advanced settings with default values
    * Press Next
5. Press "Create function"

#### Step 2. Test the Lambda function in the Lambda Console
1. Press the "Test" button and copy and paste the test data from the file `lambda-test.json`:

    ```JSON
    {
      "headers": {
        "box-delivery-id": "f96bb54b-ee16-4fc5-aa65-8c2d9e5b546f",
        "box-delivery-timestamp": "2020-01-01T00:00:00-07:00",
        "box-signature-algorithm": "HmacSHA256",
        "box-signature-primary": "TyBzWaDyIljLM2tbo2kUKBaK7qgjLdYx3DbrPT2opFo=",
        "box-signature-secondary": "d6TBtg+/f96Pek2hkcOKzHlTz3KjSZAH4liQbudauB8=",
        "box-signature-version": "1"
      },
      "body": "{\"type\":\"webhook_event\",\"webhook\":{\"id\":\"1234567890\"},\"trigger\":\"FILE.UPLOADED\",\"source\":{\"id\":\"1234567890\",\"type\":\"file\",\"name\":\"Test.txt\"}}"
    }
    ```
    
    *Note that the API Gateway will pass the incoming HTTP request headers and body to the Lambda function a JSON object.
    See the [API Gateway documentation](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html#api-gateway-simple-proxy-for-lambda-input-format) for more information on the input and output formats for the Lambda Proxy Integration.*
2. The result should be the following JSON object:

    ```JSON
    {
      "statusCode": 200,
      "body": "webhook=1234567890, trigger=FILE.UPLOADED, source=<file id=1234567890 name=\"Test.txt\">"
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
    -H "box-signature-primary: TyBzWaDyIljLM2tbo2kUKBaK7qgjLdYx3DbrPT2opFo=" \
    -H "box-signature-secondary: d6TBtg+/f96Pek2hkcOKzHlTz3KjSZAH4liQbudauB8=" \
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
2. Select "Create a Box application"
    * Name the application "Box Webhook to Lambda Sample"
    * Set the redirect_uri to "https://box.com"
        * *This isn't needed for this sample app, but it is a required field*
    * Check "Manage webhooks v2"
        * This enables the application to create and use V2 webhooks
    * Press "Generate primary key" and "Generate secondary key" to create keys for signing the events
        * These are the keys that Box will use to sign events sent by webhooks created by this application
        * The events are signed using two separate keys to make it easier to [rotate your signing keys](https://docs.box.com/reference#section-rotating-signatures)
    * Press Save Application
3. Press "Create a developer token"
    * *Be sure to save the application before generating a developer token*

#### Step 5. Create a Box webhook to call the lambda function
Note: See [Getting Started with Webhooks V2](https://docs.box.com/v2.0/docs/getting-started-with-webhooks-v2) and [Overview of Webhooks V2](https://docs.box.com/reference#webhooks-v2) for more info.

1. Create a folder on Box and record the folder ID
    * See these [instructions](https://docs.box.com/v2.0/docs/getting-started-with-webhooks-v2#section-3-create-a-webhook) for how to find the folder ID 
2. Create a webhook using curl to call the [Box webhook API](https://docs.box.com/reference#create-webhook):

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

4. The webhook will call the Lambda function each time a file is uploaded to the folder
    * *See [here](https://docs.box.com/reference#section-retries) for details on how Box handles timeouts, retries, and exponential backoff*

#### Step 6. Update the Lambda function with your app's signing keys
1. In the Lambda Management Console, edit the code to include the primary and secondary signing keys from the Box Developer Console

    ```javascript
    const primarySignatureKey = '<YOUR_PRIMARY_SIGNATURE_KEY>';
    const secondarySignatureKey = '<YOUR_SECONDARY_SIGNATURE_KEY>';
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
    * *Note that you don't need to recreate the webhook with the new developer token -- there just needs to be a non-expired token associated with the app that created the webhook*

#### Profit! ...and Next Steps
Now that you are successfully calling your AWS Lambda function from a Box webhook, here are some things you can try next:

1. Modify the sample Lambda function to call an external service with the event data
2. Have the Lambda function download additional information from Box in response to the event (such as the contents of a newly uploaded file)
3. Try [rotating your app's signing keys](https://docs.box.com/reference#section-rotating-signatures)
    * Generate a new primary key on Box
        * Messages will continue to be validated using the secondary key
    * Update you Lambda function with the new primary key
    * Wait long enough for all in-flight messages to have been processed by the Lambda function
    * Repeat the process, this time rotating the secondary key

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
