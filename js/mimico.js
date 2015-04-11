/* jshint node:true, esnext:true */
/* global window:false */


var vdom = require('./component/virtual-dom.js');

import Parcel from './component/parcel.js';
import Sector from './sector.js';

class Mimico extends Parcel {
	constructor(config) {
		super(config);
		this.solapas = [ 
			new Sector({sector: 'constitucion'})
		];
		this.errores = ['a','b','c'];
	}
	view(v) {
		return [
			v('div.solapas', this.solapas),
			v('div.teletipo', v('ul', this.errores.map(function (err, index) {
				return v('li', {
					class: (index & 1 ? 'odd' : 'even')
				}, err);
			})))		
		];
	}

}

vdom.rootApp(Mimico);
