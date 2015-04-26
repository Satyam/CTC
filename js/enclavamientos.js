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
		_.merge(this, config);
	}

	toJSON () {
		return {
			tipo: this.tipo
		};
	}
	toString () {
		return JSON.stringify(this.toJSON(), null, 2);
	}

	destructor () {
		delete this.sector;
	}
}

var Enclavamientos = {
	apareados: class Apareados extends Enclavamiento {
		constructor (config, sector) {
			super(config, sector);
			this._boundCambioListener = this.onCambio.bind(this);
			config.celdas.forEach((coord) => {
				sector.getCelda(coord).on('cambio', this._boundCambioListener);
			});
		}
		onCambio (celda, desviado) {
			celda._enProceso = true;
			this.celdas.forEach((coord) => {
				let celdaDest = this.sector.getCelda(coord);
				if (celda === celdaDest) return;
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
		toJSON () {
			return _.merge(super.toJSON(), {
				celdas: this.celdas
			});
		}
		destructor () {
			super.destructor();
			this.celdas.forEach((coord) => {
				this.sector.getCelda(coord).removeEventListener('cambio',this._boundCambioListener);
			});
		}
	},
	senalCambio: class SenalCambio extends Enclavamiento {
		constructor (config, sector) {
			super(config, sector);
			this._boundCambioListener = this.onCambio.bind(this);
			sector.getCelda(config.celda).on('cambio', this._boundCambioListener);
		}
		onCambio (celda, estado) {
			var senal = this.sector.getSenal(this.senal);
			_.each(this[estado ? 'desviado' : 'normal'], (color, luz) => {
				//if (prioridades.indexOf(color) > prioridades.indexOf(senal[luz])) {
					senal[luz].estado = color;
				//}
			});
		}
		toJSON () {
			return _.merge(super.toJSON(), {
				celda: this.celda,
				senal: this.senal,
				normal: this.normal,
				desviado: this.desviado
			});
		}
		destructor () {
			super.destructor();
			this.celda.removeEventListener('cambio', this._boundCambioListener);
		}

	},
	senalTriple: class SenalTriple extends Enclavamiento {
		constructor (config, sector) {
			super(config, sector);
			this._boundCambioListener = this.onCambio.bind(this);
			sector.getCelda(config.celda).on('cambio', this._boundCambioListener);
		}
		onCambio (celda, estado) {
			var senal = this.sector.getSenal(this.senal);

			_.each(this[['izq' , 'centro', 'der'][estado+1]], (color, luz) => {
				//if (prioridades.indexOf(color) > prioridades.indexOf(senal[luz])) {
					senal[luz].estado = color;
				//}
			});
		}
		toJSON () {
			return _.merge(super.toJSON(), {
				celda: this.celda,
				senal: this.senal,
				izq: this.izq,
				centro: this.centro,
				der: this.der
			});
		}
		destructor () {
			super.destructor();
			this.celda.removeEventListener('cambio', this._boundCambioListener);
		}

	}
};

export default class EnclavamientoFactory {
	constructor (enclavamiento, sector) {
		return new Enclavamientos[enclavamiento.tipo](enclavamiento, sector);
	}
}
