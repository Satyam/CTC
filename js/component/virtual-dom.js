/*jshint node:true*/
/*globals window: true */
"use strict";

/**
Provides virtual dom functionality for other modules.

The module exports a single function which should be called to
fetch the [vDOM](../classes/vDOM.html) class.

@module virtual-dom
 */

/**
Contains the virtual DOM handling methods and properties
@class vDOM
*/
var	_ = require('lodash'),
	document = window.document,
	vNodesCache = {},
	vNodeParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g,
	vNodeAttrParser = /\[(.+?)(?:=("|'|)(.*?)\2)?\]/,
	rootParcel,
	pendingRedraws = 0;


var v = {
	/**
	Hash of special `tagNames` that imply change in the XML namespacing.

	@property _xmlNS
	@type hash
	@private
	*/
	_xmlNS : {
		svg:"http://www.w3.org/2000/svg",
		math:"http://www.w3.org/1998/Math/MathML"
	},
	/**
	The virtual DOM for the application.

	@property _vDOM
	@type vNode
	@private
	*/
	_vDOM: null,
	/**
	Helper function to build [vNodes](vNode.html).

	It takes the name of the `tag` to be created.
	It supports the following four modifiers, following the rules of CSS selectors:

	* A `namespace` prefix followed by a colon:  `svg:line` (not needed, see note below)
	* One or more CSS classes, each preceeded by a dot: `div.list`
	* An `id` preceeded by a pound: `div#a1`
	* One or more attribute assignments, each enclosed in square brackets: `input[type=checkbox]`

	Though the last three modifiers can be set via the `attrs` argument,
	for performance reasons, if they won't change during the application
	it is better to set them via the above modifiers and reserve
	the attributes for variable parts.

	If modifiers are used, the tagName itself can be omitter and a `div` will be assumed.
	Thus, `#a1` is the same as `div#al`.

	Attributes `className` (or `class`) and `style` have special treatment.

	The `className` attribute can be given as a string or as an array of values, the last being preferable.

	The `style` attribute should be set with an object containing a hash map of style names to values.
	The style names should be in JavaScript format, not CSS format that is, `backgroundColor` not `background-color`.

	Neither the `svg:` or the `math:` namespaces are required.  The renderer will add the corresponding
	`xmlns` attribute upon detecting the `<svg>` or `<math>` elements.  All elements contained within
	any of those will be properly namespaced.

	@example
	```
	var v = ITSA.Parcel.vNode;

	v('br');
	// produces:
	{tag: 'br', attrs:{}, children:[]}
	// Which will result in: <br/>

	v('ul.list', options.map(function (option) {
		return v('li', {'data-key': option.key}, option.text);
	}));
	// produces:
	{tag:'ul', attrs: {className:'list'}, children: [
		{tag:'li', attrs: {'data-key': 'k1'}, children: ['first value']},
		{tag:'li', attrs: {'data-key': 'k2'}, children: ['second value']}
	}
	// Which would result in:
	//<ul class="list">
	//    <li data-key="k1">first value</li>
	//    <li data-key="k2">second value</li>
	//</ul>

	v('a#google.external[href="http://google.com"]", 'Google');
	// would eventually result in:
	// <a id="google" class="external" href="http://google.com">Google</a>
	```
	It is recommended that unchanging classNames, IDs and attributes be encoded into the `tag` to improve
	efficiency, as these can be cached.   Use the `attrs` object for variable attributes.

	@method vNode
	@static
	@param tag {String} Name of the tag to be created.
	 Much like with a CSS selector,
	 it can be followed by a `#` and an ID,
	 any number of CSS classNames each preceded by a `.`
	 and attribute assignments enclosed in square brackets (see example above).
	@param [attrs] {Object} Collection of attributes to be set on the node.
	 Any value assigned to the `className` attribute will be appended to those provided along the tag.
	@param [children] {any}  It can be a further virtual DOM node, a parcel,
	a simple value which will result in a text string or an array of either.
	@return {Object} virtual DOM node.
	*/
	vNode: function (tag, attrs, children) {
		var classes = [], vAttrs = {};


		// If the attrs argument is not actually an object, it might have been ommited, shift it into the children
		// If it is an object and has a tag property, it is likely to be a vNode
		// If it has a view function, it is likely to be a parcel instance.
		if (! _.isPlainObject(attrs) || typeof attrs.tag == 'string' || typeof attrs.view == 'function') {
			children = attrs;
			attrs = {};
		}

		// Check the cache
		var vNode = vNodesCache[tag];
		if (vNode === undefined) {
			// save the new node into the cache
			vNodesCache[tag] = vNode = {tag: "div"};
			var match;
			/*jshint boss:true*/
			// Parse the tag.
			while (match = vNodeParser.exec(tag)) {
				/*jshint boss:false*/
				switch (match[1]) {
					case "":
						vNode.tag = match[2];
						break;
					case "#":
						vAttrs.id = match[2];
						break;
					case ".":
						classes.push(match[2]);
						break;
					default:
						if (match[3][0] == "[") {
							var pair = vNodeAttrParser.exec(match[3]);
							vAttrs[pair[1]] = pair[3] || (pair[2] ? "" :true);
						}
						// Styles need to be processed or documented that they shouldn't be used.
				}
			}
			if (classes.length) vAttrs.className = classes;
			if (!_.isEmpty(vAttrs)) vNode.attrs = vAttrs;
		}
		// Clone in order to avoid affecting the cached copy.
		vNode = _.clone(vNode);
		vAttrs = (vNode.attrs?_.clone(vNode.attrs):{});
		vAttrs.className = (vAttrs.className?vAttrs.className.slice():[]);
		var s = vAttrs.style;
		if (s) vAttrs.style = _.clone(s);

		// ensure the children are always an array.
		if (children !== undefined) {
			vNode.children = (_.isArray(children) ? children : [children]);
		}
		for (var attrName in attrs) {
			switch (attrName) {
			case 'class':
				attrs.className = attrs.class;
				delete attrs.class;
				/*jshint -W086 */
				// continues on purpose
			case 'className':
				/* jshint +W086 */
				if (typeof attrs.className == 'string') {
					attrs.className = attrs.className.trim().replace(/\s+/,' ').split(' ');
				}
				vAttrs.className = vAttrs.className.concat(attrs.className);
				break;
			case 'style':
				_.merge(vAttrs.style, attrs.style, vAttrs.style); // the new styles should prevail
				if (_.isEmpty(vAttrs.style)) delete vAttrs.style;
				break;
			default:
				vAttrs[attrName] = attrs[attrName];
			}
		}

		if (!vAttrs.className.length) delete vAttrs.className;
		if (!_.isEmpty(vAttrs)) vNode.attrs = vAttrs;
		return vNode;
	},

	/**
	Triggers the rendering process for the page or parcel.

	The rendering process starts with the production of a new virtual DOM for the page or component
	and a comparisson of the newly created *expected* DOM against the *existing* DOM.
	The render process will only change those nodes in the actual DOM that differ in between the two.

	Called without any arguments, it will start the process at the root of the virtual DOM.
	If provided with an argument it will start the process at the branch of the virtual DOM
	controlled by the given Parcel instance.

	@method render
	@param [parcel] {Parcel} Instance of Parcel in control of a section of a page.
	@static

	*/
	render: function (parcel) {
		parcel = parcel || rootParcel;

		v._diffPNode(parcel._pNode, parcel);
	},

	/**
	Determines which [Parcel](Parcel.html) is the root app for this page
	and which is the DOM element it corresponds to and renders the app.

	If the root app controls the whole screen, the corresponding DOM element is going to be
	`document.body`, which is the default when omitted.

	@method rootApp
	@param Parcel {Parcel} instance of [Parcel](Parcel.html) that is the root of the app.
	@param [element=document.body] {DOM element} DOM element that is the root of the app.
	@param [parcelConfig] {Object} optional arguments to provide to Parcel when intantiating it.
	@return {Parcel} the root parcel just created (available in the [rootParcel](#property_rootParcel) property).
	@static
	*/
	rootApp: function (Parcel, rootNode, parcelConfig) {
		if (rootParcel) {
			v._postViews(rootParcel);
			rootParcel.destroy();
			rootParcel._pNode.node.parentNode.removeChild(rootParcel._pNode.node);
		}

		if (arguments.length < 3 && rootNode && typeof rootNode.nodeName !== 'string') {
			parcelConfig = rootNode;
			rootNode = null;
		}
		rootParcel = new Parcel(parcelConfig);
		/* global document:true */
		rootNode = rootNode || document.body;
		// Set a vNode to match the root
		v._vDOM = {
			tag:rootNode.tagName,
			attrs:{}, // possibly not true, but it doesn't matter
			children:[],
			node:rootNode
		};
		var pNode = v._buildPNode(rootParcel);
		rootNode.appendChild(pNode.node);
		v._vDOM.children.push(pNode);

		return rootParcel;
	},
	/**
	Warns the rendering system that a redraw will be required, 
	but it should hold on until the operation about to be performed 
	(usually an async one) is finished,
	[redrawReady](#method_redrawReady) should then be called.

	@method redrawPending
	@static
	*/

	redrawPending: function () {
		pendingRedraws = pendingRedraws++;
	},
	/**
	Signals that the operation that would require a redraw has been finished
	and that, if no further async operations are pending, it may now proceed.
	It should be used paired with [redrawPending](#method_redrawPending).

	@method redrawReady
	@static
	*/
	redrawReady: function () {
		pendingRedraws = Math.max(pendingRedraws - 1, 0);
		if (pendingRedraws === 0) v.render();
	},
	/**
	Executes the given function `fn` on all parcels in the vDOM
	starting from the given `parcel`.

	@method _forAllPNodes
	@param parcel {Parcel} parcel to start executing from
	@param fn {Function} function to execute on each parcel
	@private
	*/
	_forAllPNodes: function (parcel, fn) {
		var _forEach= function (pNode) {
			pNode.childPNodes.forEach(_forEach);
			fn(pNode.parcel);
		};
		_forEach(parcel._pNode);
		fn(parcel);
	},
	/**
	Calls `postView` on all the parcels in the branch starting
	at the given `parcel`

	@method _postViews
	@param parcel {Parcel} parcel to start calling `postView` on.
	@private
	*/
	_postViews: function (parcel) {
		v._forAllPNodes(parcel, function (parcel) {
			parcel.postView();
		});
	},
	/**
	Returns a new `pNode` based on the given parcel and namspace.

	@method _buildPNode
	@param parcel {Parcel} Parcel instance that serves as the basis for this parcel
	@param [namespace] {String} current XML namespace URL
	@param [parentPNode] {pNode} The pNode that is the ancestor of this one.
	@return {pNode} a new `pNode` based on the given parcel
	@private
	*/

	_buildPNode: function (parcel, namespace, parentPNode) {
		var pNode = v._buildVNode(parcel.containerType, namespace);

		_.merge(pNode, {parcel:parcel, stamp:NaN, attrs: {}, children:[], childPNodes:[]});

		if (parentPNode) parentPNode.childPNodes.push(pNode);
		parcel._pNode = pNode;
		parcel.preView();
		v._diffPNode(pNode, parcel, pNode);
		return pNode;
	},
	/**
	Returns a new `vNode` based on the given `tag` and `namespace`

	@method _buildVNode
	@param tag {String} nodeName of the DOM node to be created.
	@param [namespace] {String} current XML namespace URL
	@return {vNode} a new `vNode`.
	@private
	*/
	_buildVNode: function (tag, namespace) {
		var xmlns = v._xmlNS[tag];

		namespace =  xmlns || namespace;

		var vNode = {
			tag:tag,
			node:(namespace?
				document.createElementNS(namespace, tag):
				document.createElement(tag)
			)
		};
		if (namespace) vNode.attrs = {xmlns:namespace};
		return vNode;
	},
	/**
	Returns a string node.

	@method _buildStringNode
	@param {String} Text to make the string node of
	@return {StringNode}
	@private
	*/
	_buildStringNode: function (s) {
		var sNode = new String(s);
		sNode.node = document.createTextNode(s);
		return sNode;
	},
	/**
	Skips over Parcels whose stamp has not changed, looking for nested parcels within

	@method _skipPNode
	@param children {[vNode | pNode]} Array of children to lookk into
	@private
	*/
	_skipPNode: function (childPNodes) {
		var child, l;
		if (childPNodes) {
			l = childPNodes.length || 0;
			for (var i = 0; i < l; i++) {
				child = childPNodes[i];
				v._diffPNode(child.parcel._pNode, child.parcel);
			}
		}
	},

	/**
	Runs the differences in between an existing and the expected `pNodes`

	@method _diffPNode
	@param existing {pNode} The existing `pNode`
	@param parcel {Parcel} parcel that will supply the new pNode to compare against
	@param [parentPNode] {pNode} The pNode that is the ancestor of this one.
	@protected
	@static
	*/
	_diffPNode: function (existing, parcel, parentPNode) {
		var stamp = parcel.stamp();
		if (existing.stamp === stamp) {
			v._skipPNode(existing.childPNodes);
		} else {
			existing.stamp = stamp;
			var children = parcel.view(v.vNode);
			if (!Array.isArray(children)) children = [children];

			var expected =  {parcel:parcel, stamp:NaN, children: children, attrs: {}, childPNodes:[]};
			_.merge(expected.attrs, parcel.attributes);
			expected.attrs.className = ['parcel',  parcel.className];
			v._diffVNodes(existing, expected, null, parentPNode);
		}
	},

	/**
	Runs the difference between an existing and the expected `vNode`
	and makes the necessaty changes on the DOM based on the differences.
	At the end, the existing should match the expected.

	@method _diffVNodes
	@param existing {vNode} Branch of the virtual DOM that represents the actual, current DOM
	@param expected {vNode} The same branch as it should become
	@param [namespace] {String} current XML namespace URL
	@param [parentPNode] {pNode} The pNode that is the ancestor of this one.
	@protected
	@static
	*/
	_diffVNodes: function ( existing, expected, namespace, parentPNode) {
		namespace = (existing.attrs && existing.attrs.xmlns) || namespace;
		v._diffAttrs(existing, expected, namespace);
		v._diffChildren(existing.node, existing, expected, namespace, parentPNode);
	},

	/**
	Compares the children of the existing and the expected vDOM and makes the necessary
	changes so it updates to the expected.

	@method _diffChildren
	@param parentEl {DOMElement} Element that contains the children represented by the existing vNode
	@param existing {vNode} virtual representation of the actual DOM
	@param expected {vNode} virtual representation of how it should be
	@param [namespace] {String} current XML namespace URL
	@param [parentPNode] {pNode} The pNode that is the ancestor of this one.
	@protected
	@static
	*/
	_diffChildren: function (parentEl, existing, expected, namespace, parentPNode) {

		// need to take care of keyed elements
		var children = existing.children || [],
			newChildren = expected.children || [],
			l = Math.max(children.length, newChildren.length),
			childPos, node, oldNode,
			child, newChild,
			operations = [];

		var removeEl = function (node) {
			node.parentNode.removeChild(node);
		};


		// The following functions all rely on accessing the local variables declared above through closure.
		// They cannot be moved outside of this function.
		var removeNode = function () {
			removeEl(child.node);
			children.splice(childPos,1);
		};
		var insertNode = function (oldNode) {
			if (oldNode) {
				parentEl.replaceChild(child.node, oldNode);
				children[childPos] = child;
			} else {
				parentEl.insertBefore(child.node, parentEl.childNodes[childPos]);
				children.splice(childPos,0,child);
			}
		};

		var whatIsIt = function (child) {
			if (child === undefined) return 'u';
			if (typeof child === 'object') {
				if (typeof ((child.parcel && child.parcel.view) || child.view) === 'function') return 'p'; //pNode
				if (typeof child.tag === 'string') return 'v'; //vNode
			}
			return 's';  // Anything else is probably a value that can be turned into a string.

		};

		for (childPos = 0; childPos < l; childPos++) {
			child = children[childPos];
			newChild = newChildren[childPos];
			switch (whatIsIt(child) + whatIsIt(newChild)) {
		/*
		Replacers are functions to replace one kind of node for another.
		They are keyed with two letters corresponding to the current type of node
		and the new type of node.
		The types are provided by whatIsIt above,
		u - undefined
		v - virtual node
		p - parcel node
		s - strings, integers or other value type that can be represented as text

		In looking for patterns I reordered this table in several ways.
		Currently it has all the ones where the origin and destination are the same first,
		then the rest grouped by destination.
		*/
			// All the ones that have the same type of destination as source
			case 'uu':
				break;
			case 'vv':
				if (child.tag != newChild.tag) {
					oldNode = child.node;
					child = v._buildVNode(newChild.tag, namespace);

					v._diffVNodes( child, newChild, namespace, parentPNode);

					insertNode(oldNode);
				} else {
					v._diffVNodes(child, newChild, namespace, parentPNode);
				}
				break;
			case 'pp':
				if (child.parcel === newChild) {
					v._diffPNode(child, newChild, parentPNode);
				} else {
					oldNode = child.node;
					v._postViews(child.parcel);
					child = v._buildPNode(newChild, namespace, parentPNode);

					insertNode(oldNode);
				}
				break;
			case 'ss':
				if (child != newChild) {
					child.node.nodeValue = newChild;
					children[childPos] = new String(newChild);
					children[childPos].node = child.node;
				}
				break;

			// These end up with nothing so whatever was there has to be removed:
			case 'vu': 
					removeNode();
					break;
			case 'pu':
				v._postViews(child.parcel);
				removeNode();
				break;
			case 'su': 
					removeNode();
					break;

			// The following are ordered by destination

			case 'uv':
				child = v._buildVNode(newChild.tag, namespace);

				v._diffVNodes(child, newChild, namespace, parentPNode);

				insertNode();
				break;
			case 'pv':
				oldNode = child.node;

				v._postViews(child.parcel);

				child = v._buildVNode(newChild.tag, namespace);

				v._diffVNodes(child, newChild, namespace, parentPNode);

				insertNode(oldNode);
				break;
			case 'sv':
				oldNode = child.node;

				child = v._buildVNode(newChild.tag, namespace);

				v._diffVNodes(child, newChild, namespace, parentPNode);

				insertNode(oldNode);
				break;
			case 'up':
				child = v._buildPNode(newChild, namespace, parentPNode);

				insertNode();
				break;
			case 'vp':
				oldNode = child.node;
				child = v._buildPNode(newChild, namespace, parentPNode);

				insertNode(oldNode);
				break;
			case 'sp':
				oldNode = child.node;
				child = v._buildPNode(newChild, namespace, parentPNode);

				insertNode(oldNode);
				break;
			case 'us':
				child = v._buildStringNode(newChild);

				insertNode();
				break;
			case 'vs':
				oldNode = child.node;
				child = v._buildStringNode(newChild);

				insertNode(oldNode);
				break;
			case 'ps':
				oldNode = child.node;
				v._postViews(child.parcel);

				child = v._buildStringNode(newChild);

				insertNode(oldNode);
				break;
			}
		}




		if (!existing.children && children.length) existing.children = children;
	},

	/**
	Compares the attributes of the existing virtual DOM and the expected
	and makes the differences.

	@method _diffAttrs
	@param existing {vNode} vNode whose attributes represent the current state
	@param expected {vNode} vNode whose attributes are the new expected state
	@param [namespace] {String} current XML namespace URL
	@protected
	@static
	*/
	_diffAttrs: function (existing, expected, namespace) {
		var attrs = existing.attrs || {},
			newAttrs = expected.attrs || {},
			node = existing.node;

		_.each(attrs,function (value, name) {
			if (! (name in newAttrs)) {
				delete attrs[name];
				if (namespace) {
					node.removeAttributeNS(namespace, name);
				} else {
					if (name != 'data') node.removeAttribute(name);
				}
				return; // continues the loop
			}
			var newValue = newAttrs[name];
			switch (name) {
				case 'checked':
					if (newValue) {
						node.setAttribute(name, name);
					} else {
						node.removeAttribute(name);
					}
					break;
				case 'style':
					v._diffStyles(existing, value, newValue);
					break;
				case 'className':
					v._diffClassNames(existing, value, newValue);
					break;
				case 'data':
					if (!namespace) break;
					/* jshint -W086 */
					// otherwise, fall through
				default:
					/* jshint +W086 */
					if (value !== newValue) {
						if (namespace && name == 'href') {
							node.setAttributeNS("http://www.w3.org/1999/xlink", name, value);
						} else {
							if (typeof newValue == 'function') {
								node[name] = newValue;
							} else {
								node.setAttribute(name, newValue);
							}
						}
					}
			}
			attrs[name] = newValue;
		});

		_.each(newAttrs,function (value, name) {
			if(!(name in attrs)) {
				attrs[name] = value;
				switch (name) {
					case 'checked':
						if (value) node.setAttribute(name, name);
						break;
					case 'style':
						_.each(value,function (style, key) {
							node.style[key] = style;
						});
						return;
					case 'className':
						node.setAttribute('class', value.join(' ').trim());
						return;
					case 'data':
					if (!namespace) break;
						/* jshint -W086 */
						// otherwise, fall through
					default:
						/* jshint +W086 */
						if (namespace && name == 'href') {
							node.setAttributeNS("http://www.w3.org/1999/xlink", name, value);
						} else {
							if (typeof value == 'function') {
								node[name] = value;
							} else {
								node.setAttribute(name, value);
							}
						}
				}
			}
		});
		if (!existing.attrs && !_.isEmpty(attrs)) existing.attrs = attrs;
	},
	/**
	Compares the new and old list of classNames and
	if there is any difference, it sets the whole thing at once.

	@method _diffClassNames
	@param existing {vDOM} virtual DOM node to apply this classNames to
	@param value {Array} Object literal containing the current values
	@param newValue {Array} Object literal containin the new values
	@private
	*/
	_diffClassNames: function (existing, value, newValue) {
		value = (value || []); // the current one should already been sorted from the previous round.
		newValue = (newValue || []).sort();

		var l = value.length, i = 0;
		if (l === newValue.length) {
			while (i < l && value[i] == newValue[i]) i++;
		}
		if (i < l) {
			existing.node.setAttribute('class', newValue.join(' ').trim());
		}
	},
	/**
	Compares the new and old styles and fixes the differences in the DOM

	@method _diffStyles
	@param existing {vDOM} virtual DOM node to apply this styles to
	@param value {Object} Object literal containing the current values
	@param newValue {Object} Object literal containin the new values
	@private
	*/
	_diffStyles: function (existing, value, newValue) {
		var styles = Object.keys(value).concat(Object.keys(newValue)).sort(),
			prevStyle,
			nodeStyle = existing.node.style;

		styles.forEach(function (style) {
			// skip over duplicates
			if (style == prevStyle) return;
			prevStyle = style;
			if (style in value) {
				if (style in newValue) {
					if (value[style] === newValue[style]) return;
					nodeStyle[style] = newValue[style];
				} else {
					nodeStyle[style] = '';
				}
			} nodeStyle[style] = newValue[style];
		});

	}


};
module.exports = v;
//=============================

/**
Internal, virtual representation of an actual DOM node.
There are two sub-versions of it.

* For text nodes, the vNode will be an instance of String
  with an extra `node` property.
* For nodes corresponding to Parcel containers, the node
  will have the extra `parcel` and `stamp` properties.

The virtual DOM version differs from that produced by the
[Parcel.view](Parcel.html#method_view) method in that it has the `node`
property set.

This entry is just for documentation purposes.
There is no actual code for this class.  It is created as an object literal.


@class vNode
@protected
@static
*/

/**
Represents the DOM `tagName` or node type.
Corresponds to the HTML element type.

@property tag
@type String
@default "DIV"
@static
*/
/**
The value of the `xmlns` attribute for namespaced elements
such as `svg`.

@property namespace
@type String
@default undefined
@static
*/
/**
DOM node corresponding to the virtual node.
It is only present in the internal vDOM and only assigned
after the DOM has been rendered.

@property node
@type DOM element
@private
@static
*/
/**
Collection of the attributes of the DOM element.
It is an hash map of attribute names to attribute values.

@property attrs
@type Object
@default {}
@static
*/

/**
Array of children nodes of this node.
The children can be either
* further vNodes,
* pNodes
* plain values which will be converted to strings or tNodes

@property children
@type Array
@default undefined
@static
*/
/**
Reference to the [Parcel](Parcel.html) instance that has produced this pNode
and its descendants.

@property parcel
@type Parcel
@static
*/
/**
Value returned by the [`stamp()`](Parcel.html#method_stamp) method
to compare whether the parcel contents has changed
@property stamp
@type Any
@default NaN
@static
*/
