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
const fs = require('fs');

var AWS = require('aws-sdk');
console.log('Access Key id: ' + process.env.BOX_AWS_ACCESS_KEY_ID)
console.log('Access secret: ' + process.env.BOX_AWS_SECRET_ACCESS_KEY)
console.log('AWS Region: ' + process.env.BOX_AWS_REGION)

AWS.config.update({
    'accessKeyId': process.env.BOX_AWS_ACCESS_KEY_ID,
    'secretAccessKey': process.env.BOX_AWS_SECRET_ACCESS_KEY,
    'region': process.env.BOX_AWS_REGION
});

var rekognition = new AWS.Rekognition({apiVersion: '2016-06-27'});

const privateKeyPath = `${process.env.LAMBDA_TASK_ROOT}/private_key.pem`;
const privateKey = fs.readFileSync(privateKeyPath);

var sdk = new BoxSDK({
    clientID: process.env.BOX_CLIENT_ID,
    clientSecret: process.env.BOX_CLIENT_SECRET,
    appAuth: {
        keyID: process.env.BOX_PUBLIC_KEY_ID,
        privateKey: privateKey,
        passphrase: process.env.BOX_PRIVATE_KEY_PASSPHRASE 
    }
});

// var client = sdk.getBasicClient(token);

/**
 * The event handler validates the message using the signing keys to ensure that the message was sent from
 * your Box application.
 */
exports.handler = (event, context, callback) => {

    console.log(JSON.stringify(event, null, 2));
    //Reads only one record as this sample configuration sets dynamodb batch size as 1.
    event.Records.forEach(function(record) {
        if (event.eventName === 'REMOVE') {
            console.log('Skipping Remove event')
            return;
        }

        var fileId = record.dynamodb.Keys.file_id.S;
        var userId = record.dynamodb.NewImage.user_id.S;
        
        //Create the Box api client that uses enterprise token
        var client = sdk.getAppAuthClient('enterprise', process.env.BOX_ENTERPRISE_ID);
        client.asUser(process.env.BOX_APP_USER_ID);

        console.log('Content retrival for File Id: ', fileId);

        readStream(client, fileId)
            .then(function(buffer) {
                return detectLabels(fileId, buffer);
            })    
            .then(function(metadata) {
                return addMetadata(client, fileId, metadata);
            })
            .then(function(data) {
                console.log(`Metadata saved successfully for File Id: ${fileId}`)
            })
            .catch(function(error) {
                callback(error);
            })
    });

    callback(null, 'Rekognition Lambda function executed successfully')
};

var detectLabels = function(fileId, buffer) {

    return new Promise(function(resolve, reject) {
        var params = {
            Image: {
                Bytes: buffer
            },
            MinConfidence: 50  
        };

        rekognition.detectLabels(params, (error, response) => {
            if (error) {
                console.log(error, error.stack); // an error occurred
                reject(error);
            } else {
                console.log("-------- START: Object and scene detection --------");
                var labels = response.Labels;
                var data = {};
                for(var i=0; i<labels.length; i++) {
                    console.log('Name =' + labels[i].Name + ', Confidence =' + labels[i].Confidence);  
                    data[labels[i].Name] = labels[i].Confidence + '';
                }
                console.log("-------- END: Object and scene detection --------");
                console.log("\n");
          
                resolve(data);
            }
        });
    });
}

var readStream = function(client, fileId) {
    console.log(`Reading stream from File: ${fileId}`);

    return new Promise(function(resolve, reject) {
        client.files.getReadStream(fileId, null, (error, stream) => {
            if (error) {
                console.log(`Error occured: ${error}`);
                reject(error);
            }
          
            console.log(`Box Streaming data for file ${fileId}`);
            var buffer = new Buffer('', 'base64');
            stream.on('data', (chunk) => {
                console.log(`Chunk length: ${chunk.length}`);
                buffer = Buffer.concat([buffer, chunk]);
                
                console.log(buffer.length);
            });

            stream.on('end', () => {
                resolve(buffer);
            });
        });        
    })
}

var addMetadata = function(client, fileId, metadata) {
    console.log(`Adding metadata: ${metadata}`);

    return new Promise(function(resolve, reject) {
        client.files.addMetadata(fileId, 'global', 'properties', metadata, function(error, data) {
            if (error) {
                console.log(`Error occured: ${error}`);
                reject(error);
            } else {
                console.log(`Add Metadata is successful. ${data}`);
                resolve(data);
            }
        });
    });
}