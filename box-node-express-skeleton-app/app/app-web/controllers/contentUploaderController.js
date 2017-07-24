'use strict';
const Promise = require('bluebird');
const asyncFunc = Promise.coroutine;
const config = require('config');
const BoxOptions = config.get('BoxOptions');
const AppConfig = config.get('AppConfig');
let BoxService = require('../../box-service/boxClientService');

module.exports.main = asyncFunc(function* (req, res, next) {
	let boxAppUserId = req.user.app_metadata[BoxOptions.boxAppUserIdFieldName];
	if (!boxAppUserId) {
		res.redirect('/');
	}
	let rootFolder = req.params.id || '0';
	let appUserClient = yield BoxService.getUserClient(boxAppUserId);
	let accessToken = yield BoxService.generateUserToken(boxAppUserId);
	res.render('pages/content-uploader', {
		user: req.user,
		accessToken: accessToken.accessToken,
		rootFolder: rootFolder,
		title: "Box Skeleton App",
		domain: AppConfig.domain
	});
});