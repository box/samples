"use strict";
let cognitoManager = require('./cognito-manager');
let boxManager = require('./box-manager');

exports.handler = function (event, context) {
    console.log('Calling create app user');
    
    //Get the Cognito user using the event details
    cognitoManager.adminGetUser(event)
        .then(function(cognitoResponse) {
            let boxAppUserId = cognitoManager.getAppUserProperty(cognitoResponse.UserAttributes);
            if (boxAppUserId !== null) {
                //User already exists in Box.
                context.done(null, event);
            } else {
                //If the box box user id custom attribute is not present in Cognito,
                //then create the user in Box.
                return boxManager.createAppUser(event.userName);    
            }
        }).then(function(appUser) {
            //Update the box app user attribute in Cognito user.
            return cognitoManager.updateUserAttribute(event.userPoolId, event.userName, appUser.id);
        }).then(function(updatedInfo) {
            //Send event as the response
            context.done(null, event);        
        }).catch(function(error) {
            //Send the error response
            context.done(error);
        });
};