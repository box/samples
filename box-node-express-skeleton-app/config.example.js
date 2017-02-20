'use strict';
const fs = require('fs');
const path = require('path');

module.exports.BoxConfig = {
  boxClientId: "",
  boxClientSecret: "",
  boxEnterpriseId: "",
  boxPrivateKeyFileName: "private_key.pem",
  boxPrivateKeyPassword: "password",
  boxPrivateKey: () => {
    return fs.readFileSync(path.resolve(this.BoxConfig.boxPrivateKeyFileName));
  },
  boxPublicKeyId: "",
  enterprise: "enterprise",
  user: "user",
  expiresAt: "expiresAt",
  inMemoryStoreSize: "100",
  boxAppUserId: "box_appuser_id",
  managers: [
    "users",
    "files",
    "folders",
    "comments",
    "collaborations",
    "groups",
    "sharedItems",
    "metadata",
    "collections",
    "events",
    "search",
    "tasks",
    "trash",
    "enterprise",
    "legalHoldPolicies",
    "weblinks",
    "retentionPolicies",
    "devicePins",
    "webhooks"
  ]
}

module.exports.RedisConfig = {
  port: "6379",
  address: "localhost",
  password: "securepassword"
}

module.exports.Auth0Config = {
  domain: "",
  clientId: "",
  clientSecret: "",
  callbackUrl: "http://localhost:3000/callback",
  sessionSecret: "securepassword",
  inMemoryStoreSize: "100"
}

module.exports.AppConfig = {
  domain: "http://localhost:3000"
}