/* jshint node:true , esnext:true*/
/* global CTC:false*/
"use strict";
import Parcel from './component/parcel.js';
import enclavamientos from './enclavamientos.js';
import Radios from './component/radio.js';

var v;

class Estado extends Parcel {
	constructor(celdas, celda) {
		super();
		this.celdas = celdas;
		this.celda = celda;
	}
	view(vNode) {
		v = vNode;
		return v('pre', JSON.stringify(this.celda, null, 2));
	}
}

export default {
	linea: class Linea extends Estado {},
	desvio: class Desvio extends Estado {
		constructor (celdas, celda) {
			super(celdas, celda);
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
			enclavamientos(celda, this.celdas);
			celda.manual = manual;
		}
			
		cambiarManual (value) {
			this.celda.manual = value == 'manual';
		}

	},
	paragolpe: class Paragolpe extends Estado {},

	triple: class Triple extends Estado {
		constructor (celdas, celda) {
			super(celdas, celda);
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
	cruce: class Curce extends Estado {}
};

		
