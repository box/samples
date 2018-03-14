'use strict';

const CacheService = require('../cache-service/cacheService');
const config = require('config');
const BoxSDKConfig = config.get('BoxSDKConfig');
const BoxOptions = config.get('BoxOptions');

const BOX_ENTERPRISE = "enterprise";
const BOX_USER = "user";

const CACHE_KEY_PREFIX_ENTERPRISE_TOKEN = `${BoxSDKConfig.enterpriseID}|${BOX_ENTERPRISE}`;
const CACHE_KEY_PREFIX_USER_TOKEN = `${BoxSDKConfig.enterpriseID}|${BOX_USER}`;

//Implementation of a BoxCache: has getBoxToken and setBoxToken
class BoxTokenCache {
	constructor() {
		this.cache = new CacheService();
		this.inMemoryStore = new Map();
		this.cacheKeyPrefixEnterpriseToken = CACHE_KEY_PREFIX_ENTERPRISE_TOKEN;
		this.cacheKeyPrefixUserToken = CACHE_KEY_PREFIX_USER_TOKEN;
	}

	async getBoxToken(key) {
		let token = this.inMemoryStore.get(key);
		if (token) {
			return token;
		} else {
			let boxToken = await this.cache.retrieveKey(key);
			boxToken = (boxToken) ? JSON.parse(boxToken) : null;
			clearInMemoryStore(this.inMemoryStore);
			this.inMemoryStore.set(key, boxToken);
			return boxToken;
		}
	}

	async setBoxToken(key, boxToken, expiration) {
		clearInMemoryStore(this.inMemoryStore);
		this.inMemoryStore.set(key, boxToken);
		expiration = expiration || 3600;
		boxToken = JSON.stringify(boxToken);
		await this.cache.setKeyWithExpiration(key, boxToken, expiration);
		return true;
	}

	async removeBoxToken(key) {
		this.inMemoryStore.delete(key);
		await this.cache.deleteKey(key);
		return true;
	}
}

function clearInMemoryStore(store) {
	if (store.size > BoxOptions.inMemoryStoreSize) {
		store.clear();
	}
}

module.exports = new BoxTokenCache();