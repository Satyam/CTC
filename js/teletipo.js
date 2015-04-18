/* jshint node:true , esnext:true*/

"use strict";
import Parcel from './component/parcel.js';

export default class Teletipo extends Parcel {
	constructor () {
		super();
		this.lista = [];
		this.containerType = 'table';
		this.className = 'teletipo pure-table';
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
		return [
			v('thead', v('tr', [
				v('th', 'Hora'),
				v('th', 'Sector'),
				v('th', 'Celda'),
				v('th', 'Novedad')
			])),
			v('tbody', this.lista.map((item, index) => {
				return v(
					'tr',
					{
						class: (index & 1 ? 'pure-table-odd' : 'pure-table-even')
					}, [
						v('td',item.timestamp.toLocaleTimeString()),
						v('td', item.sector),
						v('td', item.idCelda),
						v('td', item.mensaje)
					]
				);
			}))
		];
	}
}
