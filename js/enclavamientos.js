/* jshint node:true , esnext:true*/
/* global Mimico:true */
"use strict";

var enclavamientos;

var _ = require('lodash');

var getSenal = function (ident, sector) {
	var partes = ident.split(','),
		celda = sector.celdas[[partes[0], partes[1]].join(',')];
	if (celda) return celda.senales[partes[2]];
	// otherwise, returns undefined
};
var Enclavamientos = {
	apareados: function (enclavamiento, celda, sector) {
		var desviado = celda.desviado || false;
		enclavamiento.celdas.forEach(function (coord) {
			var c = sector.celdas[coord];

			if ((c.desviado || false) == desviado) return; // nothing to do

			if (c.manual) {
				Mimico.teletipo.agregar(sector.descr, coord, 'Desvio automático propagado a celda en manual desde ' + celda.x + ',' + celda.y);
				return;
			}

			c.desviado = desviado;
			c.manual = true;
			enclavamientos(c, sector, enclavamiento);
			c.manual = false;
		});
	},
	senalCambio: function (enclavamiento, celda, sector) {
		var senal = getSenal(enclavamiento.senal),
			conjunto = {};

		switch (celda.tipo) {
		case 'desvio':
			conjunto = enclavamiento[celda.desviado ? 'desviado' : 'normal'];
			break;
		case 'triple':
			conjunto = enclavamiento[celda.posicion ? celda.posicion > 0 ? 'der' : 'izq' : 'primaria'];
			break;

		}
		_.each(conjunto, (color, luz) => {
			senal[luz] = color;
		});

	}
};

enclavamientos = function (celda, sector, fromEnclavamiento) {
	celda.enclavamientos.forEach(function (enclavamiento) {
		if (enclavamiento === fromEnclavamiento) return; // don't bother repeating
		Enclavamientos[enclavamiento.tipo](enclavamiento, celda, sector);

	});
};

export default enclavamientos;
