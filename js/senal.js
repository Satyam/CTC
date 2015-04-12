/* jshint node:true , esnext:true*/

"use strict";
import Parcel from './component/parcel.js';
var _ = require('lodash');
import {ANCHO_CELDA, CENTRO_CELDA, ANG} from './common.js';

export default class Señal extends Parcel {
	constructor (config) {
		super();
		this.containerType = 'g';
		this.className = 'señal';
		_.merge(this, config);
	}

	set dir (value) {
		this._dir = value;
		this.attributes = {
			transform: `rotate(${ANG[value]}, ${CENTRO_CELDA}, ${CENTRO_CELDA})`
		};
	}
	get dir () {
		return this._dir;
	}


	view (v) {
		return [
			this.secundaria?v('circle.secundaria', { cx:75, cy:40, r:5, class:this.secundaria}):'',
			v('circle.primaria', { cx:87,  cy:40, r:5, class:this.primaria}),
			v('line', { x1:92, y1:40, x2:97,  y2:40}),
			v('line', { x1:97, y1:35, x2:97,  y2:45})
		];
	}
}
