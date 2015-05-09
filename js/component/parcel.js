/* jshint node:true, esnext:true */
"use strict";

var _ = require('lodash');

/**
@module Parcela
@submodule parcel
*/

/**
Represents a section of real state in the HTML page.

All Parcela apps should inherit from this class.

Several properties might be configured on instantiation:

* [containerType](#property_containerType)
* [className](#property_className)
* [attributes](#property_attributes)
* [text](#property_text)

@class Parcel
@param [config] {Object}  Initial configuration.

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
		this.attributes=config.attributes || null;

		/**
		String to be shown within the container.

		This is used, mostly, for initial testing of layouts,
		to have something to show within the parcel.
		It is rarely used in the final product.

		@property text
		@type String
		*/
		if (config.text) this._text = config.text;
	}
	/**
	Destructor.  The existing implementation does nothing.

	@method destructor
	*/
	destructor () {}

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

	Must be overriden by each Parcela app.  By default, it returns the value of the [text](#property_text) property.

	A virtual DOM node is composed of the following elements:

	* `tag` {String}:  Name of the HTML tag for the node to be created.
	* `attrs` {Object}: Collection of HTML attributes to be added to the node.
	* `children` {Array}: Array of virtual DOM nodes that will become children of the created node.

	As a convenience, this method receives a reference to the [`vDOM.vNode`](vDOM.html#method_vNode)
	helper function to produce the virtual DOM node, however it may be ignored as long as a
	virtual DOM node is somehow returned.

	@example
		view: function (v) {
			return v('div', [
				v('p.joyful','Hello Workd!'),
				v('hr'),
				v('p','(Not very original, really)')
			]);
		}

		// Equivalent to:
		view: function (v) {
			return {tag:'div', attrs:{},children: [
				{tag:'p', attrs:{className:'joyful'}, children:['Hellow World!']},
				{tag:'hr', attrs: {}, children: []},
				{tag:'p', attrs:{}, children:['(Not very original, really)']}
			]};
		}
	@method view
	@param v {function} Reference to the [`vDOM.vNode`](vDOM.html#method_vNode) helper function.
	@return {vNode} The expected virtual DOM node for this parcel.
	*/
	view (v) {
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

