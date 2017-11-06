'use strict';
const config = require('config');
const BoxOptions = config.get('BoxOptions');
const AppConfig = config.get('AppConfig');
let BoxService = require('../../box-service/boxClientService');

module.exports.main = async (req, res, next) => {
	let boxAppUserId = req.user[BoxOptions.boxAppUserIdFieldName];
	if (!boxAppUserId) {
		res.redirect('/');
	}
	let rootFolder = req.params.id || '0';
	let appUserClient = await BoxService.getUserClient(boxAppUserId);
	let accessToken = await BoxService.generateUserToken(boxAppUserId);
	res.render('pages/user', {
		user: req.user,
		accessToken: accessToken.accessToken,
		rootFolder: rootFolder,
		title: "Box Skeleton App",
		domain: AppConfig.domain
	});
}