/* jshint node:true , esnext:true*/

"use strict";
import Parcel from './component/parcel.js';

export default class Teletipo extends Parcel {
	constructor () {
		super();
		this.lista = [];
		this.containerType = 'ul';
		this.className = 'teletipo';
	}
	agregar (sector, idCelda, mensaje) {
		this.lista.push({
			sector,
			idCelda,
			mensaje,
			timestamp: new Date
		});
	}
	view (v) {
		return this.lista.map((item, index) => {
			return v(
				'li',{
					class: (index & 1 ? 'odd' : 'even')
				},
				`[${item.timestamp.toLocaleTimeString()}] ${item.sector}:${item.idCelda}:  ${item.mensaje}`
			);
		});
	}



}
