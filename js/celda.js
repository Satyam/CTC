/* jshint node:true , esnext:true*/

"use strict";
import ParcelEv from './component/parcelEv.js';
import Senal from './senal.js';
var _ = require('lodash');
import {ANCHO_CELDA, CENTRO_CELDA, X,  Y} from './common.js';

class Celda extends ParcelEv {
	constructor (config, coords) {
		super({
			EVENTS: {
				click: (ev) => this.emit('click',this)
			}
		});

		coords = coords.split(',');
		this.x = parseInt(coords[0], 10);
		this.y = parseInt(coords[1], 10);

		this.senales = {};
		this.containerType = 'g';
		_.merge(this, config);

		this.attributes = {
			transform: `translate(${this.x * ANCHO_CELDA},${this.y * ANCHO_CELDA})`
		};

		_.each(this.senales, (config, dir) => {
			config.dir = dir;
			this.senales[dir] = new Senal(config);
		});
	}
	view (v, content) {
		return [].concat(
			v('rect', {
				x: 0,
				y: 0,
				width: ANCHO_CELDA,
				height: ANCHO_CELDA,
				className: (this.seleccionada? 'seleccionada':'oculta')
			}),
			content,
			v('text', {
				x: 5,
				y: 95
			}, this.x + ',' + this.y),
			_.values(this.senales)
		);
	}
	toJSON () {
		return {
			coords: this.coords,
			tipo:this.tipo,
			x:this.x,
			y:this.y
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
		className: estilo || ''
	});
};

var Celdas =  {
	linea: class Linea extends Celda {
		constructor(config, coords) {
			super(config, coords);
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
		constructor(config, coords) {
			super(config, coords);
		}

		get desviado () {
			return this._desviado;
		}

		set desviado (value) {
			value = !!value;
			if (value != this._desviado) {
				this._desviado = value;
				this.emit('cambio', this, value);
			}
		}
		view (v) {
			return super.view(v,[
				lineaA(v, this.punta),
				lineaA(v, this.normal, this._desviado ? 'off' : null),
				lineaA(v, this.invertido, !this._desviado ? 'off' : null)
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
				desviado: this._desviado,
				manual: this.manual

			});
			return s;
		}
	},
	paragolpe: class Paragolpe extends Celda {
		constructor(config, coords) {
			super(config, coords);
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
		constructor(config, coords) {
			super(config, coords);
		}
		view (v) {
			return super.view(v,[
				lineaA(v, this.punta),
				lineaA(v, this.centro, this._posicion ?'off':null),
				lineaA(v, this.izq, this._posicion != -1 ?'off':null),
				lineaA(v, this.der, this._posicion != 1 ?'off':null)
			]);
		}

		get posicion () {
			return this._posicion;
		}

		set posicion (value) {
			if (_.isFinite(value)) {
				value = value > 0? 1: (value < 0 ? -1: 0);
				if (value == this._posicion) return;
				let anterior = this._posicion;
				this._posicion = value;
				this.emit('cambio', this, value, anterior);
			}
		}


		toJSON () {
			var s = super.toJSON();
			_.merge(s, {
				geometria: {
					punta: this.punta,
					centro: this.centro,
					izquierda: this.izq,
					derecha: this.der
				},
				posicion: this._posicion,
				manual: this.manual
			});
			return s;
		}
	},
	cruce: class Cruce extends Celda {
		constructor(config, coords) {
			super(config, coords);
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

export default class CeldaFactory {
	constructor (celda, coords) {
		return new Celdas[celda.tipo](celda, coords);
	}
}
