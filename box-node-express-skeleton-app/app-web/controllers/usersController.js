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
	let folder = yield appUserClient.folders.getAsync(rootFolder, null);
	let path = trackFolderPath(folder);
	let foldersAndFiles = splitFilesAndFolders(folder);
	let accessToken = yield BoxService.generateUserToken(boxAppUserId);
	req.user.accessToken = accessToken.accessToken;
	res.render('pages/user', {
		user: req.user,
		title: "Box Skeleton App",
		currentFolder: rootFolder,
		folders: foldersAndFiles.folders,
		files: foldersAndFiles.files,
		path: path,
		domain: AppConfig.domain
	});
});

module.exports.addFolder = asyncFunc(function* (req, res, next) {
	let boxAppUserId = req.user.app_metadata[BoxOptions.boxAppUserIdFieldName];
	if (!boxAppUserId) {
		res.redirect('/login');
	}
	let appUserClient = yield BoxService.getUserClient(boxAppUserId);
	let folderName = req.body.folderName;
	let rootFolder = req.params.id || '0';
	try {
		yield appUserClient.folders.createAsync(rootFolder, folderName);
		res.redirect(`/user/${rootFolder}`);
	} catch (e) {
		if (e.response.body) {
			res.render('pages/error', {
				title: e.response.body.code,
				message: e.response.body.message,
				error: e.response.body,
				returnUrl: `/user/${rootFolder}`
			});
		}
		res.render('pages/error', {
			title: "Something went wrong",
			message: "Please use the back button",
			error: { status: 500 }
		})
	}
});

function trackFolderPath(folder) {
	let path = [];
	let sequence;
	if (folder && folder.path_collection && folder.path_collection.total_count > 0) {
		folder.path_collection.entries.forEach(function (item) {
			if (item.sequence_id === null) {
				sequence = 0;
			} else {
				sequence = parseInt(item.sequence_id) + 1;
			}
			path[sequence] = {
				name: item.name,
				id: item.id
			}
		});
	}
	path.push({ name: folder.name, id: folder.id });
	return path;
}

function splitFilesAndFolders(folder) {
	let folders = [];
	let files = [];
	if (folder && folder.item_collection && folder.item_collection.total_count > 0) {
		folder.item_collection.entries.forEach(function (item) {
			if (item.type === "folder") {
				folders.push(item);
			} else if (item.type === "file") {
				let nameAndExt = item.name.split('.');
				if (nameAndExt.length === 2) {
					item.onlyName = nameAndExt[0];
					item.extension = nameAndExt[1];
				}
				files.push(item);
			}
		});
	}
	return { folders, files };
}