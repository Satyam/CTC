/* jshint node:true, esnext:true */
"use strict";

var _ = require('lodash');

import ParcelEv from './parcelEv.js';
/*
{
	tabs: [
		{
			name: identifier
			label: String,
			content: Parcel
		},
		....
	],
	selected: identifier
}
*/

export default class TabView extends ParcelEv {
	constructor (config) {
		super({
			EVENTS: {
				click: {
					'li.more': this.onMore,
					'li.tab, li.tab a': this.onClick
				}
			}
		});
		this.className = 'tab-view';
		this._tabs = _.clone(config.tabs);
		this._selected = this._tabs[0];
		this.selected = config.selected;
	}

	onMore (ev) {
		this.emit('add', ev);
	}
	onClick (ev) {
		var target = ev.target,
			hash = (target.hash || target.firstChild.hash).substr(1),
			selTab;
		if (this._tabs.some((tab) => {
			if (tab.name == hash) {
				selTab = tab;
				return true;
			}
		})) {
			this.selected = hash;
			this.emit('click', hash, selTab, ev);
		}
	}

	set selected (value) {
		if (!value) return;
		if (this._selected.name == value) return;

		this._tabs.some((tab) => {
			if (tab.name == value) {
				this._selected = tab;
				return true;
			}
		});
	}

	get selected () {
		return this._selected.name;
	}

	add (tab, select) {
		if (!this._tabs.some((t, index) => {
			if (typeof t == 'string') {
				this._tabs.splice(index, 0, tab);
				return true;
			}
		})) this._tabs.push(tab);
		if (select) this._selected = tab;
	}

	remove (name) {
		if (this._selected.name == name) {
			this._selected = this._tabs[0];
		}
		this._tabs.some((tab, index) => {
			if (tab.name === name) {
				this._tabs.splice(index,1);
				return true;
			}
			return false;
		});
	}


	view (v) {
		var tabs = this._tabs, tab, ts = [], i, l = this._tabs.length;
		for (i = 0; i < l; i++) {
			tab = tabs[i];
			if (typeof tab == 'object') {
				ts.push(v(
					'li.tab.tab-left',
					{
						class:  (this._selected.name == tab.name?' selected':'')
					},
					v('a', {href:'#' + tab.name}, tab.label || tab.name)
				));
			} else break;
		}

		if (tab == '+') {
			ts.push(v('li.more.tab-left', '+'));
			i++;
		}

		for (let j = l-1; j >= i; j--) {
			tab = tabs[j];
			ts.push(v(
				'li.tab.tab-right',
				{
					class:  (this._selected.name == tab.name?' selected':'')
				},
				v('a', {href:'#' + tab.name}, tab.label || tab.name)
			));
		}
		return [
			v('ul.tabs', ts),
			v('.tab-content', this._selected.content)
		];
	}
}
