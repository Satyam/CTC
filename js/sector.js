/* jshint node:true, esnext:true */

"use strict";

import Parcel from './component/parcel.js';
import EstadoFactory from './estado.js';
import CeldaFactory from './celda.js';

var _ = require('lodash'),
	http = require('./component/http.js');

import {ANCHO_CELDA} from './common.js';

export default class Sector extends Parcel {
	constructor (config) {
		super();
	
		this.ancho = 1;
		this.alto = 1;
		this.celdas = {};
		this.seleccionada;
		this.estado = '';
		
		http(
			{
				json: true,
				url: 'data/' + config.sector + '.json'
			}, 
			(response, body) => {
				if (response.statusCode == 200) {
					this.alto = body.alto;
					this.ancho = body.ancho;
					this.descr = body.descr;
					_.forEach(body.celdas, (celda, coords) => {
						var coord = coords.split(',');
						celda.x = parseInt(coord[0], 10);
						celda.y = parseInt(coord[1], 10);
						this.celdas[coords] = new CeldaFactory(celda).on('click', this.onClick.bind(this));

					});
					body.enclavamientos.forEach((enclavamiento) => {
						enclavamiento.celdas.forEach((celda) => {
							this.celdas[celda].enclavamientos.push(enclavamiento);
						});
					});
				}
			}
		);
	}
	onClick (celda) {
		if (this.seleccionada) {
			this.seleccionada.seleccionada = false;
		}
		this.seleccionada = celda;
		celda.seleccionada = true;

		if (this.estado.celda && this.estado.celda.tipo == celda.tipo) {
			this.estado.celda = celda;
		} else {
			if (this.estado.destructor) {
				this.estado.destructor();
			}
			this.estado = new EstadoFactory(this.celdas, celda);
		}
	}
	
	view (v) {
		return v('div.pure-g', [
			v('div.pure-u-3-4',
			  	v(
					'svg.sector', {
						viewBox: "0 0 " + (this.ancho * ANCHO_CELDA) + ' ' + (this.alto * ANCHO_CELDA),
						xmlns: "http://www.w3.org/2000/svg",
						version: 1.1
					}, _.values(this.celdas)
				)
			 ),
			 v('div.pure-u-1-4', v('div.estado', this.estado))
		]);

	}
}
