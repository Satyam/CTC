/* jshint node:true, esnext:true */
"use strict";

var _ = require('lodash');

/**
@module core
@submodule parcel
*/

/**
All Parcela apps should inherit from this class.

The constructor ensures the `config` argument exists and is an object.
It merges the values from the [`defaultConfig`](#property_defaultConfig) property into it and
sets the properties of the instance to the resulting values.
It then calls the `init` method with all its arguments, including the defaults.
The [`init`](#method_init) might be considered the true constructor of the parcel.



@class Parcel
@constructor
*/
export default class Parcel {
	constructor  (config) {
		config = config || {};
		
		/**
		Type of DOM element that will be created to serve as a container for this Parcel.
		Defaults to a `DIV`

		@property containerType
		@type String
		@default DIV

		*/
		this.containerType = config.containerType || 'DIV';
		/**
		CSS className to add to the container for this parcel.
		This is in addition to the className of `parcel` which is
		automatically added to all Parcel containers.

		@property className
		@type String
		@default ''
		*/
		this.className= config.className || '';
		/**
		Hash map of attributes for the container element

		@property attributes
		@type Object
		@default:null
		*/
		this.attributes=config.attribute || null;

		if (config.text) this._text = config.text;
	}
	/**
	Destructor.  

	The provided method checks all the instance properties and if any of them are 
	instances of Parcel or arrays of Parcel instances, 
	it will call the `destructor` method on each of the child parcels.

	@method destructor
	*/
	destructor () {
		_.each(this, (member) => {
			if (member instanceof Parcel) member.destructor();
			if (_.isArray(member)) {
				_.some(member, item => {
					if (item) {
						if (item instanceof Parcel) {
							item.destructor();
						} else {
							// If the first non-emtpy item is not a Parcel instance, 
							// it doesn't bother checking the rest.
							return true;
						}
					}
				});
			}
						
		});
	}

	/**
	Called by the renderer before this Parcel is shown for the first time.
	It is a good place to activate resources that are only usefull while the 
	parcel is visible such as animations.
	
	The provided method is empty, it can be overriden by each Parcela app.
	
	@method preView
	*/
	preView () {}
	
	/**
	Called by the renderer after this Parcel is hidden.
	
	It is a good place to deactivate resources that are only usefull while the 
	parcel is visible such as animations.
	
	The provided method is empty, it can be overriden by each Parcela app.
	
	@method postView
	*/
	postView () {}


	/**
	Returns the virtual DOM for this parcel.

	Must be overriden by each Parcela app.

	A virtual DOM node is composed of the following elements:

	* `tag` {String}:  Name of the HTML tag for the node to be created.
	* `attrs` {Object}: Collection of HTML attributes to be added to the node.
	* `children` {Array}: Array of virtual DOM nodes that will become children of the created node.

	This method will usually use the [`ITSA.vNode`](ITSA.html#method_vNode)
	helper function to produce the virtual DOM node.

	@example
		view: function () {
			var v = I.Parcel.vNode;
			return v('div', [
				v('p.joyful','Hello Workd!'),
				v('hr'),
				v('p','(Not very original, really)')
			]);
		}

		// Equivalent to:
		view: function () {
			return {tag:'div', attrs:{},children: [
				{tag:'p', attrs:{class:'joyful'}, children:['Hellow World!']},
				{tag:'hr', attrs: {}, children: []},
				{tag:'p', attrs:{}, children:['(Not very original, really)']}
			]};
		}
	@method view
	@return {vNode} The expected virtual DOM for this parcel.
	*/
	view () {
		return this._text || '';
	}

	/**
	Returns a value representative of the state of this parcel.
	The system will compare it with the previous state and if they match,
	it will assume the view has not changed.

	The default function returns `NaN` which is always different than itself.
	It may be overriden for optimization purposes.
	@method stamp
	@return {value} any simple value (no objects or such) that reflects the state of this view
	*/
	stamp () {
		return NaN;
	}

	
}

