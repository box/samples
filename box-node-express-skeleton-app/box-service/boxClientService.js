'use strict';
const Box = require('box-node-sdk');
const BoxConfig = require('../config').BoxConfig;
const BoxUtilityServices = require('./boxUtilityServices');
const BoxCache = require('./boxTokenCache');
const _ = require('lodash');
const Promise = require('bluebird');
const asyncFunc = Promise.coroutine;

class BoxClientService {
	constructor() {
		this.BoxSdk = new Box({
			clientID: BoxConfig.boxClientId,
			clientSecret: BoxConfig.boxClientSecret,
			appAuth: {
				keyID: BoxConfig.boxPublicKeyId,
				privateKey: BoxConfig.boxPrivateKey(),
				passphrase: BoxConfig.boxPrivateKeyPassword
			}
		});
		this.BoxCache = BoxCache;
	}

	createAppUser(displayName) {
		let self = this;
		return asyncFunc(function* () {
			let client = yield self.getServiceAccountClient();
			return client.enterprise.addUserAsync(null, displayName, { is_platform_access_only: true });
		})();
	}

	getLongRunningServiceAccountClient() {
		return BoxUtilityServices.promisifyClient(this.BoxSdk.getAppAuthClient(BoxConfig.enterprise, BoxConfig.boxEnterpriseId));
	}

	getLongRunningUserClient(boxId) {
		return BoxUtilityServices.promisifyClient(this.BoxSdk.getAppAuthClient(BoxConfig.user, boxId));
	}

	getServiceAccountClient() {
		let self = this;
		return asyncFunc(function* () {
			let token = yield self.generateEnterpriseToken();
			return BoxUtilityServices.promisifyClient(self.BoxSdk.getBasicClient(token.accessToken));
		})();
	}

	getUserClient(boxId) {
		let self = this;
		return asyncFunc(function* () {
			let token = yield self.generateUserToken(boxId);
			return BoxUtilityServices.promisifyClient(self.BoxSdk.getBasicClient(token.accessToken));
		})();
	}

	generateEnterpriseToken() {
		let self = this;
		let key = this.BoxCache.cacheKeyPrefixEnterpriseToken;
		return asyncFunc(function* () {
			let enterpriseToken = yield self.BoxCache.getBoxToken(key);
			if (enterpriseToken && enterpriseToken[BoxConfig.expiresAt] && enterpriseToken[BoxConfig.expiresAt] > Date.now()) {
				return enterpriseToken;
			} else {
				return new Promise((resolve, reject) => {
					self.BoxSdk.getEnterpriseAppAuthTokens(BoxConfig.boxEnterpriseId, asyncFunc(function* (err, enterpriseToken) {
						if (err) { reject(err); }
						enterpriseToken = createExpiresAtProp(enterpriseToken);
						let expiryTimeInSeconds = getExpirationTimeForCache(enterpriseToken);
						yield self.BoxCache.setBoxToken(key, enterpriseToken, expiryTimeInSeconds);
						resolve(enterpriseToken);
					}));
				});
			}
		})();
	}

	generateUserToken(boxId) {
		let self = this;
		let key = `${this.BoxCache.cacheKeyPrefixUserToken}|${boxId}`;
		return asyncFunc(function* () {
			let accessTokenFromStorage = yield self.BoxCache.getBoxToken(key);
			if (accessTokenFromStorage && accessTokenFromStorage[BoxConfig.expiresAt] && accessTokenFromStorage[BoxConfig.expiresAt] > Date.now()) {
				return accessTokenFromStorage;
			} else {
				return new Promise((resolve, reject) => {
					self.BoxSdk.getAppUserTokens(boxId, asyncFunc(function* (err, accessTokenInfo) {
						if (err) { reject(err); }
						accessTokenInfo = createExpiresAtProp(accessTokenInfo);
						let expiryTimeInSeconds = getExpirationTimeForCache(accessTokenInfo);
						yield BoxCache.setBoxToken(key, accessTokenInfo, expiryTimeInSeconds);
						resolve(accessTokenInfo);
					}));
				});
			}
		})();
	}
}

function createExpiresAtProp(accessTokenInfo) {
	if (accessTokenInfo && (accessTokenInfo.expires_in || accessTokenInfo.accessTokenTTLMS)) {
		accessTokenInfo[BoxConfig.expiresAt] = (accessTokenInfo.expires_in) ? Date.now() + (accessTokenInfo.expires_in * 1000) : Date.now() + accessTokenInfo.accessTokenTTLMS;
	}
	return accessTokenInfo;
}

function getExpirationTimeForCache(accessTokenInfo) {
	return Math.ceil((new Date(accessTokenInfo[BoxConfig.expiresAt]) - (Date.now() - 420000)) / 1000);
}

module.exports = new BoxClientService();