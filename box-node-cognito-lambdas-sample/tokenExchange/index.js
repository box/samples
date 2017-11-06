'use strict';

const boxManager = require('./boxManager');

//The authorizer attached to the API Gateway will send in the "sub" field within the claims when a JWT ID token is sent in the "Authorization" header.
//The "sub" field is the user ID in the Cognito User Pool.
const retrieveCognitoID = (event, callback) => {
    if (event && event.requestContext && event.requestContext.authorizer
        && event.requestContext.authorizer.claims && event.requestContext.authorizer.claims.sub) {
        return event.requestContext.authorizer.claims.sub;
    } else {
        callback(null, {
            statusCode: '401',
            body: JSON.stringify({
                error: "No ID found for this user."
            })
        });
    }
}

exports.handler = function (event, context, callback) {
    console.log(`Event : ${JSON.stringify(event)}`);
    const cognitoID = retrieveCognitoID(event, callback);
    console.log(`Cognito ID: ${cognitoID}`);
    //Retrieve the Box App User using the user's Cognito ID
    boxManager.getAppUserID(cognitoID)
        .then((appUserID) => {
            //If the box user is not present in Cognito, throw error
            if (!appUserID) {
                callback(null, {
                    statusCode: '500',
                    body: JSON.stringify({
                        error: 'Error retrieving user information from Box.'
                    })
                });
            }
            console.log(`App User ID is: ${appUserID}`);
            return boxManager.generateUserToken(appUserID);
        }).then(function (boxToken) {
            //Sending the Box app user token.
            if (!boxToken) {
                callback(null, {
                    statusCode: '500',
                    body: JSON.stringify({
                        error: 'Error retrieving new token from Box.'
                    })
                });
            }
            callback(null, {
                statusCode: '200',
                body: JSON.stringify(boxToken)
            });
        }).catch(function (error) {
            //Sending the error as response.
            callback(null, {
                statusCode: '500',
                body: JSON.stringify({
                    error: error
                })
            });
        });
};