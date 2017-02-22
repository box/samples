'use strict';
const config = require('config');
const BoxOptions = config.get('BoxOptions');
const Auth0Config = config.get('Auth0Config');
const Promise = require('bluebird');
const asyncFunc = Promise.coroutine;
const request = require('request');
Promise.promisifyAll(request);

class IdentityProviderUtilities {
  static normalizeAppMetadataOnProfile(profile) {
    let appMetadata = profile._json.app_metadata || {};
    profile.app_metadata = appMetadata;
    return profile;
  }

  static checkForExistingBoxAppUserId(profile) {
    return (profile && profile.app_metadata && profile.app_metadata[BoxOptions.boxAppUserIdFieldName]) ? profile.app_metadata[BoxOptions.boxAppUserIdFieldName] : null;
  }

  static retrieveManagementToken() {
    return asyncFunc(function* () {
      let options = {
        url: `https://${Auth0Config.domain}/oauth/token`,
        headers: { 'content-type': 'application/json' },
        body:
        {
          grant_type: 'client_credentials',
          client_id: Auth0Config.clientId,
          client_secret: Auth0Config.clientSecret,
          audience: `https://${Auth0Config.domain}/api/v2/`
        },
        json: true
      };
      let token = yield request.postAsync(options);
      return token.body;
    })();
  }
}

module.exports = IdentityProviderUtilities;