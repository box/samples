'use strict';
const config = require('config');
const Box = require('box-node-sdk');
const BoxSDKConfig = config.get('BoxSDKConfig');
const BoxOptions = config.get('BoxOptions');
const BoxCache = require('./boxTokenCache');
const BoxConfig = require('./boxConfig');
const _ = require('lodash');
const fs = require('fs');

const BOX_ENTERPRISE = "enterprise";
const BOX_USER = "user";
const BOX_REVOKE_URL = "https://api.box.com/oauth2/revoke";

class BoxClientService {
	constructor() {
		this.BoxConfig = new BoxConfig(BoxSDKConfig, BoxSDKConfig.boxConfigFilePath);
		this.BoxSdk = Box.getPreconfiguredInstance(this.BoxConfig.getConfig());
		this.BoxCache = BoxCache;
	}

	async createAppUser(displayName, externalId) {
		let client = await this.getServiceAccountClient();
		return client.enterprise.addAppUser(displayName, {
			external_app_user_id: externalId
		});
	}


	async checkForExistingUserByExternalId(externalId) {
		let client = await this.getServiceAccountClient();
		let usersList = await client.enterprise.getUsers({ external_app_user_id: externalId });
		let userId = "";
		if (usersList && _.isArray(usersList.entries) && usersList.entries.length > 0) {
			userId = _.first(usersList.entries).id;
		}
		return userId;
	}

	async revokeUserToken(token, boxUserId) {
		let key = `${this.BoxCache.cacheKeyPrefixUserToken}|${boxUserId}`;
		await this.BoxCache.removeBoxToken(key);

		let client = new Box({
			clientID: '',
			clientSecret: ''
		}).getBasicClient();
		let config = this.BoxConfig.getConfig();
		let params = {
			form: {
				client_id: config.boxAppSettings.clientID,
				client_secret: config.boxAppSettings.clientSecret,
				token
			}
		};
		await client.post(BOX_REVOKE_URL, params);
	}

	getLongRunningServiceAccountClient() {
		return this.BoxSdk.getAppAuthClient(BOX_ENTERPRISE, BoxSDKConfig.enterpriseID);
	}

	getLongRunningUserClient(boxId) {
		return this.BoxSdk.getAppAuthClient(BOX_USER, boxId);
	}

	async getServiceAccountClient() {
		let token = await this.generateEnterpriseToken();
		return this.BoxSdk.getBasicClient(token.accessToken);
	}

	async getUserClient(boxId) {
		let token = await this.generateUserToken(boxId);
		return this.BoxSdk.getBasicClient(token.accessToken);
	}

	async generateEnterpriseToken() {
		let key = this.BoxCache.cacheKeyPrefixEnterpriseToken;
		let enterpriseToken = await this.BoxCache.getBoxToken(key);
		if (enterpriseToken && enterpriseToken[BoxOptions.expiresAtFieldName] && enterpriseToken[BoxOptions.expiresAtFieldName] > Date.now()) {
			return enterpriseToken;
		} else {
			return await new Promise((resolve, reject) => {
				this.BoxSdk.getEnterpriseAppAuthTokens(BoxSDKConfig.enterpriseID, async (err, enterpriseToken) => {
					if (err) { reject(err); }
					enterpriseToken = createExpiresAtProp(enterpriseToken);
					let expiryTimeInSeconds = getExpirationTimeForCache(enterpriseToken);
					await this.BoxCache.setBoxToken(key, enterpriseToken, expiryTimeInSeconds);
					resolve(enterpriseToken);
				});
			});
		}
	}

	async generateUserToken(boxId) {
		let key = `${this.BoxCache.cacheKeyPrefixUserToken}|${boxId}`;
		let accessTokenFromStorage = await this.BoxCache.getBoxToken(key);
		if (accessTokenFromStorage && accessTokenFromStorage[BoxOptions.expiresAtFieldName] && accessTokenFromStorage[BoxOptions.expiresAtFieldName] > Date.now()) {
			return accessTokenFromStorage;
		} else {
			return await new Promise((resolve, reject) => {
				this.BoxSdk.getAppUserTokens(boxId, async (err, accessTokenInfo) => {
					if (err) { reject(err); }
					accessTokenInfo = createExpiresAtProp(accessTokenInfo);
					let expiryTimeInSeconds = getExpirationTimeForCache(accessTokenInfo);
					await BoxCache.setBoxToken(key, accessTokenInfo, expiryTimeInSeconds);
					resolve(accessTokenInfo);
				});
			});
		}
	}
}

function createExpiresAtProp(accessTokenInfo) {
	if (accessTokenInfo && (accessTokenInfo.expires_in || accessTokenInfo.accessTokenTTLMS)) {
		accessTokenInfo[BoxOptions.expiresAtFieldName] = (accessTokenInfo.expires_in) ? Date.now() + (accessTokenInfo.expires_in * 1000) : Date.now() + accessTokenInfo.accessTokenTTLMS;
	}
	return accessTokenInfo;
}

function getExpirationTimeForCache(accessTokenInfo) {
	return Math.ceil((new Date(accessTokenInfo[BoxOptions.expiresAtFieldName]) - (Date.now() - 420000)) / 1000);
}

module.exports = new BoxClientService();