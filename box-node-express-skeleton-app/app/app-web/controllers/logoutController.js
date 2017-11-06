'use strict';
const config = require('config');
const BoxOptions = config.get('BoxOptions');
let Box = require('../../box-service/boxClientService');

module.exports.main = async (req, res, next) => {
  if(req.query && req.query.accessToken) {
    let boxAppUserId = req.user[BoxOptions.boxAppUserIdFieldName];
    await Box.revokeUserToken(req.query.accessToken, boxAppUserId);
  }
  res.redirect('login');
}