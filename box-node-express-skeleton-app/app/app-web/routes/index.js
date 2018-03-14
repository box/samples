'use strict';
const express = require('express');
const router = express.Router();
const passport = require('passport');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
const config = require('config');
const Auth0Config = config.get('Auth0Config');

const indexCtrl = require('../controllers/indexController');
const loginCtrl = require('../controllers/loginController');
const usersCtrl = require('../controllers/usersController');
const contentPickerCtrl = require('../controllers/contentPickerController');
const contentUploaderCtrl = require('../controllers/contentUploaderController');
const contentTreeCtrl = require('../controllers/contentTreeController');
const logoutCtrl = require('../controllers/logoutController');

router.get('/', indexCtrl.main);
router.get('/login', passport.authenticate('auth0', {
    clientID: Auth0Config.clientId,
    domain: Auth0Config.domain,
    redirectUri: Auth0Config.callbackUrl || 'http://localhost:3000/callback',
    responseType: 'code',
    audience: 'https://' + Auth0Config.domain + '/userinfo',
    scope: 'openid profile'
}), (req, res) => { res.redirect("/"); });
router.get('/callback', passport.authenticate('auth0', { failureRedirect: '/' }), loginCtrl.callback);
router.get('/user/:id?', ensureLoggedIn, usersCtrl.main);
router.get('/content-picker/:id?', ensureLoggedIn, contentPickerCtrl.main);
router.get('/content-uploader/:id?', ensureLoggedIn, contentUploaderCtrl.main);
router.get('/content-tree/:id?', ensureLoggedIn, contentTreeCtrl.main);
router.get('/logout', ensureLoggedIn, logoutCtrl.main);

module.exports = router;