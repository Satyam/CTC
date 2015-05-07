/* jshint node:true, esnext:true */
"use strict";

var _ = require('lodash');

import ParcelEv from './parcelEv.js';

/**
@module Components
@submodule TabView
*/

/**
Provides a set of tabs to show alternate content on the screen.

Individual tabs can be left-justified or right-justified.
The left-justified are usually the variable ones,
new tabs can be added to them and existing ones removed.
The right-justified, if present, are usually fixed in number.
Each entry is described by an object within an array in the initial configuration.
The array is required to ensure the order of the tabs.

Each tab is identified by a `name` that should be unique within the TabView.
The `label` property provides the text to be shown in the tab.
This can be localized and if missing, it defaults to the `name`.
The `content` should be an instance of [Parcel](Parcel.html),

In the configuration, a separator marks the split point in between them.
The separator can be anything that is not an object.
If it is a string, it will be displayed.
If it is a simple `+` sign, the corresponding icon from Font Awesome will be shown instead.
When clicked the [more](#event_more) event is emitted for the application to add a new tab.
If it is not a string (usually `null`) it will not be displayed and thus cannot be clicked.



@example
	{
		tabs: [
			{
				name: 'firstTab'
				label: 'First Tab to the Left',
				content: new Parcel('whatever')
			},
			....
			null,  // separator
			{
				name: 'firstRightTab'
				label: 'First Tab to the right of the separator',
				content: new Parcel('something else')
			},
			...
		],
		selected: 'firstTab'
	}


@class TabView
@extends ParcelEv
@constructor
@param config {Object} configuration options
@param config.tabs {Array of Objects OR String} Set of tabs to display. It has to be an array to ensure the order of the tabs. Each entry can be:

* `null`: It acts as an invisible separator.  The tabs before it will be left-justified, the ones after, right justified.  The `null` will not take any space.
* A string: It acts as a separator, just as null, plus it is shown and, when clicked, it emits the [add](#event_add) event. It is meant to be used as a cue to add extra tabs.
* An object, containing the following properties

@param config.tabs[n].name {String} Internal identifier for the tab.
@param [config.tabs[n].label] {String} Label to be shown on the tab, defaults to its `name`.
@param config.tabs[n].content {Parcel} Instance of Parcel to be shown when this tab is selected.
@param [config.selected] {String} name of the tab to be shown, defaults to the first.
@param [config.canClose] {Boolean} adds a close icon to each of the left-justified tabs.
*/
export default class TabView extends ParcelEv {
	constructor (config) {
		super({
			EVENTS: {
				click: {
					'li.more *': this._onMore,
					'li.tab, li.tab a': this._onClick,
					'li.tab i.fa': this._onClose
				}
			}
		});
		this.className = 'tab-view';

		/**
		Array of tab configuration entries.

		@property _tabs
		@type Array
		@private
		*/
		this._tabs = _.clone(config.tabs);

		/**
		Reference to the active tab.

		@property _selected
		@type Object
		@default first available tab
		@private
		*/
		this._selected = this._firstAvailable();

		/**
		Defines whether a close icon will be added to the left-justified tabs.

		@property _canClose
		@type Boolean
		@default true
		@private
		*/
		this._canClose = config.canClose !== false;

		this.selected = config.selected;
	}
	/**
	Responds to clicks on the visible separator emitting the [more](#event_more).
	Propagation and default action of the event is halted.

	@method _onMore
	@param ev {DOMEvent}
	@private
	*/
	/**
	Fired when the separator in between the left-justified tabs and the right-justified ones is clicked.
	It is presumed that the purpose of this separator is to add more tabs to the set, hence its name.

	@event more
	@param ev {DOMEvent} original click event as received from the browser.
	*/

	_onMore (ev) {
		this.emit('more', ev);
		ev.preventDefault();
		ev.stopPropagation();
	}

	/**
	Responds to clicks on the regular tabs (not the separator) by
	calling setting the [selected](#property_selected) property.

	@method _onClick
	@param ev {DOMEvent}
	@private
	*/
	_onClick (ev) {
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
		}
	}

	/**
	Responds to a click on the close **`x`** mini-icon on the tab by calling
	the [remove](#method_remove) method.

	@method _onClose
	@param ev {DOMEvent}
	@private
	*/


	_onClose (ev) {
		ev.preventDefault();
		ev.stopPropagation();

		var hash = ev.target.parentNode.hash.substr(1);
		this.remove(hash);
	}

	/**
	Sets/gets the name of the tab currently active.

	When setting, if the selected tab is not already selected,
	it shows the seleted tab and fires the [selected](#event_selected) event.

	@property selected
	@type String
	@default first tab

	*/
	/**
	Fires when a new tab is selected and becomes active.
	It does not fire if the tab is already selected.

	@event selected
	@param newTab {String} Name of the tab selected
	@param oldTab {String} Name of the previously selected tab
	*/
	set selected (newTab) {
		if (!newTab) return;
		var oldTab = this._selected.name;
		if (oldTab == newTab) return;

		this._tabs.some((tab) => {
			if (tab.name == newTab) {
				this._selected = tab;
				this.emit('selected', newTab, oldTab);
				return true;
			}
		});
	}

	get selected () {
		return this._selected.name;
	}

	/**
	Returns the first tab that is not a separator.

	@method _firstAvailable
	@return configuration entry of the first tab that is not a separator
	@private
	*/
	_firstAvailable () {
		for (var index = 0, l = this._tabs.length; index < l; index++) {
			if (_.isObject(this._tabs[index])) return this._tabs[index];
		}
		return {};
	}
	/**
	Adds a new tab to the right-most position of the left-justified set.
	Emits the [added](#event_added) event.

	@method add
	@param tab {Object} Tab configuration:
	@param tab.name {String} Identifier for this tab.
	@param [tab.label=tab.name] {String} Label to be shown in the tab.
	@param tab.content {Parcel} Parcel to show when the tab is selected.
	@param [select=true] Whether the added tab becomes active, defaults to true.
	@chainable
	*/
	/**
	Fires when a tab is added.

	@event added
	@param tab {Object} configuration setting for the new tab.
	*/
	add (tab, select) {
		if (!this._tabs.some((t, index) => {
			if (typeof t == 'string') {
				this._tabs.splice(index, 0, tab);
				return true;
			}
		})) this._tabs.push(tab);
		this.emit('added', tab);
		if (select !== false) this.selected = tab.name;
		return this;
	}

	/**
	Returns the configuration entry for the given tab.

	@method getTab
	@param name {String} Name of the tab information sought.
	@return {Object} Configuration entry for the tab or `null` if not found.
	*/
	getTab (name) {
		var tab = null;
		this._tabs.some((t) => {
			if (t.name == name) {
				tab = t;
				return true;
			}
		});
		return tab;
	}

	/**
	Removes the named tab.
	If the tab removed is active, the first available tab will be selected.
	Fires the [remove](#event_remove) event.

	@method remove
	@param name {String} Identifier for the tab to be removed
	@chainable
	*/
	/**
	Fires when a tab is removed.

	@event remove
	@param name {String} Identifier of the tab removed
	@param tab {Object} Configuration entry of the removed tab
	*/
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
				this.selected = this._firstAvailable().name;
			}
			this.emit('remove', name, removed);
		}
		return this;
	}


	/**
	Shows the TabView.
	Override of `Parcel` [view](Parcel.html#method_view).
	@protected
	*/
	view (v) {
		var tabs = this._tabs, tab, ts = [], i, l = this._tabs.length;
		for (i = 0; i < l; i++) {
			tab = tabs[i];
			if (_.isObject(tab)) {
				ts.push(v(
					'li.tab.tab-left',
					{
						className:  (this._selected.name == tab.name?' selected':'')
					},
					v('a', {href:'#' + tab.name}, [
						tab.label || tab.name,
						(this._canClose? v('i.fa.fa-close') : '')
					])
				));
			} else break;
		}

		if (_.isString(tab)) {
			ts.push(v('li.more.tab-left', (tab == '+'? v('i.fa.fa-plus'):tab)));
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
