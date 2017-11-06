'use strict';

const fs = require('fs');
const box = require('box-node-sdk');

let serviceAccountClient;

console.log("Using config file...");
let configFile = JSON.parse(process.env.BOX_CONFIG);
let session = box.getPreconfiguredInstance(configFile);
serviceAccountClient = session.getAppAuthClient('enterprise');

const getAppUserID = (cognitoID) => {
    return serviceAccountClient.enterprise.getUsers({ "external_app_user_id": cognitoID })
        .then((result) => {
            console.log(result);
            if (result.total_count > 0) {
                return result.entries[0].id;
            } else {
                throw new Error("Couldn't find an App User for this user.");
            }
        });
}

const generateUserToken = (appUserId) => {
    console.log(`Generate user token for ${appUserId}`);
    //Generate the app user token using the app user id in Box.
    return session.getAppUserTokens(appUserId);
};

module.exports = {
    generateUserToken,
    getAppUserID
};