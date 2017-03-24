'use strict'

const awsService = require('./aws-service');
const _ = require('lodash');

let cognitoClient = awsService.getCognitoClient();

let updateUserAttribute = function (userPoolId, userName, appUserId) {
    let params = {
        UserAttributes: [{
            Name: process.env.COGNITO_USER_ATTRIBUTE_BOX_APPUSER_ID_KEY,
            Value: appUserId
        }],
        UserPoolId: userPoolId,
        Username: userName
    };
    
    console.log(`Updating user attributes. ${process.env.COGNITO_USER_ATTRIBUTE_BOX_APPUSER_ID_KEY}`);
    return cognitoClient.adminUpdateUserAttributes(params).promise();
}

let adminGetUser = function(event) {
    console.log('Adming getUser is called.');
     let params = {
        UserPoolId: event.userPoolId,
        Username: event.userName
    };

    return cognitoClient.adminGetUser(params).promise()
}

let getAppUserProperty = function (attributes) {
    console.log(`Searching for Box Id. ${process.env.COGNITO_USER_ATTRIBUTE_BOX_APPUSER_ID_KEY}`);
    
    var appUserId = _.find(attributes, function (attr) {
        return attr.Name === process.env.COGNITO_USER_ATTRIBUTE_BOX_APPUSER_ID_KEY;
    });
    
    return (appUserId && appUserId.Value) ? appUserId.Value : null;
}

module.exports = {
    updateUserAttribute,
    adminGetUser,
    getAppUserProperty
}