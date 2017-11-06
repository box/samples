'use strict';
const Redis = require('ioredis');
const config = require('config');
const RedisConfig = config.get('RedisConfig');

class CacheService {
	constructor() {
		this.client = new Redis({
			port: RedisConfig.port,
			host: RedisConfig.address,
			password: RedisConfig.password
		});
	}

	getCacheClient() {
		return this.client;
	}

	retrieveKey(key) {
		return this.client.get(key);
	}

	setKey(key, value) {
		return this.client.set(key, value);
	}

	deleteKey(key) {
		return this.client.del(key);
	}

	setKeyWithExpiration(key, value, expiration) {
		return this.client.set(key, value, 'ex', expiration);
	}

	quitCacheClient() {
		return this.client.quit();
	}
}

module.exports = CacheService;