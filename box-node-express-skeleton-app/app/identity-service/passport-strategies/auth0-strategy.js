'use strict';
let passport = require('passport');
let Auth0Strategy = require('passport-auth0');
const config = require('config');
const Auth0Config = config.get('Auth0Config');

let strategy = new Auth0Strategy({
  domain: Auth0Config.domain,
  clientID: Auth0Config.clientId,
  clientSecret: Auth0Config.clientSecret,
  callbackURL: Auth0Config.callbackUrl
}, (accessToken, refreshToken, extraParams, profile, done) => {
  // accessToken is the token to call Auth0 API (not needed in the most cases)
  // extraParams.id_token has the JSON Web Token
  // profile has all the information from the user
  profile.id_token = extraParams.id_token;
  return done(null, profile);
});

passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = strategy;