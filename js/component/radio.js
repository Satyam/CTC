/* jshint node:true, esnext:true */
"use strict";
/**
@module Components
@submodule radio
*/

import ParcelEv from './parcelEv.js';

var count = 0;

/**
Provides a set of HTML radio buttons optionally enclosed in a `<fieldset>`.
Emits the [`click`](#event_click) when clicked.

@example
	var desviado = new Radios({
		title:'Desvío',
		selected: celda.desviado?'desviado':'normal',
		opts: [
			{normal: 'Normal'},
			{desviado: 'Desviado'}
		]
	}).on('click', this.cambiar.bind(this));


@class Radio
@extends ParcelEv
@constructor
@param config {Object} configuration options
@param config.opts {Array of Objects} Set of options to choose from.  Each is an object with the value to identify each option as its key and the text to be shown as its value.	It has to be an array to ensure the order of the buttons.
@param [config.selected] {String} value of the radio selected
@param [config.title] {String} If present, a `<fieldset>` will enclose the buttons and this set as its legend
@param [config.groupName] {String} A `name` to be assigned to the set of radios.  If not provided, a unique name will be generated.
*/
export default class Radio extends ParcelEv {
	constructor (config) {
		super({
			EVENTS: {
				click: (ev) => 	this.emit('click', ev.target.value, ev)
				// or { 'input[type=radio]': this.onclick }
			}
		});
		this.sel = config.selected || null;
		this.title = config.title || null;
		this.opts = config.opts.slice(0);
		this.groupName = config.groupName || 'RadioComponent' + count++;
		this.containerType = config.title?'fieldset':'form';
		this.className = 'pure-form';
	}

	/**
	Emitted when a button is clicked.  It reports the `value` of the radio selected

	@event click
	@param value {String} value of the option seleted
	@param ev {DOMEvent} original DOM event
	*/

	/**
	Overrides Parcel's [view](Parcel.html#method_view) method to generate the set of radio buttons

	@method view
	@private
	*/

	view (v) {
		var radios = this.opts.map(button => {
			var name = Object.keys(button)[0];
			return v('label.pure-radio', [
				v(
					'input',
					{
						type:'radio',
						name: this.groupName,
						checked: name == this.sel,
						value: name
					}
				),
				' ' + button[name]
			]);
		});
		return (
			this.title?
			[v('legend', this.title)].concat(radios):
			radios
		);
	}
}
