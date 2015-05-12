/* jshint esnext:true */

"use strict";
/**
@module Parcela
@submodule parcelEv
*/

var vDOM = require('./virtual-dom.js');
import Parcel from './parcel.js';

var EventEmitter = require('events').EventEmitter,
	_ = require('lodash');


var simpleEventListener = function (listener, ev) {
		vDOM.redrawPending();
		vDOM.redrawReady((typeof listener == 'string' ? this[listener] : listener).call(this, ev) === false);
	},
	pickyEventListener = function (cbOrSel, ev) {
		var target = ev.target;
		vDOM.redrawPending();
		vDOM.redrawReady(!_.all(cbOrSel, (listener, cssSel) => {
			if (target.matches(cssSel)) {
				return (typeof listener == 'string' ? this[listener] : listener).call(this, ev) === false;
			}
			return false; // Otherwise, cancel the redraw
		}));
	};


/**
Subclass of [Parcel](Parcel.html) capable of listening and
relaying DOM events.

Besides the configuration attributes used by [Parcel](Parcel.html),
`ParcelEv` accepts the `EVENTS` property which is a hash map of DOM events to listen to.

Each entry into `EVENTS` must contain the name of a DOM event (i.e.: `click`, `keypress`)
followed either by a listener function or a further object.

* A function can be given as a reference or as a string with the name of the method within this class
  that handles it.  The function will be called whenever that event is fired.
* If an object, it should be a hash map of CSS selectors and functions.
  This limits the kind of DOM element or elements whose events you want to listen to.
  The function will then be called only when the element generating it satisfies the condition.

`ParcelEv` will queue a request to redraw the page unless all of the listeners agree to cancel it by all returning exactly `false`.

`ParcelEv` is also an `EventEmitter` thus, it will have methods to deal with custom events.
See: [NodeJS EventEmitter](https://nodejs.org/docs/latest/api/events.html)

@example
      class MyDialogBox extends ParcelEv {
	  		constructor(config) {
				super({
					EVENTS: {
						// Listening to keypresses anywhere within this Parcel
						'keypress': this.onKeyPress
						// Listening to clicks on specific elements within the Parcel
						'click': {
							// only on a button with the className `ok` on it.
							'button.ok': this.onOk,
							// The function reference is given as a string which translates to `this.onCancel`
							'button.cancel':'onCancel'
						}
					},
					// Other configuration options will be passed to the Parcel constructor
					className: 'dialog'
				});
			}
			// Methods handling the functions, will receive the original DOM event object.
			// Their `this` will be that of the instance of ParcelEv.
			onKeyPress (ev) {}
			onOk (ev) {}
			onCancel (ev) {}
		}

@class ParcelEv
@extends Parcel
@uses EventEmitter
@constructor
@param [config] {Object}  Initial configuration
*/
export default class ParcelEv extends Parcel {
	constructor(config) {
		super(config);
		this._cfgEvts = (typeof config == 'object'?config.EVENTS || {}:{});
		this._eventsToDetach = {};
		EventEmitter.call(this);
		_.merge(this,EventEmitter.prototype);
	}
	/**
	Overrides the original (empty) [preView](Parcel.html#method_preView) to set the event listeners

	@method preView
	*/
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
	/**
	Overrides the original (empty) [postView](Parcel.html#method_postView)
	to detach the event listeners.

	@method postView
	*/
	postView() {
		_.each(this._eventsToDetach, (listener, eventType) => {
			this._pNode.node.removeEventListener(eventType, listener);
		});
		super.postView.apply(this, arguments);
	}

	/**
	Extends the original destructor method so as to detach all the event listeners

	@method destructor
	*/

	destructor () {
		_.each(this._eventsToDetach,  (listener, type) => {
			this._pNode.node.removeEventListener(type, listener);
		});
		super.destructor();
	}
}
