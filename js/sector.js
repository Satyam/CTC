/* jshint node:true, esnext:true */
/* global window */

/**
@module CTC
@submodule sector

*/



"use strict";

import ParcelEv from './component/parcelEv.js';
import EstadoFactory from './estado.js';
import CeldaFactory from './celda.js';
import EnclavamientoFactory from './enclavamientos.js';

var _ = require('lodash'),
	http = require('./component/http.js');

import {ANCHO_CELDA} from './common.js';

/**

@class Sector
@extends ParcelEv
@constructor
@param config {Object} Sector configuration file as described in [SectorConfig](SectorConfig.html)
*/
export default class Sector extends ParcelEv {
	constructor (config) {
		super();

		this.className = "pure-g sector";
	
		this.ancho = 1;
		this.alto = 1;
		this.celdas = {};
		this.enclavamientos = [];
		this.seleccionada;
		this.estado = '';
		this.name = config.sector;
		
		http.get('data/' + config.sector + '.json')
		.then(response => {
			var body = response.body;

			this.alto = body.alto;
			this.ancho = body.ancho;
			this.descr = body.descr;
			_.forEach(body.celdas, (celda, coords) => {
				this.celdas[coords] = new CeldaFactory(celda, coords).on('click', this.onClick.bind(this));
			});
			if (body.enclavamientos) {
				body.enclavamientos.forEach((enclavamiento) => {
					this.enclavamientos.push(new EnclavamientoFactory(enclavamiento, this));
				});
				let reintentos = 10;
				while (reintentos--) {
					if (this.enclavamientos.reduce((prevVal, enclavamiento) => {
						return prevVal + enclavamiento.inicial()?1:0;
					},0) === 0) break;
				}
				if (reintentos == -1) {
					alert("El estado inicial de los enclavamientos no se ha estabilizado luego de varias iteraciones");
				}
			}
			this.emit('loaded');
		})
		.catch(response => {
			this.fail = response.message || (response.statusCode + ': ' + response.body);
			this.emit('failed', this.fail);
		});
	}
	onClick (celda) {
		if (this.seleccionada) {
			this.seleccionada.seleccionada = false;
		}
		this.seleccionada = celda;
		celda.seleccionada = true;

		if (this.estado.destructor) {
			this.estado.destructor();
		}
		this.estado = new EstadoFactory(this, celda);
	}
	
	view (v) {
		if (this.fail) return v('div.pure-u-1-1',v('.error', this.fail));
		return [
			v('div.pure-u-3-4',
			  	v(
					'svg', {
						viewBox: "0 0 " + (this.ancho * ANCHO_CELDA) + ' ' + (this.alto * ANCHO_CELDA),
						xmlns: "http://www.w3.org/2000/svg",
						version: 1.1
					}, _.values(this.celdas)
				)
			 ),
			 v('div.pure-u-1-4', v('div.estado', {style: {height: window.innerHeight + 'px'}}, this.estado))
		];
	}

	getCelda (x, y) {
		var coord = arguments.length == 2?x + ',' + y:x;
		return this.celdas[coord];
	}

	getSenal (x, y, dir) {
		var partes = Array.prototype.slice.call(arguments, 0);
		if (partes.length === 1) {
			partes = partes[0].split(',');
		}
		var celda = this.celdas[[partes[0], partes[1]].join(',')];
		if (celda) return celda.senales[partes[2]];
		// otherwise, returns undefined
	}

	toJSON () {
		return {
			name: this.name,
			ancho:this.ancho,
			alto:this.alto,
			descr: this.descr,
			celdas: _.mapValues(this.celdas, (celda) => celda.toJSON()),
			enclavamientos: _.map(this.enclavamientos, (enclavamiento) => enclavamiento.toJSON())
		};

	}
	toString () {
		return JSON.stringify(this.toJSON(), null, 2);
	}

	destructor () {
		if (this.estado.destructor) {
			this.estado.destructor();
		}
		_.each(this.enclavamientos,  enclavamiento => enclavamiento.destructor());
		_.each(this.celdas, celda => celda.destructor());
		super.destructor();
	}
}
/**
Provee la descripción de un sector.
@module CTC
@submodule configSector
*/
/**
La clase ConfigSector es un objeto que describe todas las características del sector
No tiene métodos ni eventos, simplemente datos.

@class ConfigSector
@static
*/

/**
Una descripción textual del sector.  Se mostrará al usuario en la solapa por lo que debe ser breve.
@property descr {String}
*/
/**
El número de celdas a lo ancho que usa este sector
@property ancho {Number}
*/
/**
El número de celdas a lo alto que usa este sector
@property alto {Number}
*/
/**
Objeto conteniendo la configuración de cada celda del sector.
Cada celda estará indexada por su coordenada X,Y y contendrá un objeto de clase [ConfigCelda](ConfigCelda.html).
No es necesario proveer entradas para celdas que no contienen vías.
Las celdas se puede enumerar en cualquier orden.

@example
    {
      "celdas": {
        "6,5": {
          "tipo": "linea",
          "desde": "W",
          "hacia": "SE"
        },
        ...
      }
    }
@property celdas {Object}
*/
/**
Lista de los enclavamientos entre los elementos del sector
@property enclavamientos {Array}
@optional

*/
