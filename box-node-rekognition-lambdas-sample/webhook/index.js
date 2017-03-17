'use strict';

var BoxSDK = require('box-node-sdk');
var AWS = require('aws-sdk');

console.log('Access Key id: ' + process.env.BOX_AWS_ACCESS_KEY_ID)
console.log('Access secret: ' + process.env.BOX_AWS_SECRET_ACCESS_KEY)
console.log('AWS Region: ' + process.env.BOX_AWS_REGION)

AWS.config.update({
    'accessKeyId': process.env.BOX_AWS_ACCESS_KEY_ID,
    'secretAccessKey': process.env.BOX_AWS_SECRET_ACCESS_KEY,
    'region': process.env.BOX_AWS_REGION
});

var dbClient = new AWS.DynamoDB.DocumentClient();

// Load the application secrets from environment variables for security and configuration management
const primarySignatureKey = process.env.BOX_WEBHOOK_PRIMARY_SIGNATURE_KEY;
const secondarySignatureKey = process.env.BOX_WEBHOOK_SECONDARY_SIGNATURE_KEY;

/**
 * Saves the event to DynamoDB 
 */
function saveEvent(webhookEvent) {
    var params = {
        TableName: process.env.BOX_EVENT_TABLE_NAME,
        Item: {
            file_id: webhookEvent.source.id,
            file_name: webhookEvent.source.name,
            file_etag: webhookEvent.source.parent.id,
            file_size: webhookEvent.source.size,
            event_id: webhookEvent.id
        }
    };


    return new Promise(function(resolve, reject) {
        //Insert the event in to the DynamoDB
        dbClient.put(params, function(error, data) {
            if (error) {
                reject({
                    statusCode: 500,
                    body: error
                });
            }

            resolve({
                statusCode: 200,
                body: 'Webhook Event stored successfully'
            });
        });
    })
}

/**
 *  This sample function validates the webhook event and returns errors if any.
 */
function validateWebhookEvent(webhookEvent) {
    // Print basic information about the Box event
    let message = `webhook=${webhookEvent.webhook.id}`;

    // The event trigger: FILE.DOWNLOADED
    if (webhookEvent.trigger !== 'FILE.UPLOADED') {
        return {
            statusCode: 400,
            body: 'FILE.UPLOADED event is expected'
        };
    }
    message += `, trigger=${webhookEvent.trigger}`;

    // The source that triggered the event: a file, folder, etc.
    if (!webhookEvent.source) {
        return {
            statusCode: 400,
            body: 'Source is not present in the webhook event'
        };
    }

    const source = webhookEvent.source;
    message += `, source=<${source.type} id=${source.id} name=${source.name || 'unknown'}>`;
    //Print the Event details
    console.log(`Box event: ${message}`);
}

/**
 * The event handler validates the message using the signing keys to ensure that the message was sent from
 * your Box application. Then it saves the event in the DynamoDB.
 */
exports.handler = (event, context, callback) => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);

    //Check the event is signed and signature is valid
    if (!BoxSDK.validateWebhookMessage(event.body, event.headers, primarySignatureKey, secondarySignatureKey)) {
        const response = {
            statusCode: 403,
            body: 'Message authenticity not verified'
        };
        
        console.log(`Response: ${JSON.stringify(response, null, 2)}`);
        callback(null, response);
        return;
    }

    //Check if the event has body
    if (!event.body) {
        const response = {
            statusCode: 400,
            body: 'Missing event body'
        };
        
        console.log(`Response: ${JSON.stringify(response, null, 2)}`);
        callback(null, response);
        return;
    }

    // Parse the message body from the Lambda proxy
    const body = JSON.parse(event.body);
    console.log(`Event body: ${JSON.stringify(body, null, 2)}`);

    // Handle the webhook event
    var errors = validateWebhookEvent(body);
    if (errors) {
        console.log(`Response ${JSON.stringify(errors, null, 2)}`);
        callback(null, response);
        return;
    }

    //Save the event
    saveEvent(body)
        .then(function(response) {
            console.log(`Response ${JSON.stringify(response, null, 2)}`);
            callback(null, response);
        })
        .catch(function(error) {
            //Response contains the error code
            callback(null, error);
        })
}
