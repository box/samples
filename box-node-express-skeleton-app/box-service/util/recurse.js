'use strict';
const _ = require('lodash');
const autoPageWithOffset = require('./autoPage').autoPageWithOffset;

var fileCollection = [];
var folderCollection = [];
var nextFolder;

var fileCollectionIndex = [];
var folderCollectionIndex = [];
var nextFolderIndex;
var folderPathIndex = {};
var rootFolderIndex;


function recurseFolders(client, id, options, callback) {
	id = id || "0";
	autoPageWithOffset(client, "folders", "getItems", id, options, function (err, response) {
		response.forEach(function (item) {
			if (item.type === "folder") {
				folderCollectionIndex.push(item);
				folderCollection.push(item);
			} else if (item.type === "file") {
				fileCollection.push(item);
			}
		});
		if (folderCollection.length > 1) {
			nextFolder = folderCollection.shift();
			recurseFolders(client, nextFolder.id, options, callback);
		} else {
			callback(null, { files: fileCollection, folders: folderCollectionIndex });
		}
	});

}

function findFolderFromFolderPath(obj, folderPath) {
	var path = folderPath.split('.');
	var folder;
	if (path.length === 1) {
		return obj;
	}
	if (path.length > 1) {
		path.shift();
		var findObject = obj.folders;
		path.forEach(function (val, index, arr) {
			var match = _.find(findObject, function (folder) {
				return folder.id == val;
			});
			if ((match && index == arr.length - 1) || arr.length === 1) {
				folder = match;
			} else {
				findObject = match.folders;
			}
		});
		return folder;
	}
}

function recurseFoldersForFolderTree(client, id, options, folderTree, folders, callback) {
	id = id || "0";
	folders = folders || [];
	var currentFolderPath = folderPathIndex[id];
	var currentFolder = findFolderFromFolderPath(folderTree, currentFolderPath);
	autoPageWithOffset(client, "folders", "getItems", id, options, function (err, response) {
		response.forEach(function (item) {
			if (item.type === "folder") {
				var itemFolderPath = `${currentFolderPath}.${item.id}`;
				folderPathIndex[item.id] = itemFolderPath;
				item.folderPath = itemFolderPath;
				item.folders = [];
				item.files = [];
				currentFolder.folders.push(item);
				folders.push(item.id);
			} else if (item.type === "file") {
				item.folderPath = currentFolderPath;
				currentFolder.files.push(item);
			}
		});
		if (folders.length > 0) {
			recurseFoldersForFolderTree(client, folders.shift(), options, folderTree, folders, callback);
		} else {
			callback(null, folderTree);
		}
	});
}

function getFolderTree(client, id, options, callback) {
	id = id || "0";
	if (!options || !options.fields) {
		options = options || {};
		options.fields = "id,name,parent";
	} else {
		options.fields += ",parent";
	}
	client["folders"]["get"](id, options, function (err, response) {
		var rootFolder = {
			id: response.id,
			name: response.name,
			etag: response.etag,
			parent: {},
			folders: [],
			files: []
		}
		folderPathIndex[id] = id;
		recurseFoldersForFolderTree(client, response.id, options, rootFolder, null, function (err, folderTree) {
			callback(null, folderTree);
		})
	});
}

module.exports = {
	getAllFiles: recurseFolders,
	getFolderTree: getFolderTree
};