'use strict';
const ITEM_LIMIT = 100;

function automateItemPaginationWithOffset(client, manager, methodName, id, options, callback) {
	var collection = [];
	options = options || {};
	options.offset = options.offset || 0;
	options.limit = options.limit || ITEM_LIMIT;
	continuePagingWithOffset(client, manager, methodName, id, options, collection, options.offset, callback);
}

function continuePagingWithOffset(client, manager, methodName, id, options, collection, offset, callback) {
	var keepGoing = true;
	options.offset = offset;

	function pagingCallback(err, results) {
		if (err) {
			callback(err);
			return;
		}
		var entries = results.entries || results.item_collection.entries;
		collection = collection.concat(entries);
		offset += options.limit;
		keepGoing = entries.length >= options.limit;
		if (keepGoing) {
			continuePagingWithOffset(client, manager, methodName, id, options, collection, offset, callback);
		} else {
			callback(null, collection);
		}
	}

	if (id) {
		client[manager][methodName](id, options, pagingCallback);
	} else {
		client[manager][methodName](options, pagingCallback);
	}
}

function automateItemPaginationWithMarker(client, manager, methodName, id, options, callback) {
	var collection = [];
	options = options || {};
	options.limit = options.limit || ITEM_LIMIT;
	continuePagingWithMarker(client, manager, methodName, id, options, collection, callback);
}

function continuePagingWithMarker(client, manager, methodName, id, options, collection, callback) {
	var keepGoing = true;
	function pagingCallback(err, results) {
		if (err) {
			callback(err);
			return;
		}
		collection = collection.concat(results.entries);
		keepGoing = (results.next_marker);
		if (keepGoing) {
			options.marker = results.next_marker;
			continuePagingWithMarker(client, manager, methodName, id, options, collection, callback);
		} else {
			callback(null, collection);
		}
	}

	if (id) {
		client[manager][methodName](id, options, pagingCallback);
	} else {
		client[manager][methodName](options, pagingCallback);
	}
}

function automateItemPaginationWithStream(client, manager, methodName, id, options, callback) {
	var collection = [];
	options = options || {};
	options.limit = options.limit || ITEM_LIMIT;
	continuePagingWithStream(client, manager, methodName, id, options, collection, callback);
}

function continuePagingWithStream(client, manager, methodName, id, options, collection, callback) {
	var keepGoing = true;
	function pagingCallback(err, results) {
		if (err) {
			callback(err);
			return;
		}
		collection = collection.concat(results.entries);
		keepGoing = (results.next_stream_position && results.entries.length > 0);
		if (keepGoing) {
			options.stream_position = results.next_stream_position;
			continuePagingWithStream(client, manager, methodName, id, options, collection, callback);
		} else {
			callback(null, collection);
		}
	}

	if (id) {
		client[manager][methodName](id, options, pagingCallback);
	} else {
		client[manager][methodName](options, pagingCallback);
	}
}

module.exports = {
	autoPageWithOffset: automateItemPaginationWithOffset,
	autoPageWithMarker: automateItemPaginationWithMarker,
	autoPageWithStream: automateItemPaginationWithStream
};