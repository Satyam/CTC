/* jshint node:true , esnext:true*/
/* global Mimico:true */
"use strict";

var _ = require('lodash');

var prioridades = [
	'verde',
	'precaucion',
	'alto'
];

class Enclavamiento {
	constructor (config, sector) {
		this.sector = sector;
	}

}

var Enclavamientos = {
	apareados: class Apareados extends Enclavamiento {
		constructor (config, sector) {
			super(config, sector);
			this._celdas = [];
			this._boundCambioListener = this.onCambio.bind(this);
			config.celdas.forEach((coord) => {
				this._celdas.push(sector.getCelda(coord).on('cambio', this._boundCambioListener));
			});
		}
		onCambio (celda, desviado) {
			celda._enProceso = true;
			this._celdas.forEach((celdaDest) => {
				if ((celdaDest.desviado || false) == desviado) return; // nothing to do

				if (celdaDest.manual) {
					Mimico.teletipo.agregar(this.sector.descr, celdaDest.coords, 'Cambio automático propagado a celda en manual desde ' + celda.coords);
					return;
				}

				if (celdaDest._enProceso) {
					Mimico.teletipo.agregar(this.sector.descr, celdaDest.coords, 'Lazo infinito de enclavamiento desde ' + celda.coords);
					return;
				}

				celdaDest._enProceso = true;
				celdaDest.desviado = desviado;
				celdaDest._enProceso = false;
			});
			celda._enProceso = false;
		}
		destructor () {
			this._celdas.forEach((celda) => {
				celda.removeEventListener('cambio',this._boundCambioListener);
			});
		}
	},
	senalCambio: class SenalCambio extends Enclavamiento {
		constructor (config, sector) {
			super(config, sector);
			this.senal = sector.getSenal(config.senal);
			this._boundCambioListener = this.onCambio.bind(this);
			this.celda = sector.getCelda(config.celda).on('cambio', this._boundCambioListener);
			switch (this.celda.tipo) {
			case 'cambio':
				this.normal = config.normal;
				this.desviado = config.desviado;
				break;
			case 'triple':
				this.izq = config.izq;
				this.centro = config.centro;
				this.der = config.der;
				break;

			}
		}
		onCambio (celda, estado) {
			var conjunto = {};

			switch (celda.tipo) {
			case 'cambio':
				conjunto = this[estado ? 'desviado' : 'normal'];
				break;
			case 'triple':
				conjunto = this[['izq' , 'centro', 'der'][estado+1]];
				break;

			}
			_.each(conjunto, (color, luz) => {
				//if (prioridades.indexOf(color) > prioridades.indexOf(senal[luz])) {
					this.senal[luz].estado = color;
				//}
			});
		}
		destructor () {
			this.celda.removeEventListener('cambio', this._boundCambioListener);
		}

	}
};

export default class EnclavamientoFactory {
	constructor (enclavamiento, sector) {
		return new Enclavamientos[enclavamiento.tipo](enclavamiento, sector);
	}
}
