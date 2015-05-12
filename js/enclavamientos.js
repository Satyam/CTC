/* jshint node:true , esnext:true*/
/* global Mimico:true */
"use strict";

var _ = require('lodash');

var prioridades = [
	'verde',
	'precaucion',
	'alto'
];
/**
Clases cuyas instancias manejan cada tipo de enclavamiento disponible.

@module CTC
@submodule enclavamientos
*/
/**
Clase abstracta de la cual deben heredar todos las que manejan cada uno de los enclavamientos.

@class Enclavamiento
@constructor
@param config {ConfigEnclavamiento} Datos de configuración de cada enclavamiento.
@param sector {Sector} Instancia del sector en que se encuentran los elementos enclavados.
*/
class Enclavamiento {
	constructor (config, sector) {
		/**
		Referencia al sector en que se encuentran los elementos enclavados.

		@property sector {Sector}
		*/
		this.sector = sector;
		_.merge(this, config);
	}
	/**
	Asegura que los elementos enclavados se encuentran en estados iniciales válidos.

	@method inicial
	@returns {Boolean} Indica que al verificar el estado, ha debido hacer alguna modificación.
	*/
	// Este método debe ser redefinido en cada uno de los enclavamientos.
	/**
	Devuelve la configuración instantánea del enclavamiento.

	@method toJSON
	@return {Object} Descripción del enclavamiento
	*/
	toJSON () {
		return {
			tipo: this.tipo
		};
	}
	/**
	Versión formateada de la configuración instantánea del enclavamiento.

	@method toString
	@return {String}
	*/
	toString () {
		return JSON.stringify(this.toJSON(), null, 2);
	}
	/**
	Libera los recursos tomados, en este caso, la referencia al sector.

	@method destructor
	*/
	destructor () {
		this.sector = null;
	}
}

var Enclavamientos = {
	/**
	Asegura que los cambios en dos o más celdas se mueven a la par. Si uno cambia, el otro también.

	@example
		{
			"tipo": "apareados",
			"celdas": ["4,4", "5,5"]
		},

	@class Enclavamiento.Apareados
	@extends Enclavamiento
	@constructor
	@param config {ConfigEnclavamiento} Datos de configuración de cada enclavamiento.
	@param sector {Sector} Instancia del sector en que se encuentran los elementos enclavados.
	*/
	/**
	Lista las coordenadas de las celdas cuyos cambios han de estar apareados.

	@property celdas {Array}
	*/

	apareados: class Apareados extends Enclavamiento {
		constructor (config, sector) {
			super(config, sector);
			this._boundCambioListener = this.onCambio.bind(this);
			config.celdas.forEach((coord) => {
				sector.getCelda(coord).on('cambio', this._boundCambioListener);
			});
		}
		/**
		Responde al evento [cambio](Celda.html#event_cambio) de cualquiera de las celdas apareadas
		para actuar sobre las apareadas

		@method onCambio
		@param celda {Celda} instancia de la celda que originó el cambio.
		@param desviado {Boolean} Indica si el cambio está en su posición alternativa.
		*/
		onCambio (celda, desviado) {
			var huboCambio = 0;
			celda._enProceso = true;
			this.celdas.forEach((coord) => {
				let celdaDest = this.sector.getCelda(coord);
				if (celda === celdaDest) return;
				if ((celdaDest.desviado || false) == desviado) return; // nothing to do

				if (celdaDest.manual) {
					Mimico.teletipo.agregar(this.sector.descr, celdaDest.coords, 'Cambio automático propagado a celda en manual desde ' + celda.coords);
					return;
				}

				if (celdaDest._enProceso) {
					Mimico.teletipo.agregar(this.sector.descr, celdaDest.coords, 'Lazo infinito de enclavamiento desde ' + celda.coords);
					return;
				}

				celdaDest._enProceso = true;
				celdaDest.desviado = desviado;
				celdaDest._enProceso = false;
				huboCambio ++;
			});
			celda._enProceso = false;
			return !!huboCambio;
		}
		inicial () {
			var celda = this.sector.getCelda(this.celdas[0]);
			return this.onCambio (celda, celda.desviado);
		}
		toJSON () {
			return _.merge(super.toJSON(), {
				celdas: this.celdas
			});
		}
		destructor () {
			this.celdas.forEach((coord) => {
				this.sector.getCelda(coord).removeListener('cambio',this._boundCambioListener);
			});
			super.destructor();
		}
	},
	/**
	Modifica el estado de una señal en función del estado de un cambio.
	@example
		{
			"tipo": "senalCambio",
			"senal": "8,3,SE",
			"celda": "8,3",
			"normal": {
				"primaria": "verde",
				"izq": "alto"
			},
			"desviado": {
				"primaria": "alto",
				"izq": "precaucion"
			}
		},

	@class Enclavamiento.SenalCambio
	@extends Enclavamiento
	@constructor
	@param config {ConfigEnclavamiento} Datos de configuración de cada enclavamiento.
	@param sector {Sector} Instancia del sector en que se encuentran los elementos enclavados.
	*/
	/**
	Coordenada de la celda que contiene el cambio que afecta la señal.

	@property celda {String}
	*/
	/**
	Coordenada de la señal que responde al estado del cambio.

	@property senal {String}
	*/
	/**
	Configuración de las señales cuando el cambio está en su posición normal.

	Contiene una tabla indicando cada una de las luces (`primaria`, `izq` o `der`)
	y el estado en que han de estar (`verde`, `precaucion` o `alto`).

	@property normal {Object}
	*/
	/**
	Configuración de las señales cuando el cambio está en su posición desviada.

	Contiene una tabla indicando cada una de las luces (`primaria`, `izq` o `der`)
	y el estado en que han de estar (`verde`, `precaucion` o `alto`).

	@property desviado {Object}
	*/

	senalCambio: class SenalCambio extends Enclavamiento {
		constructor (config, sector) {
			super(config, sector);
			this._boundCambioListener = this.onCambio.bind(this);
			this.celda = sector.getCelda(config.celda).on('cambio', this._boundCambioListener);
		}
		/**
		Responde al evento [cambio](Celda.html#event_cambio) de la [celda](#property_celda) que afecta
		a esta señal.

		@method onCambio
		@param celda {Celda} instancia de la celda que originó el cambio.
		@param desviado {Boolean} Indica si el cambio está en su posición alternativa.
		*/
		onCambio (celda, desviado) {
			var senal = this.sector.getSenal(this.senal),
				cambiosEfectuados = 0;
			_.each(this[desviado ? 'desviado' : 'normal'], (color, luz) => {
				//if (prioridades.indexOf(color) > prioridades.indexOf(senal[luz])) {
					if (senal[luz].estado != color) {
						senal[luz].estado = color;
						cambiosEfectuados++;
					}
				//}
			});
			return cambiosEfectuados;
		}

		inicial () {
			return this.onCambio (this.celda, this.celda.desviado);
		}
		toJSON () {
			return _.merge(super.toJSON(), {
				celda: this.celda,
				senal: this.senal,
				normal: this.normal,
				desviado: this.desviado
			});
		}
		destructor () {
			this.celda.removeListener('cambio', this._boundCambioListener);
			super.destructor();
		}

	},
	/**
	Modifica el estado de una señal en función del estado de un triple.

	@example
		{
			"tipo": "senalTriple",
			"senal": "2,4,W",
			"celda": "2,4",
			"izq": {
				"izq": "verde",
				"primaria": "alto",
				"der": "alto"
			},
			"centro": {
				"izq": "alto",
				"primaria": "verde",
				"der": "alto"
			},
			"der": {
				"izq": "alto",
				"primaria": "alto",
				"der": "verde"
			}
		}

	@class Enclavamiento.SenalTriple
	@extends Enclavamiento
	@constructor
	@param config {ConfigEnclavamiento} Datos de configuración de cada enclavamiento.
	@param sector {Sector} Instancia del sector en que se encuentran los elementos enclavados.
	*/
	/**
	Coordenada de la celda que contiene el cambio que afecta la señal.

	@property celda {String}
	*/
	/**
	Coordenada de la señal que responde al estado del cambio.

	@property senal {String}
	*/
	/**
	Configuración de las señales cuando el cambio está en su posición izquierda.

	Contiene una tabla indicando cada una de las luces (`primaria`, `izq` o `der`)
	y el estado en que han de estar (`verde`, `precaucion` o `alto`).

	@property izq {Object}
	*/
	/**
	Configuración de las señales cuando el cambio está en su posición central.

	Contiene una tabla indicando cada una de las luces (`primaria`, `izq` o `der`)
	y el estado en que han de estar (`verde`, `precaucion` o `alto`).

	@property centro {Object}
	*/
	/**
	Configuración de las señales cuando el cambio está en su posición derecha.

	Contiene una tabla indicando cada una de las luces (`primaria`, `izq` o `der`)
	y el estado en que han de estar (`verde`, `precaucion` o `alto`).

	@property der {Object}
	*/
	senalTriple: class SenalTriple extends Enclavamiento {
		constructor (config, sector) {
			super(config, sector);
			this._boundCambioListener = this.onCambio.bind(this);
			this.celda = sector.getCelda(config.celda).on('cambio', this._boundCambioListener);
		}
		/**
		Responde al evento [cambio](Celda.html#event_cambio) de la celda que contiene el cambio
		triple que afecta a esta señal.

		@method onCambio
		@param celda {Celda} instancia de la celda que originó el cambio.
		@param posicion {Boolean} Indica la posición del cambio.
		*/
		onCambio (celda, posicion) {
			var senal = this.sector.getSenal(this.senal),
				cambiosEfectuados = 0;

			_.each(this[['izq' , 'centro', 'der'][posicion+1]], (color, luz) => {
				//if (prioridades.indexOf(color) > prioridades.indexOf(senal[luz])) {
					if (senal[luz].estado != color) {
						senal[luz].estado = color;
						cambiosEfectuados++;
					}
				//}
			});
			return cambiosEfectuados;
		}

		inicial () {
			return this.onCambio (this.celda, this.celda.posicion);
		}
		toJSON () {
			return _.merge(super.toJSON(), {
				celda: this.celda,
				senal: this.senal,
				izq: this.izq,
				centro: this.centro,
				der: this.der
			});
		}
		destructor () {
			this.celda.removeListener('cambio', this._boundCambioListener);
			super.destructor();
		}

	}
};
/**
Fábrica de enclavamientos.
Al crear una instancia de esta clase se devuelve una subclase de [Enclavamiento](Enclavamiento.html)
que corresponde al [tipo](configEnclavamiento.html#property_tipo) de enclavamiento que define.

@class EnclavamientoFactory
@constructor
@param enclavamiento {Object} Configuración del enclavamiento.
@param sector {Sector} Sector en que se encuentran los elementos del enclavamiento.
@returns {Enclavamiento} Instancia de [Enclavamiento](Enclavamiento.html) acorde al [tipo](ConfigEnclavamiento.html#property_tipo)
*/
export default class EnclavamientoFactory {
	constructor (enclavamiento, sector) {
		return new Enclavamientos[enclavamiento.tipo](enclavamiento, sector);
	}
}
/**
Describe la relación entre el estado de un elemento del sector y otro u otros.

Cada tipo de enclavamiento actua de forma diferente.  Se lo distingue por el [tipo](#property_tipo).

@module CTC
@submodule configEnclavamiento
*/
/**
Provee la información de un enclavamiento.

Las propiedades de cada entrada corresponden a cada tipo de enclavamiento
salvo la propiedad [tipo](#property_tipo) que es común a todas ellas.
Los valores de cada entrada se le pasa como argumento al constructor de cada tipo de enclavamiento.
La información sobre estos parámetros se encuentra en la documentación para cada uno de estos enclavamientos.

@class ConfigEnclavamiento
@static
*/
/**
Identifica al tipo de enclavamiento.

@property tipo {String}
*/
