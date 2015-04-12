/* jshint node:true, esnext:true */
"use strict";


import ParcelEv from './parcelEv.js';

var count = 0;
/*
{ 
	opts: [
		{name: text},
		....
	],
	selected: name,
	title: text,
	groupName: text
}
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
