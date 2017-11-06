'use strict';
let express = require('express');
let router = express.Router();
let passport = require('passport');
let ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();

let indexCtrl = require('../controllers/indexController');
let loginCtrl = require('../controllers/loginController');
let usersCtrl = require('../controllers/usersController');
let contentPickerCtrl = require('../controllers/contentPickerController');
let contentUploaderCtrl = require('../controllers/contentUploaderController');
let contentTreeCtrl = require('../controllers/contentTreeController');
let logoutCtrl = require('../controllers/logoutController');

router.get('/', indexCtrl.main);
router.get('/login', loginCtrl.main);
router.get('/callback', passport.authenticate('auth0', { failureRedirect: '/' }), loginCtrl.callback);
router.get('/user/:id?', ensureLoggedIn, usersCtrl.main);
router.get('/content-picker/:id?', ensureLoggedIn, contentPickerCtrl.main);
router.get('/content-uploader/:id?', ensureLoggedIn, contentUploaderCtrl.main);
router.get('/content-tree/:id?', ensureLoggedIn, contentTreeCtrl.main);
router.get('/logout', ensureLoggedIn, logoutCtrl.main);

module.exports = router;