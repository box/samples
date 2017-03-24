'use strict';

const awsService = require('./aws-service');
const _ = require('lodash');

let cognitoClient = awsService.getCognitoClient();

let getAppUserProperty = function (attributes) {
    console.log(`Searching for Box Id. ${process.env.COGNITO_USER_ATTRIBUTE_BOX_APPUSER_ID_KEY}`);
    
    var appUserId = _.find(attributes, function (attr) {
        return attr.Name === process.env.COGNITO_USER_ATTRIBUTE_BOX_APPUSER_ID_KEY;
    });
    
    return (appUserId && appUserId.Value) ? appUserId.Value : null;
}

let getUser = function(token) {
	console.log('Get the user of the token')
	let params = {
	  AccessToken: token
	};

    //Get the Cognito user from the Cognito user token
	return cognitoClient.getUser(params).promise();
}

let adminGetUser = function(user) {
	console.log('admin getUser is called')
	let userAttributesParams = {
		UserPoolId: process.env.COGNITO_USER_POOL_ID,
		Username: user.Username
	};

	return cognitoClient.adminGetUser(userAttributesParams).promise();
}

module.exports = {
	getAppUserProperty,
	getUser,
	adminGetUser
}
