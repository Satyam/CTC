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

		this.className = 'lista-sectores';

		http.get('data/lista.json')
		.then(response => {
			this.lista = response.body;
		})
		.catch(response => {
			global.window.alert(response.message || (response.statusCode + ': ' + response.body));
		});
	}

	onClick (ev) {
		ev.preventDefault();
		ev.stopPropagation();
		this.emit('click', ev.target.hash.substr(1));
	}

	view (v) {
		var index = 0;
		return v('table.pure-table', _.map(this.lista, ( item, name) => {
			return v(
				'tr',
				{className:(index++ & 1) ? 'pure-table-even':'pure-table-odd'},
				[
					v('td', v('a', { href:'#' + name}, item.nombre)),
					v('td', item.descr)
				]
			);
		}));
	}
}
