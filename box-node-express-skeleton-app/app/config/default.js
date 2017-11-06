'use strict';
const fs = require('fs');
const path = require('path');

module.exports = {
	BoxSDKConfig: {
		clientID: "",
		clientSecret: "",
		publicKeyID: "",
		privateKey: "",
		privateKeyFilename: "",
		passphrase: "",
		enterpriseID: "",
		primaryKey: "",
		secondaryKey: "",
		boxConfigFilePath: "config.json"
	},
	BoxOptions: {
		inMemoryStoreSize: "100",
		expiresAtFieldName: "expiresAt",
		boxAppUserIdFieldName: "box_appuser_id"
	},

	Auth0Config: {
		domain: "",
		clientId: "",
		clientSecret: "",
		callbackUrl: "http://localhost:3000/callback",
		sessionSecret: "securepassword",
		inMemoryStoreSize: "100",
	},

	RedisConfig: {
		port: "6379",
		address: "redis",
		password: "securepassword"
	},

	AppConfig: {
		domain: "http://localhost:3000"
	}
}