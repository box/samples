'use strict';

class AWSService {
    constructor() {
        this.AWS = require('aws-sdk');
        new this.AWS.Config({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
    }

    getCognitoClient() {
        return new this.AWS.CognitoIdentityServiceProvider();
    }
};

module.exports = new AWSService;