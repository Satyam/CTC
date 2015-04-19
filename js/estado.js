/* jshint node:true , esnext:true*/

"use strict";
import Parcel from './component/parcel.js';
import enclavamientos from './enclavamientos.js';
import Radios from './component/radio.js';

class Estado extends Parcel {
	constructor(sector, celda) {
		super();
		this.sector = sector;
		this.celda = celda;
	}
	view(v) {
		return v('pre', this.celda.toString());
	}
}

var Estados = {
	linea: class Linea extends Estado {},
	desvio: class Desvio extends Estado {
		constructor (sector, celda) {
			super(sector, celda);
			this.desvio = new Radios({
				title:'Desvío',
				selected: celda.desviado?'desviado':'normal',
				opts: [
					{normal: 'Normal'},
					{desviado: 'Desviado'}
				]
			}).on('click', this.cambiar.bind(this));
			this.manual = new Radios({
				title:'Manual',
				selected: celda.manual?'manual':'automatico',
				opts: [
					{manual:'Manual'},
					{automatico: 'Automático'}
				]
			}).on('click', this.cambiarManual.bind(this));
		}
		view (v) {
			return [
				super.view(v),
				this.desvio,
				this.manual
			];
		}
		cambiar (value) {
			var celda = this.celda;
			celda.desviado = value == 'desviado';
			var manual = celda.manual;
			celda.manual = true;
			enclavamientos(celda, this.sector);
			celda.manual = manual;
		}
			
		cambiarManual (value) {
			this.celda.manual = value == 'manual';
		}

	},
	paragolpe: class Paragolpe extends Estado {},

	triple: class Triple extends Estado {
		constructor (sector, celda) {
			super(sector, celda);
			this.desvio = new Radios({
				title:'Desvío',
				selected: '' + (celda.posicion || 0),
				opts: [
					{'-1':'Izquierda'},
					{'0': 'Normal'},
					{'1': 'Derecha'}
				]
			}).on('click', this.cambiar.bind(this));
			this.manual = new Radios({
				title:'Manual',
				selected: celda.manual?'manual':'automatico',
				opts: [
					{manual:'Manual'},
					{automatico: 'Automático'}
				]
			}).on('click', this.cambiarManual.bind(this));
		}
		cambiar (value) {
			this.celda.posicion = parseInt(value,10);
		}
		cambiarManual (value) {
			this.celda.manual = value == 'manual';
		}
		view (v) {
			return [
				super.view(v),
				this.desvio,
				this.manual
			];
		}
	},
	cruce: class Cruce extends Estado {}
};

		
export default class EstadoFactory {
	constructor (sector, celda) {
		return new Estados[celda.tipo](sector, celda);
	}
}
