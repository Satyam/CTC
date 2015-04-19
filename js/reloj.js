/* jshint node:true, esnext:true */

"use strict";

import ParcelEv from './component/parcelEv.js';
var vDOM = require('./component/virtual-dom.js');

const 	ACELERACION = 10,
		VELOCIDAD = 10,
		INTERVAL = 200;

export default class Reloj extends ParcelEv {
	constructor () {
		super({
			EVENTS: {
				click: {
					'.fa-backward': this.lento,
					'.fa-forward': this.rapido,
					'.fa-pause': this.pausa,
					'.fa-play': this.continuar
				}
			}
		});
		this.className = 'reloj';

		this._velocidad = VELOCIDAD;
		this._ahora = 0;
		this._enPausa = 0;
		this._referencia = Date.now();
		this._alarmas = [];

		this.timer = setInterval(this.onTimer.bind(this), INTERVAL);
	}

	get ahora () {
		return this._ahora;
	}

	get enPausa () {
		return !!this._enPausa;
	}

	get velocidad () {
		return this._velocidad;
	}
	set velocidad (valor) {
		if (typeof valor == 'number' && valor >=0) {
			if (!valor) this.pausa();
			else {
				this._velocidad = valor;
			}
		}
	}

	onTimer () {
		vDOM.redrawPending();

		var ahora = this._ahora,
			aBorrar = 0;
		ahora +=  (Date.now() - this._referencia) * this._velocidad;
		this._alarmas.some(alarma => {
			if (alarma.cuando < ahora) {
				alarma.cb(ahora);
				aBorrar++;
			}
			else return true;

		});
		this._alarmas.splice(0, aBorrar);
		this._ahora = ahora;
		vDOM.redrawReady();
	}

	lento () {
		this._velocidad /= ACELERACION;
	}

	rapido () {
		this._velocidad *= ACELERACION;

	}

	pausa () {
		this._enPausa = Date.now();
		clearTimeout(this.timer);
	}

	continuar() {
		this._referencia -= Date.now() - this._enPausa;
		this.timer = setInterval(this.onTimer.bind(this), INTERVAL);
		this._enPausa = 0;
	}

	agregarAlarma (cuando, cb) {
		if (typeof cuando != 'number' || typeof cb != 'function') return;
		this._alarmas.push({cuando,cb});
		this._alarmas.sort((a, b) => {
			if (a.cuando < b.cuando) return -1;
			if (a.cuando == b.cuando) return 0;
			return 1;
		});
	}


	view (v) {
		return [
			new Date(this._ahora).toLocaleTimeString(),
			v('i.fa.fa-backward'),
			v(this._enPausa?'i.fa.fa-play':'i.fa.fa-pause'),
			v('i.fa.fa-forward')
		];
	}
}
