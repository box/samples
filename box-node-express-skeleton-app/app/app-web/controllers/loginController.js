'use strict';
const config = require('config');
const BoxOptions = config.get('BoxOptions');
const Auth0Config = config.get('Auth0Config');

let Box = require('../../box-service/boxClientService');
let loginEnv = {
	AUTH0_CLIENT_ID: Auth0Config.clientId,
	AUTH0_DOMAIN: Auth0Config.domain,
	AUTH0_CALLBACK_URL: Auth0Config.callbackUrl || 'http://localhost:3000/callback'
}

module.exports.main = (req, res, next) => {
	res.render('pages/login', { title: "Box Platform", env: loginEnv });
}

module.exports.callback = async (req, res, next) => {
	console.log(req.user);
	let boxAppUserId = await Box.checkForExistingUserByExternalId(req.user.id);
	if (!boxAppUserId) {
		let appUser = await Box.createAppUser(req.user.displayName, req.user.id);
		boxAppUserId = appUser.id;
	}
	req.user[BoxOptions.boxAppUserIdFieldName] = boxAppUserId;
	res.redirect('/user');
}