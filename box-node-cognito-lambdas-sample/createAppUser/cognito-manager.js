'use strict'

const awsService = require('./aws-service');
const _ = require('lodash');

const cognitoClient = awsService.getCognitoClient();

const updateUserAttribute = function(userPoolId, userName, appUserId) {
    var params = {
        UserAttributes: [{
            Name: process.env.COGNITO_USER_ATTRIBUTE_BOX_APPUSER_ID_KEY,
            Value: appUserId
        }],
        UserPoolId: userPoolId,
        Username: userName
    };
    
    console.log(`Updating user attributes. ${process.env.COGNITO_USER_ATTRIBUTE_BOX_APPUSER_ID_KEY}`);
    return cognitoClient.adminUpdateUserAttributes(params).promise();
};

const adminGetUser = function(event) {
    console.log('Adming getUser is called.');
    var params = {
        UserPoolId: event.userPoolId,
        Username: event.userName
    };

    return cognitoClient.adminGetUser(params).promise();
};

const getAppUserProperty = function(attributes) {
    console.log(`Searching for Box Id. ${process.env.COGNITO_USER_ATTRIBUTE_BOX_APPUSER_ID_KEY}`);
    
    var appUserId = _.find(attributes, function (attr) {
        return attr.Name === process.env.COGNITO_USER_ATTRIBUTE_BOX_APPUSER_ID_KEY;
    });
    
    return (appUserId && appUserId.Value) ? appUserId.Value : null;
};

module.exports = {
    updateUserAttribute,
    adminGetUser,
    getAppUserProperty
};