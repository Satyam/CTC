/* jshint node:true, esnext:true */
/* global window:false */


var vdom = require('./component/virtual-dom.js');

import Parcel from './component/parcel.js';
import Sector from './sector.js';
import Teletipo from './teletipo.js';

class Mimico extends Parcel {
	constructor(config) {
		super(config);
		this.solapas = [ 
			new Sector({sector: 'constitucion'})
		];
		Mimico.teletipo = Mimico.teletipo || new Teletipo();
	}
	view(v) {
		return [
			v('div.solapas', this.solapas),
			Mimico.teletipo
		];
	}

}

global.Mimico = Mimico;
vdom.rootApp(Mimico);
