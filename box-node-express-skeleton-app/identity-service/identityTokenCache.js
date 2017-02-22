'use strict';
const CacheService = require('../cache-service/cacheService');
const config = require('config');
const Auth0Config = config.get('Auth0Config');
const Promise = require('bluebird');
const asyncFunc = Promise.coroutine;

const CACHE_KEY_PREFIX_DOMAIN_MANAGEMENT = `${Auth0Config.domain}|management`;

class IdentityTokenCache {
	constructor() {
		this.cache = new CacheService();
		this.inMemoryStore = new Map();
		this.cacheKeyPrefixDomainManagement = CACHE_KEY_PREFIX_DOMAIN_MANAGEMENT;
	}

	getIdentityManagementToken(key) {
		let self = this;
		return asyncFunc(function* () {
			let token = self.inMemoryStore.get(key);
			if (token) {
				return token;
			} else {
				let idManagementToken = yield self.cache.retrieveKey(key);
				idManagementToken = (idManagementToken) ? JSON.parse(idManagementToken) : null;
				clearInMemoryStore(self.inMemoryStore);
				self.inMemoryStore.set(key, idManagementToken);
				return idManagementToken;
			}
		})();
	}

	setIdentityManagementToken(key, token, expiration) {
		let self = this;
		return asyncFunc(function* () {
			clearInMemoryStore(self.inMemoryStore);
			self.inMemoryStore.set(key, token);
			expiration = expiration || 86400;
			token = JSON.stringify(token);
			yield self.cache.setKeyWithExpiration(key, token, expiration);
			return true;
		})();
	}
}

function clearInMemoryStore(store) {
	if (store.size > Auth0Config.inMemoryStoreSize) {
		store.clear();
	}
}

module.exports = new IdentityTokenCache();