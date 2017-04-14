'use strict';

const boxManager = require('./box-manager');
const cognitoManager = require('./cognito-manager');

exports.handler = function (event, context, callback) {
    console.log(`Event : ${JSON.stringify(event)}`);
    
    //Extract the troken from the event body
    let token = JSON.parse(event.body).token;
    if (!token) {
        callback(null, { 
            statusCode: '401',
            body: JSON.stringify({
                message: 'No token found.'
            })
        });
    }

    //Get the Cognito user using the token
    cognitoManager.getUser(token)
        .then(function(user) {
            console.log(`User is: ${JSON.stringify(user)}`);
            
            return cognitoManager.adminGetUser(user);
        }).then(function(response) {
            //Get the Box user property
            var boxAppUserId = cognitoManager.getAppUserProperty(response.UserAttributes);
            console.log(`Box App user id: ${boxAppUserId}`);
            
            //If the box user is not present in Cognito, throw error
            if (!boxAppUserId) {
                callback(null, {
                    statusCode: '500',
                    body: JSON.stringify({
                        error: 'Error retrieving user information from Cognito.'
                    })
                });    
            } else {
                //Generate the new app user token from Box.
                return boxManager.generateUserToken(boxAppUserId);
            }
        }).then(function(boxToken) {
            //Sending the Box app user token.
            callback(null, {
                statusCode: '200',
                body: JSON.stringify(boxToken)
            });      
        }).catch(function(error) {
            //Sending the error as response.
            callback(null, {
                statusCode: '500',
                body: JSON.stringify({
                    error: error
                })
            });        
        });
};