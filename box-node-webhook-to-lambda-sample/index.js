/**
 * This sample shows how to connect a Box webhook to an AWS Lambda function via API Gateway.
 *
 * Each time an event occurs that triggers the webhook on Box, the Lambda function will be called with the details
 * of the event. The messages are secured with a message signature that is validated in the Lambda function.
 *
 * The sample Box test event is signed with the keys 'SamplePrimaryKey' and 'SampleSecondaryKey'.
 * To process events from your Box application, replace these keys with your keys (from the Box developer console),
 * configure the API Gateway to have 'Open' security and create a Box webhook that specifies your API Gateway URL
 * (from the Triggers tab).
 *
 * For step-by-step instructions, see box-node-webhook-to-lambda-sample in https://github.com/box/samples
 */

'use strict';

const BoxSDK = require('box-node-sdk');

// Load the application secrets from environment variables for security and configuration management
const primarySignatureKey = process.env.BOX_WEBHOOK_PRIMARY_SIGNATURE_KEY;
const secondarySignatureKey = process.env.BOX_WEBHOOK_SECONDARY_SIGNATURE_KEY;

/**
 *  YOUR CODE GOES HERE!!!
 *
 *  This sample function simply logs details of the webhook event to Cloudwatch.
 *  Your code could forward the event to SNS or Kinesis for further processing.
 *  For FILE.UPLOADED events, you could use the Box Node SDK to download the file, analyze it, and update the
 *  file on Box with metadata that contains the results of the analysis.
 */
function handleWebhookEvent(webhookEvent) {
    // Print basic information about the Box event
    let message = `webhook=${webhookEvent.webhook.id}`;

    // The event trigger: FILE.DOWNLOADED, FILE.UPLOADED, etc.
    message += `, trigger=${webhookEvent.trigger}`;

    // The source that triggered the event: a file, folder, etc.
    if (webhookEvent.source) {
        const source = webhookEvent.source;

        message += `, source=<${source.type} id=${source.id} name=${source.name || 'unknown'}>`;
    }

    console.log(`Box event: ${message}`);
    return { statusCode: 200, body: message };
}

/**
 * The event handler validates the message using the signing keys to ensure that the message was sent from
 * your Box application.
 */
exports.handler = (event, context, callback) => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);

    if (!BoxSDK.validateWebhookMessage(event.body, event.headers, primarySignatureKey, secondarySignatureKey)) {
        const response = { statusCode: 403, body: 'Message authenticity not verified' };
        console.log(`Response: ${JSON.stringify(response, null, 2)}`);
        callback(null, response);
        return;
    }

    if (!event.body) {
        const response = { statusCode: 403, body: 'Missing event body' };
        console.log(`Response: ${JSON.stringify(response, null, 2)}`);
        callback(null, response);
        return;
    }

    // Parse the message body from the Lambda proxy
    const body = JSON.parse(event.body);
    console.log(`Event body: ${JSON.stringify(body, null, 2)}`);

    // Handle the webhook event
    const response = handleWebhookEvent(body);

    console.log(`Response: ${JSON.stringify(response, null, 2)}`);
    callback(null, response);
};


let foo = {
    "type": "error",
    "status": 409,
    "code": "conflict",
    "context_info": {
        "errors": [
            {
                "reason": "invalid_parameter",
                "name": "existWebhookId",
                "message": "Webhook:1306319 already exists on the specified target."
            }]
    }
    ,
    "help_url": "http:\/\/developers.box.com\/docs\/#errors",
    "message": "Bad Request",
    "request_id": "87176267658a2217692375"
}
