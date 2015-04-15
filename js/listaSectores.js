/* jshint node:true, esnext:true */

"use strict";

import ParcelEv from './component/parcelEv.js';
var _ = require('lodash'),
	http = require('./component/http.js');

export default class ListaSectores extends ParcelEv {
	constructor () {
		super({
			EVENTS: {
				click: {
					a: this.onClick
				}
			}
		});

		http.get(
			'data/lista.json',
			(response, body) => {
				if (response.statusCode == 200) {
					this.lista = body;
				}
			}
		);
	}

	onClick (ev) {
		this.emit('click', ev.target.hash.substr(1));
	}

	view (v) {
		return v('table', _.map(this.lista, ( item, name) => {
			return v('tr', [
				v('th', v('a.pure-button', { href:'#' + name}, item.nombre)),
				v('td', item.descr)
			]);
		}));
	}
}
