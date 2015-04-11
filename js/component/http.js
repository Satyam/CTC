/* jshint node:true */
/* global window: false */

"use strict";
var vDOM = require('./virtual-dom.js');

var xhr = require('xhr');

module.exports =  function (config, cb) {
	vDOM.redrawPending();
	xhr(config, function (err, res, body) {
		if (err) throw err;
		cb(res, body);
		vDOM.redrawReady();
	});
};
	