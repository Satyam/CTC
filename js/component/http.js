/* jshint node:true */
/* global window: false */

"use strict";
var vDOM = require('./virtual-dom.js');

var xhr = require('xhr');

var http = function (config, cb) {
	vDOM.redrawPending();
	xhr(config, function (err, res, body) {
		if (err) throw err;
		cb(res, body);
		vDOM.redrawReady();
	});
};

http.get = function (url, cb) {
	http({
		json: true,
		url: url
	}, cb);
};

http.post = function (url, body, cb) {
	http({
		method: 'POST',
		json: true,
		url: url,
		body: body

	}, cb);
};
http.put = function (url, body, cb) {
	http({
		method: 'PUT',
		json: true,
		url: url,
		body: body

	}, cb);
};
http.del = function (url, cb) {
	http({
		method: 'DEL',
		json: true,
		url: url
	}, cb);
};



module.exports =  http;
