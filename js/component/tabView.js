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
					'li.more *': this.onMore,
					'li.tab, li.tab a': this.onClick,
					'li.tab i.fa': this.onClose
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
		ev.preventDefault();
		ev.stopPropagation();
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
			ev.preventDefault();
			ev.stopPropagation();
			this.selected = hash;
			this.emit('click', hash, selTab, ev);
		}
	}

	onClose (ev) {
		ev.preventDefault();
		ev.stopPropagation();

		var hash = ev.target.parentNode.hash.substr(1);
		this.remove(hash);
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

	getTab (name) {
		var tab;
		this._tabs.some((t) => {
			if (t.name == name) {
				tab = t;
				return true;
			}
		});
		return tab;
	}

	remove (name) {
		var removed;
		if (this._tabs.some((tab, index) => {
			if (tab.name === name) {
				removed = this._tabs.splice(index,1)[0];
				return true;
			}
			return false;
		})) {
			if (this._selected.name == name) {
				this._selected = this._tabs[0];
			}
			this.emit('remove', name, removed);
		}
	}


	view (v) {
		var tabs = this._tabs, tab, ts = [], i, l = this._tabs.length;
		for (i = 0; i < l; i++) {
			tab = tabs[i];
			if (typeof tab == 'object') {
				ts.push(v(
					'li.tab.tab-left',
					{
						className:  (this._selected.name == tab.name?' selected':'')
					},
					v('a', {href:'#' + tab.name}, [
						tab.label || tab.name,
						v('i.fa.fa-close')
					])
				));
			} else break;
		}

		if (tab == '+') {
			ts.push(v('li.more.tab-left', v('i.fa.fa-plus')));
			i++;
		}

		for (let j = l-1; j >= i; j--) {
			tab = tabs[j];
			ts.push(v(
				'li.tab.tab-right',
				{
					className:  (this._selected.name == tab.name?' selected':'')
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
