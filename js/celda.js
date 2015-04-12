/* jshint node:true , esnext:true*/

"use strict";
import ParcelEv from './component/parcelEv.js';

var _ = require('lodash');

var ANCHO_CELDA = 100,
	CENTRO_CELDA = ANCHO_CELDA / 2;

var X = {
		N: CENTRO_CELDA,
		NE: ANCHO_CELDA,
		E: ANCHO_CELDA,
		SE: ANCHO_CELDA,
		S: CENTRO_CELDA,
		SW: 0,
		W: 0,
		NW: 0
	},
	Y = {
		N: 0,
		NE: 0,
		E: CENTRO_CELDA,
		SE: ANCHO_CELDA,
		S: ANCHO_CELDA,
		SW: ANCHO_CELDA,
		W: CENTRO_CELDA,
		NW: 0
	};

class Celda extends ParcelEv {
	constructor (config) {
		super({
			EVENTS: {
				click: (ev) => this.emit('click',this)
			}
		});
		this.enclavamientos = [];
		this.containerType = 'g';
		_.merge(this, config);
		this.attributes = {
			transform: `translate(${config.x * ANCHO_CELDA},${config.y * ANCHO_CELDA})`
		};
	}
	view (v, content) {
		return [].concat(
			v('rect', {
				x: 0,
				y: 0,
				width: ANCHO_CELDA,
				height: ANCHO_CELDA,
				class: (this.seleccionada? 'seleccionada':'oculta')
			}),
			content,
			v('text', {
				x: CENTRO_CELDA,
				y: CENTRO_CELDA
			}, this.x + ' ' + this.y)
		);
	}
	toJSON () {
		return {
			coords: this.coords,
			tipo:this.tipo,
			x:this.x,
			y:this.y,
			enclavamientos: this.enclavamientos
		};
	}
	toString () {
		return JSON.stringify(this.toJSON(), null, 2);
	}
	get coords () {
		return this.x + ',' + this.y;
	}

}

var lineaA = function (v, dest, estilo) {
	return v('line', {
		x1: CENTRO_CELDA,
		y1: CENTRO_CELDA,
		x2: X[dest],
		y2: Y[dest],
		class: estilo || ''
	});
};

export default {
	linea: class Linea extends Celda {
		constructor(config) {
			super(config);
		}
		view (v) {
			return super.view(v,[
				lineaA(v, this.desde),
				lineaA(v, this.hacia)
			]);
		}
		toJSON () {
			var s = super.toJSON();
			_.merge(s, {
				geometria: {
					desde:this.desde,
					hacia:this.hacia
				}
			});
			return s;
		}
	},
	desvio: class Desvio extends Celda {
		constructor(config) {
			super(config);
		}
		view (v) {
			return super.view(v,[
				lineaA(v, this.punta),
				lineaA(v, this.normal, this.desviado ? 'off' : null),
				lineaA(v, this.invertido, !this.desviado ? 'off' : null)
			]);
		}
		toJSON () {
			var s = super.toJSON();
			_.merge(s, {
				geometria: {
					punta: this.punta,
					normal: this.normal,
					invertido: this.invertido
				},
				desviado: this.desviado,
				manual: this.manual

			});
			return s;
		}
	},
	paragolpe: class Paragolpe extends Celda {
		constructor(config) {
			super(config);
		}
		view (v) {
			return super.view(v, [
				lineaA(v, this.desde),
				v('circle', {
					cx: CENTRO_CELDA,
					cy: CENTRO_CELDA,
					r: ANCHO_CELDA / 10
				})
			]);
		}
		toJSON () {
			var s = super.toJSON();
			_.merge(s, {
				geometria: {
					desde: this.desde
				}
			});
			return s;
		}
	},
	triple: class Triple extends Celda {
		constructor(config) {
			super(config);
		}
		view (v) {
			return super.view(v,[
				lineaA(v, this.punta),
				lineaA(v, this.normal, this.posicion ?'off':null),
				lineaA(v, this.izq, this.posicion != -1 ?'off':null),
				lineaA(v, this.der, this.posicion != 1 ?'off':null)
			]);
		}
		toJSON () {
			var s = super.toJSON();
			_.merge(s, {
				geometria: {
					punta: this.punta,
					normal: this.normal,
					izquierda: this.izq,
					derecha: this.der
				},
				posicion: this.posicion?(this.posicion == -1?'izquierda':'derecha'):'normal',
				manual: this.manual
			});
			return s;
		}
	},
	cruce: class Cruce extends Celda {
		constructor(config) {
			super(config);
		}
		view (v) {
			return super.view(v, [
				lineaA(v, this.l1.desde),
				lineaA(v, this.l1.hacia),
				lineaA(v, this.l2.desde),
				lineaA(v, this.l2.hacia)
			]);
		}
		toJSON () {
			var s = super.toJSON();
			_.merge(s, {
				geometria: {
					linea1: {
						desde:this.l1.desde,
						hacia:this.l1.hacia
					},
					linea2: {
						desde:this.l2.desde,
						hacia:this.l2.hacia
					}
				}
			});
			return s;
		}
	}
};
