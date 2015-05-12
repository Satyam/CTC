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
			tipo:this.tipo,
			coords: this.coords,
			x:this.x,
			y:this.y,
			senales: _.mapValues(this.senales, (senal) => senal.toJSON())
		};
	}
	toString () {
		return JSON.stringify(this.toJSON(), null, 2);
	}
	get coords () {
		return this.x + ',' + this.y;
	}

	destructor () {
		_.each(this.senales, senal => senal.destructor());
		super.destructor();
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
			return _.merge(super.toJSON(), {
				desde:this.desde,
				hacia:this.hacia
			});
		}
	},
	cambio: class Cambio extends Celda {
		constructor(config, coords) {
			super(config, coords);
		}

		get desviado () {
			return this._desviado || false;
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
			return _.merge(super.toJSON(), {
				punta: this.punta,
				normal: this.normal,
				invertido: this.invertido,
				desviado: this._desviado,
				manual: this.manual

			});
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
			return _.merge(super.toJSON(), {
				desde: this.desde
			});
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
			return this._posicion || 0;
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
			return _.merge(super.toJSON(), {
				punta: this.punta,
				centro: this.centro,
				izq: this.izq,
				der: this.der,
				posicion: this._posicion,
				manual: this.manual
			});
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
				l1: {
					desde:this.l1.desde,
					hacia:this.l1.hacia
				},
				l2: {
					desde:this.l2.desde,
					hacia:this.l2.hacia
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


/**
@module CTC
@submodule configCelda
*/
/**
Contiene la configuración de una celda dentro de un sector.

Cada celda contendrá un tramo de vía que podrá ser de varios tipos (ver [tipo](#property_tipo)).

Todas las vías pasan por el centro de la celda
y se extienden a los extremos de la misma en 8 direcciones posibles
designadas según los puntos cardinales: `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`
donde conectan con las vías de la celda vecina.

Una celda puede tener señales, una por cada dirección.
Ver [ConfigSenal](ConfigSenal.html).
Todas las señales apuntan tal que sean visibles al tren que entra a la celda.



@class ConfigCelda
@static
*/
/**
Define el tipo de vías que contiene esta celda.  Puede ser uno de:

* `linea`: Un tramo de vía simple, requiere [desde](#property_desde) y [hasta](#property_hasta)
* `cambio`: Un cambio, require [punta](#property_punta), [normal](#property_normal) e [invertido](#property_invertido)
* `cruce`: Dos tramos de vía que se cruzan pero no se conectan, requiere [l1](#property_l1) y [l2](#property_l2)
* `paragolpe`: Fin de un trazado, requiere [desde](#property_desde)
* `triple`: Un cambio con tres alternativas, requiere [punta](#property_punta), [izq](#property_izq), [centro](#property_centro) y [der](#property_der)

@property tipo {String}
*/
/**
Una de las direcciones en que se extiende la vía contenida en este sector.
Se usa en las celdas de [tipo](#property_tipo) `linea`, `cruce` y `paragolpe`.
Puede ser uno de `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`

@property desde {String}
*/
/**
Una de las direcciones en que se extiende la vía contenida en este sector.
Se usa en las celdas de [tipo](#property_tipo) `linea` y `cruce`.
Puede ser uno de `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`

@property hasta {String}
*/
/**
Una de las direcciones en que se extiende la vía contenida en este sector.
En los cambios, define el tronco común del que se abren las alternativas.
Se usa en las celdas de [tipo](#property_tipo) `cambio` y `triple`.
Puede ser uno de `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`

@property punta {String}
*/
/**
Una de las direcciones en que se extiende la vía contenida en este sector.
En los cambios, habitualmente, define el lado que sale recto.
Se usa en las celdas de [tipo](#property_tipo) `cambio`.
Puede ser uno de `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`

@property normal {String}
*/
/**
Una de las direcciones en que se extiende la vía contenida en este sector.
En los cambios, habitualmente, define el lado que sale en curva.
Se usa en las celdas de [tipo](#property_tipo) `cambio`.
Puede ser uno de `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`

@property invertido {String}
*/
/**
Una de las direcciones en que se extiende la vía contenida en este sector.
En los cambios triples, habitualmente, define el lado que sale en curva a la izquierda.
Se usa en las celdas de [tipo](#property_tipo) `triple`.
Puede ser uno de `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`

@property izq {String}
*/
/**
Una de las direcciones en que se extiende la vía contenida en este sector.
En los cambios triples, habitualmente, define el lado que sale recto opuesto a la [punta](#property_punta).
Se usa en las celdas de [tipo](#property_tipo) `triple`.
Puede ser uno de `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`

@property centro {String}
*/
/**
Una de las direcciones en que se extiende la vía contenida en este sector.
En los cambios triples, habitualmente, define el lado que sale en curva a la derecha.
Se usa en las celdas de [tipo](#property_tipo) `triple`.
Puede ser uno de `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`

@property der {String}
*/
/**
Define una de las vías que se cruzan en esta celda.
Contendrá un objecto con propiedades [desde](#property_desde) y [hasta](#property_hacia) como un trampo de vía normal
Se usa en las celdas de [tipo](#property_tipo) `cruce`.

@property l1 {Object}
*/
/**
Define una de las vías que se cruzan en esta celda.
Contendrá un objecto con propiedades [desde](#property_desde) y [hasta](#property_hacia) como un trampo de vía normal
Se usa en las celdas de [tipo](#property_tipo) `cruce`.

@property l2 {Object}
*/
/**
Define el conjunto de las señales contenidas en esta celda.
Ver [ConfigSenal](ConfigSenal.html).
Cada señal está indexada por la dirección del tramo de vía a cuyo lado se encuentra.

@property senales {Object}
*/
