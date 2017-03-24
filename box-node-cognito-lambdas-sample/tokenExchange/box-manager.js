'use strict';

const fs = require('fs');
const Box = require('box-node-sdk');

const privateKeyPath = `${process.env.LAMBDA_TASK_ROOT}/private_key.pem`;
const privateKey = fs.readFileSync(privateKeyPath);

let BoxSdk = new Box({
    clientID: process.env.BOX_CLIENT_ID,
    clientSecret: process.env.BOX_CLIENT_SECRET,
    
    appAuth: {
        keyID: process.env.BOX_PUBLIC_KEY_ID,
        privateKey: privateKey,        
        passphrase: process.env.BOX_PRIVATE_KEY_PASSWORD
    }
});

let generateUserToken = function (appUserId) {
	console.log(`Generate user token for ${appUserId}`);

    return new Promise(function (resolve, reject) {
    	//Generate the app user token using the app user id in Box.
        BoxSdk.getAppUserTokens(appUserId, (err, userToken) => {
            if (err) {
              throw err;
            }
            
            resolve(userToken);
        });
    });
}

module.exports = {
	generateUserToken
}