/* jshint node:true, esnext:true */

"use strict";

import ParcelEv from './component/parcelEv.js';
import Estados from './estado.js';

var _ = require('lodash'),
	http = require('./component/http.js');

var v;


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

var lineaA = function (dest, estilo) {
	return v('line', {
		x1: CENTRO_CELDA,
		y1: CENTRO_CELDA,
		x2: X[dest],
		y2: Y[dest],
		class: estilo || ''
	});
};

var texto = function (texto) {
	return v('text', {
		x: CENTRO_CELDA,
		y: CENTRO_CELDA
	}, texto);
};


var Views = {
	linea: function (celda) {
		return [
			texto(celda.x + ' ' + celda.y),
			lineaA(celda.desde),
			lineaA(celda.hacia)
		];
	},
	desvio: function (celda) {
		return [
			texto(celda.x + ' ' + celda.y),
			lineaA(celda.punta),
			lineaA(celda.normal, celda.desviado ? 'off' : null),
			lineaA(celda.invertido, !celda.desviado ? 'off' : null)
		];
	},
	paragolpe: function (celda) {
		return [
			texto(celda.x + ' ' + celda.y),
			lineaA(celda.desde),
			v('circle', {
				cx: CENTRO_CELDA,
				cy: CENTRO_CELDA,
				r: ANCHO_CELDA / 10
			})
		];
	},
	triple: function (celda) {
		return [
			texto(celda.x + ' ' + celda.y),
			lineaA(celda.punta),
			lineaA(celda.normal, celda.posicion ?'off':null),
			lineaA(celda.izq, celda.posicion != -1 ?'off':null),
			lineaA(celda.der, celda.posicion != 1 ?'off':null)
		];
	},
	cruce: function (celda) {
		return [
			texto(celda.x + ' ' + celda.y),
			lineaA(celda.l1.desde),
			lineaA(celda.l1.hacia),
			lineaA(celda.l2.desde),
			lineaA(celda.l2.hacia)
		];

	}
};


export default class Sector extends ParcelEv {
	constructor (config) {
		super({
			EVENTS: {
				click: {
					'g *': this.clickCelda
				}
			}
		});
		var _this = this;
	
		this.ancho = 1;
		this.alto = 1;
		this.celdas = [];
		
		this.estado = '';
		
		http(
			{
				json: true,
				url: 'data/' + config.sector + '.json'
			}, 
			function (response, body) {
				if (response.statusCode == 200) {
					_.merge(_this, body);
					_.forEach(_this.celdas, function (celda, coords) {
						var coord = coords.split(',');
						celda.x = parseInt(coord[0], 10);
						celda.y = parseInt(coord[1], 10);
						celda.enclavamientos = [];
					});
					_this.enclavamientos.forEach(function (enclavamiento) {
						enclavamiento.celdas.forEach(function (celda) {
							_this.celdas[celda].enclavamientos.push(enclavamiento);
						});
					});
				}
			}
		);
	}
	
	clickCelda (ev) {
		var target = ev.target;
		while (target && target.tagName != 'g') {
			target = target.parentElement;
		}
		if (!target) return;
		var celda = this.celdas[target.id];
		this.seleccionada = celda;
		if (this.estado.celda && this.estado.celda.tipo == celda.tipo) {
			this.estado.celda = celda;
		} else {
			if (this.estado.destructor) {
				this.estado.destructor();
			}
			this.estado = new Estados[celda.tipo](this.celdas, celda);
		}
	}
	
	view (vNode) {
		var _this = this,
			sel = _this.seleccionada;
			
		v = vNode;
		return v('div.pure-g', [
			v('div.pure-u-3-4',
			  	v(
					'svg.sector', {
						viewBox: "0 0 " + (_this.ancho * ANCHO_CELDA) + ' ' + (_this.alto * ANCHO_CELDA),
						xmlns: "http://www.w3.org/2000/svg",
						version: 1.1
					},
					[
						v('rect', {
							x: (sel?sel.x:0) * ANCHO_CELDA,
							y: (sel?sel.y:0) * ANCHO_CELDA,
							width: ANCHO_CELDA,
							height: ANCHO_CELDA,
							class: (sel? 'seleccionada':'oculta')
						})
					].concat(
						_.map(_this.celdas, function (celda, id) {
							return v(
								'g', {
									transform: 'translate(' + (celda.x * ANCHO_CELDA) + ',' + (celda.y * ANCHO_CELDA) + ')',
									id: id
								},
								Views[celda.tipo](celda)
							);
						})
					)
				)
			 ),
			 v('div.pure-u-1-4', v('div.estado', this.estado))
		]);

	}
}
