/* jshint esnext:true */

"use strict";
var vDOM = require('./virtual-dom.js');
import Parcel from './parcel.js';

var EventEmitter = require('events').EventEmitter,
	_ = require('lodash');


var simpleEventListener = function (listener, ev) {
		vDOM.redrawPending();
		(typeof listener == 'string' ? this[listener] : listener).call(this, ev);
		vDOM.redrawReady();
	},
	pickyEventListener = function (cbOrSel, ev) {
		vDOM.redrawPending();
		_.each(cbOrSel, (listener, cssSel) => {
			if (ev.target.matches(cssSel)) {
				(typeof listener == 'string' ? this[listener] : listener).call(this, ev);
			}
		});
		vDOM.redrawReady();
	};

export default class ParcelEv extends Parcel {
	constructor(config) {
		super(config);
		this._cfgEvts = config.EVENTS || {};
		this._eventsToDetach = {};
		EventEmitter.call(this);
		_.merge(this,EventEmitter.prototype);
	}
	preView() {
		var self = this,
			listener;

		_.each(self._cfgEvts, (cbOrSel, eventType) => {
			switch (typeof cbOrSel) {
			case 'function':
			case 'string':
				listener = simpleEventListener.bind(self, cbOrSel);
				this._eventsToDetach[eventType] = listener;
				self._pNode.node.addEventListener(eventType, listener);
				break;
			case 'object':
				listener = pickyEventListener.bind(self, cbOrSel);
				this._eventsToDetach[eventType] = listener;
				self._pNode.node.addEventListener(eventType, listener);
				break;
			}

		});
		super.preView.apply(self, arguments);
	}
	postView() {
		_.each(this._eventsToDetach, (listener, eventType) => {
			this._pNode.node.removeEventListener(eventType, listener);
		});
		super.postView.apply(this, arguments);
	}
	destructor () {
		_.each(this._eventsToDetach,  (listener, type) => {
			this._pNode.node.removeEventListener(type, listener);
		});
		super.destructor();
	}
}