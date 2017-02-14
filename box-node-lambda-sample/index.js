/**
 * This sample demonstrates how to call Box APIs from an AWS Lambda function using the Box Node SDK.
 *
 * For step-by-step instructions on how to create and authorize a Box application, see box-node-lambda-sample in
 * https://github.com/box/samples
 */

'use strict';

const BoxSDK = require('box-node-sdk');
const fs = require('fs');

// The private key can't be stored in an environment variable, so load the PEM file from the deployment package
// (You could also load it from an S3 bucket)
const privateKeyPath = `${process.env.LAMBDA_TASK_ROOT}/private_key.pem`;
const privateKey = fs.readFileSync(privateKeyPath);

// Load the application secrets from environment variables for security and configuration management
const sdk = new BoxSDK({
    clientID: process.env.BOX_CLIENT_ID,
    clientSecret: process.env.BOX_CLIENT_SECRET,
    appAuth: {
        keyID: process.env.BOX_PUBLIC_KEY_ID,
        privateKey: privateKey,
        passphrase: process.env.BOX_PRIVATE_KEY_PASSPHRASE,
    },
});

/**
 * Create an enterprise client that performs actions in the context of the service account.
 * The app has a unique service account in each enterprise that authorizes the app.
 * The service account contains any app-specific content for the enterprise.
 * Depending on the scopes selected, it can also create and manage app users or managed users in that enterprise.
 *
 * The client will create and refresh the service account access token automatically.
 */
const client = sdk.getAppAuthClient('enterprise', process.env.BOX_ENTERPRISE_ID);

/**
 *  YOUR CODE GOES HERE!!!
 *
 *  This sample function returns details of the current user (the service account)
 */
exports.handler = (event, context, callback) => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);

    // Get details on the current user  (the service account)
    client.users.get(client.CURRENT_USER_ID, null, (err, result) => {
        let response;

        if (err) {
            if (err.response && err.response.body) {
                response = err.response.body;
            } else {
                response = err.toString();
            }
        } else {
            response = result;
        }

        console.log(`Response: ${JSON.stringify(response, null, 2)}`);
        callback(null, response);
    });
};
