/**
 * This sample shows how to connect a Box webhook to a Lambda function via API Gateway.
 *
 * For step-by-step instructions on how to create a Box application and a webhook,
 * see https://github.com/box/samples/tree/master/box-node-webhook-to-lambda-sample
 */

'use strict';

const BoxSDK = require('box-node-sdk');

// Load the config from an environment variable for security and configuration management.
const boxConfig = JSON.parse(process.env.BOX_CONFIG);

BoxSDK.getPreconfiguredInstance(boxConfig);

/**
 *  YOUR CODE GOES HERE!!!
 *
 *  This sample function simply logs details of the webhook event to Cloudwatch.
 *  Your code could forward the event to SNS or Kinesis for further processing.
 *  For FILE.UPLOADED events, you could use the Box Node SDK to download the file, analyze it,
 *  and update the file on Box with metadata that contains the results of the analysis.
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
 * The event handler validates the message using the signing keys to ensure that the message
 * was sent from your Box application before calling handleWebhookEvent().
 */
exports.handler = (event, context, callback) => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);

    if (!BoxSDK.validateWebhookMessage(event.body, event.headers)) {
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
