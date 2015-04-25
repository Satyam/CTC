/* jshint node:true, esnext:true */
/* global window */

"use strict";

import ParcelEv from './component/parcelEv.js';
import EstadoFactory from './estado.js';
import CeldaFactory from './celda.js';
import EnclavamientoFactory from './enclavamientos.js';

var _ = require('lodash'),
	http = require('./component/http.js');

import {ANCHO_CELDA} from './common.js';

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
		
		http.get(
			'data/' + config.sector + '.json',
			(response, body) => {
				if (response.statusCode == 200) {
					this.alto = body.alto;
					this.ancho = body.ancho;
					this.descr = body.descr;
					_.forEach(body.celdas, (celda, coords) => {
						this.celdas[coords] = new CeldaFactory(celda, coords).on('click', this.onClick.bind(this));
					});
					_.forEach(body.enclavamientos, (enclavamiento) => {
						this.enclavamientos.push(new EnclavamientoFactory(enclavamiento, this));
					});

				} else {
					this.fail = response.statusCode + ': ' + response.body;
				}
				this.emit('loaded');
			}
		);
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
		if (this.fail) return v('.error', this.fail);
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

}
