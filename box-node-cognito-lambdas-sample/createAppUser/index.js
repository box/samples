"use strict";
let boxManager = require('./boxManager');

exports.handler = (event, context) => {
    console.log('Calling create app user');
    if (event && event.userName && event.request && event.request.userAttributes && event.request.userAttributes.sub) {
        //Get the Cognito user using the event details
        return boxManager.createAppUser(event.userName, event.request.userAttributes.sub)
            .then(function (updatedInfo) {
                //Send event as the response
                context.done(null, event);
            }).catch(function (error) {
                //Send the error response
                context.done(error);
            });
    } else {
        console.log("Couldn't create app user for this user.");
        context.done(null, event);
    }
};