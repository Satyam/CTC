/* jshint node:true , esnext:true*/

"use strict";
import Parcel from './component/parcel.js';
var _ = require('lodash');
import {ANCHO_CELDA, CENTRO_CELDA, ANG} from './common.js';

var prioridades = [
	'verde',
	'precaucion',
	'alto'
];
var luces = [
	'primaria',
	'izq',
	'der'
];

/**
Gestiona una luz dentro de una señal.

@class Luz
@constructor
@param config {Object} Configuración de la luz
*/
class Luz {
	constructor (config) {
		_.merge(this, config);
		this._votos = {};
	}

	/**
	Permite forzar el estado de la luz manualmente, ignorando todo enclavamiento.

	Si la señal se saca de manual, al volver a automático, se determina el estado
	en función de los votos sobre su estado que hubieran sido emitidos aún
	cuando estaba en `manual`

	@property manual {Boolean}
	*/
	get manual () {
		return this._manual;
	}
	set manual (value) {
		this._manual = !!value;
		if (!value) return this._cuentaVotos();
	}

	/**
	Recibe la opinión de un enclavamientos de cómo debería estar una luz dentro de una señal.
	Registra el voto de ese enclavamiento y luego determina de entre todas las opiniones
	la más restrictiva y cambia el estado de la luz según corresponda.

	Si la luz está en [manual](#property_manual) registra las opiniones pero no cambia la luz.
	Al volver una luz a automática (`manual=false`) establece el estado en función de los
	votos registrados.

	Devuelve `true` si hubo cambio.

	@method votaPor
	@param estado {String} Uno de `'verde'`, `'precaucion'` o `'alto'`
	@param quien {String} Identificador del votante
	@returns {Boolean} `true` si ha habido cambio.
	*/
	votaPor (estado, quien) {
		this._votos[quien] = estado;
		if (this._manual) return false;
		return this._cuentaVotos();
	}
	/**
	Controla los votos emitidos sobre el estado que debiera tener la luz
	y pone la luz en el más restrictivo que encuentre.
	Devuelve `true` si hubiera cambiado el estado.

	@method _cuentaVotos Establece el estado de la luz en función de los votos.
	@returns {Boolean} verdadero su ha habido cambio
	@private
	*/
	_cuentaVotos () {
		var nuevoEstado = prioridades[_.reduce(this._votos, (pri, value) => {
			return Math.max(prioridades.indexOf(value), pri);
		},0)];
		if (nuevoEstado != this.estado) {
			this.estado = nuevoEstado;
			return true;
		}
		return false;

	}

	toJSON () {
		return {
			estado: this.estado,
			manual: this.manual
		};
	}
}
/**
Maneja el mostrado de las señales en una celda

@module CTC
@submodule senal
*/
/**
Maneja el mostrado de las señales en una celda

@class Senal
@extends Parcel
@constructor
@param config {ConfigSenal} Configuración de la esta señal
*/
export default class Senal extends Parcel {
	constructor (config) {
		super();
		this.containerType = 'g';
		this.className = 'senal';
		this.dir = config.dir;
		luces.forEach(luz => {
			if (config[luz]) this[luz] = new Luz(config[luz]);
		});
	}
	/**
	Determina la dirección del ramal a la que está asociada la señal.
	Puede ser uno de `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`

	@property dir {String}
	*/
	set dir (value) {
		this._dir = value;
		this.attributes = {
			transform: `rotate(${ANG[value]}, ${CENTRO_CELDA}, ${CENTRO_CELDA})`
		};
	}
	get dir () {
		return this._dir;
	}
/*

		<g style="stroke-width:2" transform="rotate(225,50,50)">
			<line x1="97" y1="38" x2="83" y2="38" />
			<line x1="97" y1="33" x2="97" y2="43" />
			<circle cx="87" cy="38" r="5" fill="green"/>
			<!--circle cx="87" cy="33" r="5" fill="yellow"/> der
			<circle cx="87" cy="43" r="5" fill="red"/-->
		</g>

		*/

	view (v) {
		var r = 5,
			y = 38,
			xTope = 95,
			x1 = xTope - 2 * r,
			x2 = x1 -2* r + 2,
			s = [
				v('line', { x1:xTope, y1:y, x2:x2 + r,  y2:y}),
				v('line', { x1:xTope, y1:y-r, x2:xTope,  y2:y+r})
			];
		if (this.izq || this.der) {
			s.push(v('circle.primaria', { cx:x2,  cy:y, r:r, className:this.primaria.estado}));
			if (this.izq) {
				s.push(v('circle.izq', { cx:x1,  cy:y+r, r:r, className:this.izq.estado}));
			}
			if (this.der) {
				s.push(v('circle.der', { cx:x1,  cy:y-r, r:r, className:this.der.estado}));
			}
		} else {
			s.push(v('circle.primaria', { cx:x1,  cy:y, r:r, className:this.primaria.estado}));
		}
		return s;
	}

	toJSON() {
		var ret = {};
		luces.forEach(luz => {
			if (this[luz]) ret[luz] = this[luz].toJSON();
		});
		return ret;
	}
}

/**
Describe las señales existentes en una celda.

@module CTC
@submodule configSenal
*/

/**
Describe una señal.
Cada señal puede tener hasta 3 luces, una principal y una a cada lado.
Cada luz puede estar en varios estados (ver [estado](#property_estado)), que determinan su color.
Por razones de espacio, aún cuando la señal real pudiera tener múltiples focos,
uno de cada color, de las cuales una sóla está encendida en cada momento,
en el mímico, se muestra como un único círculo que cambia de color.

@class ConfigSenal
@static
*/

/**
Contiene información de la luz primaria de la señal.

@property primaria {ConfigLuz}
*/
/**
Contiene información de la luz secundaria que se muestra abajo a la derecha de la señal primaria.

@property der {ConfigLuz}
*/
/**
Contiene información de la luz secundaria que se muestra abajo a la izquierda de la señal primaria.

@property izq {ConfigLuz}
*/
/**
Contiene la definición de una luz dentro de una señal.

@class ConfigLuz
*/
/**
Indica el estado de la señal.

Puede ser `verde`, `precaucion` o `alto`.
@property estado {String}
*/
