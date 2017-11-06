'use strict';

const box = require('box-node-sdk');
const fs = require('fs');
const errorHandlers = require('./errorHandlers');

let serviceAccountClient;

console.log("Using config file...");
let configFile = JSON.parse(process.env.BOX_CONFIG);
let session = box.getPreconfiguredInstance(configFile);
serviceAccountClient = session.getAppAuthClient('enterprise');

const createAppUser = (userName, userID) => {
	console.log("Starting to create app user...");
	return serviceAccountClient.enterprise.addAppUser(userName, { "external_app_user_id": userID })
		.then((user) => {
			console.log("Created new Box App User: ");
			console.log(user);
		})
		.catch((err) => {
			errorHandlers.handleConflictError(err);
		});
};

module.exports = {
	createAppUser
};