'use strict';
const fs = require('fs');
const path = require('path');

module.exports = {
	BoxSDKConfig: {
		boxConfigFilePath: ""
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
		managementAPIClientId: "",
		managementAPIClientSecret: ""
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