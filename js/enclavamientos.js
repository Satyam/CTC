/* jshint node:true , esnext:true*/
/* global Mimico:true */
"use strict";

var enclavamientos;

var Enclavamientos = {
	desvios: function (enclavamiento, celda, celdas) {
		var desviado = celda.desviado ||  false;
		enclavamiento.celdas.forEach(function (coord) {
			var c = celdas[coord];
			
			if ((c.desviado || false) == desviado) return; // nothing to do
			
			if (c.manual) {
				Mimico.teletipo.agregar('Constitución', coord, 'Desvio automático propagado a celda en manual desde ' + celda.x + ',' + celda.y);
				return;
			}

			c.desviado = desviado;
			c.manual = true;
			enclavamientos(c, celdas, enclavamiento);
			c.manual = false;
		});
	}
};

enclavamientos = function (celda, celdas, fromEnclavamiento) {
	celda.enclavamientos.forEach( function (enclavamiento) {
		if (enclavamiento === fromEnclavamiento) return;  // don't bother repeating 
		Enclavamientos[enclavamiento.tipo](enclavamiento, celda, celdas);

	});
};

export default enclavamientos;
