/* jshint node:true , esnext:true*/

"use strict";
import Parcel from './component/parcel.js';
var _ = require('lodash');
import {ANCHO_CELDA, CENTRO_CELDA, ANG} from './common.js';

export default class Senal extends Parcel {
	constructor (config) {
		super();
		this.containerType = 'g';
		this.className = 'senal';
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
/*

		<g style="stroke-width:2" transform="rotate(225,50,50)">
			<line x1="97" y1="38" x2="83" y2="38" />
			<line x1="97" y1="33" x2="97" y2="43" />
			<circle cx="87" cy="38" r="5" fill="green"/>
			<!--circle cx="87" cy="33" r="5" fill="yellow"/> der
			<circle cx="87" cy="43" r="5" fill="red"/-->
		</g>

		*/

	view (v) {
		var r = 5,
			y = 38,
			xTope = 95,
			x1 = xTope - 2 * r,
			x2 = x1 -2* r + 2,
			s = [
				v('line', { x1:xTope, y1:y, x2:x2 + r,  y2:y}),
				v('line', { x1:xTope, y1:y-r, x2:xTope,  y2:y+r})
			];
		if (this.izq || this.der) {
			s.push(v('circle.primaria', { cx:x2,  cy:y, r:r, className:this.primaria.estado}));
			if (this.izq) {
				s.push(v('circle.izq', { cx:x1,  cy:y+r, r:r, className:this.izq.estado}));
			}
			if (this.der) {
				s.push(v('circle.der', { cx:x1,  cy:y-r, r:r, className:this.der.estado}));
			}
		} else {
			s.push(v('circle.primaria', { cx:x1,  cy:y, r:r, className:this.primaria.estado}));
		}
		return s;
	}
}
