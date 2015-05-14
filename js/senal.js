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
		_.merge(this, config);
		this._votos = {
			primaria:{},
			izq: {},
			der: {}
		};
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
	/**
	Recibe la opinión de un enclavamientos de cómo debería estar una señal.
	Registra el voto de ese enclavamiento y luego determina de entre todas las opiniones
	la más restrictiva y cambia el estado de la señal según corresponda.
	Devuelve `true` si hubo cambio.

	@method votaPor
	@param luz {String} Uno de `'primaria'`, `'izq'` o `'der'`.
	@param estado {String} Uno de `'verde'`, `'precaucion'` o `'alto'`
	@param quien {String} Identificador del votante
	@returns {Boolean} `true` si ha habido cambio.
	*/
	votaPor (luz, estado, quien) {
		this._votos[luz][quien] = estado;
		var nuevoEstado = prioridades[_.reduce(this._votos[luz], (pri, value) => {
			return Math.max(prioridades.indexOf(value), pri);
		},0)];
		if (nuevoEstado != this[luz].estado) {
			this[luz].estado = nuevoEstado;
			return true;
		}
		return false;

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
		return {
			primaria:this.primaria,
			izq: this.izq,
			der: this.der
		};
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
