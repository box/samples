'use strict';
const config = require('config');
const BoxOptions = config.get('BoxOptions');

let Box = require('../../box-service/boxClientService');

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