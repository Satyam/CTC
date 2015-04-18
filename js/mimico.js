/* jshint node:true, esnext:true */
/* global window:false */


var vdom = require('./component/virtual-dom.js');

import Parcel from './component/parcel.js';
import Sector from './sector.js';
import Teletipo from './teletipo.js';
import ListaSectores from './listaSectores.js';
var url = require('url');

import TabView from './component/tabView.js';

class Mimico extends Parcel {
	constructor() {
		super();

		var config = Mimico.config = window.localStorage.getItem('CTC');
		if (!config) {
			config = {sectores:[]};
			window.localStorage.setItem('CTC', JSON.stringify(config));
		} else {
			config = JSON.parse(config);
		}

		var q = url.parse(window.location.href, true).query;
		if (q.sectores) {
			config.sectores = q.sectores.split(',');
			window.localStorage.setItem('CTC', JSON.stringify(config));
		}

		config.save = function () {
			window.localStorage.setItem('CTC', JSON.stringify(config));
		};

		Mimico.teletipo = new Teletipo();

		Mimico.sectTabs = new TabView({
			tabs: config.sectores.map((name) => {
				return {
					name:name,
					label:name,
					content: new Sector({sector:name}).once('loaded', this.sectorLoaded)
				};
			}).concat('+', [
				{
					name:'teletipo',
					label: 'Teletipo',
					content: Mimico.teletipo
				}
			])
		});
		Mimico.sectTabs.on('add', () => {
			Mimico.sectTabs.add( {
				name:'nuevo',
				label: 'Seleccionar:',
				content: new ListaSectores().on('click', Mimico.addSect)
			}, true);
		});
		Mimico.addSect = (name) => {
			var tab = Mimico.sectTabs.getTab('nuevo');
			if (tab) {
				tab.name = name;
				tab.content = new Sector({sector:name}).once('loaded', this.sectorLoaded);
			}
			config.sectores.push(name);
			config.save();
		};
		Mimico.sectTabs.on('remove', (name) => {
			var sects = config.sectores;

			sects.splice(sects.indexOf(name),1);
			config.save();
		});

	}

	sectorLoaded () {
		var tab = Mimico.sectTabs.getTab(this.name);
		if (tab) tab.label = this.descr;
	}

	view(v) {
		return v('div.solapas', Mimico.sectTabs);
	}

}

global.Mimico = Mimico;
vdom.rootApp(Mimico);
