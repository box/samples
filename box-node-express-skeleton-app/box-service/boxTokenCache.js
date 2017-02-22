'use strict';

const CacheService = require('../cache-service/cacheService');
const config = require('config');
const BoxSDKConfig = config.get('BoxSDKConfig');
const BoxOptions = config.get('BoxOptions');
const Promise = require('bluebird');
const asyncFunc = Promise.coroutine;

const BOX_ENTERPRISE = "enterprise";
const BOX_USER = "user";

const CACHE_KEY_PREFIX_ENTERPRISE_TOKEN = `${BoxSDKConfig.boxEnterpriseId}|${BOX_ENTERPRISE}`;
const CACHE_KEY_PREFIX_USER_TOKEN = `${BoxSDKConfig.boxEnterpriseId}|${BOX_USER}`;

//Implementation of a BoxCache: has getBoxToken and setBoxToken
class BoxTokenCache {
	constructor() {
		this.cache = new CacheService();
		this.inMemoryStore = new Map();
		this.cacheKeyPrefixEnterpriseToken = CACHE_KEY_PREFIX_ENTERPRISE_TOKEN;
		this.cacheKeyPrefixUserToken = CACHE_KEY_PREFIX_USER_TOKEN;
	}

	getBoxToken(key) {
		let self = this;
		return asyncFunc(function* () {
			let token = self.inMemoryStore.get(key);
			if (token) {
				return token;
			} else {
				let boxToken = yield self.cache.retrieveKey(key);
				boxToken = (boxToken) ? JSON.parse(boxToken) : null;
				clearInMemoryStore(self.inMemoryStore);
				self.inMemoryStore.set(key, boxToken);
				return boxToken;
			}
		})();
	}

	setBoxToken(key, boxToken, expiration) {
		let self = this;
		return asyncFunc(function* () {
			clearInMemoryStore(self.inMemoryStore);
			self.inMemoryStore.set(key, boxToken);
			expiration = expiration || 3600;
			boxToken = JSON.stringify(boxToken);
			yield self.cache.setKeyWithExpiration(key, boxToken, expiration);
			return true;
		})();
	}
}

function clearInMemoryStore(store) {
	if (store.size > BoxOptions.inMemoryStoreSize) {
		store.clear();
	}
}

module.exports = new BoxTokenCache();