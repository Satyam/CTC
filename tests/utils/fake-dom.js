"use strict";
var Url = require('url');

var used = {};

var count = function (method) {
	if (!used[method]) {
		used[method] = 1;
	} else {
		used[method] += 1;
	}
};
var vNodeParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g;


var window = {},
	doc = window.document = {};

doc.childNodes = [];
doc.createElement = function(tag) {
	count('createElement');
	return {
		style: {},
		childNodes: [],
		nodeName: tag.toUpperCase(),
		appendChild: doc.appendChild,
		removeChild: doc.removeChild,
		replaceChild: doc.replaceChild,
		matches: doc.matches,
		querySelector: doc.querySelector,
		querySelectorAll: doc.querySelectorAll,
		insertBefore: function(node, reference) {
			count('insertBefore');
			node.parentNode = this;
			var referenceIndex = this.childNodes.indexOf(reference);
			if (referenceIndex < 0) {
				this.childNodes.push(node);
			} else {
				var index = this.childNodes.indexOf(node);
				this.childNodes.splice(referenceIndex, index < 0 ? 0 : 1, node);
			}
		},
		insertAdjacentHTML: function(position, html) {
			count('insertAdjacentHTML');

			//todo: accept markup
			if (position == "beforebegin") {
				this.parentNode.insertBefore(doc.createTextNode(html), this);
			} else if (position == "beforeend") {
				this.appendChild(doc.createTextNode(html));
			}
		},
		setAttribute: function(name, value) {
			count('setAttribute');
			this[(name == 'class'?'className':name)] = value.toString();
			if (name == 'href') {
				var url = Url.parse(value);
				this.pathname = url.pathname;
				if (url.search) this.search = url.search;
			}
		},
		setAttributeNS: function(namespace, name, value) {
			count('setAttributeNS');
			this.namespaceURI = namespace;
			this[(name == 'class'?'className':name)] = value.toString();
		},
		getAttribute: function(name, value) {
			count('getAttribute');
			return this[name];
		},
		addEventListener: doc.addEventListener,
		removeEventListener: doc.removeEventListener,
		dispatchEvent: doc.dispatchEvent,
		// matchesSelector should match nested selectors like: "#someid .somedivclass button.someclass"
		matchesSelector: function (selector) {
			var selList = selector.replace(/( )+/g, ' ').split(' '),
			    size = selList.length,
			    matches, i, selectorItem, node, selMatch;
			matches = function (checkNode, sel) {
				count('matchesSelector');
				// don't forget to reset the found position of the previous search:
				vNodeParser.lastIndex = 0;
				var match,
					found = false,
					classes = checkNode.className && checkNode.className.split(' ');
				/*jshint boss:true*/
				while (match = vNodeParser.exec(sel)) {
					/*jshint boss:false*/
					switch (match[1]) {
						case "":
							if (checkNode.nodeName !== match[2].toUpperCase()) return false;
							found = true;
							break;
						case "#":
							if (checkNode.id !== match[2]) return false;
							found = true;
							break;
						case ".":

							if (!classes || classes.indexOf(match[2]) === -1) return false;
							found = true;
							break;
					}
				}
				return found;
			};
			if (size===0) {
				return false;
			}
			node = this;
			selectorItem = selList[size-1];
            selMatch = matches(node, selectorItem);
			for (i=size-2; (selMatch && (i>=0)); i--) {
				selectorItem = selList[i];
	            node = node.parentNode;
	            while (node && !(selMatch=matches(node, selectorItem))) {
	            	node = node.parentNode;
	            }
			}
			return selMatch;
		},
		getElementById: doc.getElementById,
		contains: doc.contains
	};
};
doc.createElementNS = function(namespace, tag) {
	count('createElementNS');
	var element = doc.createElement(tag);
	element.namespaceURI = namespace;
	return element;
};
doc.createTextNode = function(text) {
	count('createTextNode');
	return {nodeValue: text.toString()};
};
doc.documentElement = doc.createElement("html");
doc.replaceChild = function(newChild, oldChild) {
	count('replaceChild');
	var index = this.childNodes.indexOf(oldChild);
	if (index > -1) this.childNodes.splice(index, 1, newChild);
	else this.childNodes.push(newChild);
	newChild.parentNode = this;
	oldChild.parentNode = null;
};
doc.appendChild = function(child) {
	count('appendChild');
	var index = this.childNodes.indexOf(child);
	if (index > -1) this.childNodes.splice(index, 1);
	this.childNodes.push(child);
	child.parentNode = this;
};
doc.removeChild = function(child) {
	count('removeChild');
	var index = this.childNodes.indexOf(child);
	this.childNodes.splice(index, 1);
	child.parentNode = null;
};
doc.addEventListener = function (type, cb, capture) {
	count('addEventListener');
	if (!this.$on) this.$on = {};
	this.$on[type] = {
		cb: cb,
		capture: capture
	};
};
doc.removeEventListener = function (type) {
	count('removeEventListener');
	if (this.$on && this.$on[type]) {
		delete this.$on[type];
	}
};
var EventTypes = {
	MouseEvents: function () {
		this.initMouseEvent = function (type, bubbles, cancelable, view, detail,
				screenX, screenY, clientX, clientY,
				ctrlKey, altKey, shiftKey, metaKey,
				button, relatedTarget) {
			count('initMouseEvent');
			this.ev = {
				type:type,
				bubbles:bubbles,
				cancelable:cancelable,
				view:view,
				detail:detail,
				screenX:screenX,
				screenY:screenY,
				clientX:clientX,
				clientY:clientY,
				ctrlKey:ctrlKey,
				altKey:altKey,
				shiftKey:shiftKey,
				metaKey:metaKey,
				button:button,
				relatedTarget:relatedTarget
			};
		};
	}
};
doc.createEvent = function (type) {
	count('createEvent');
	return new EventTypes[type]();
};
doc.dispatchEvent = function (event) {
	count('dispatchEvent');
	var branch = [],
		el = this,
		type = event.ev.type,
		cb,
		ev = event.ev;
	ev.target = this;

	while(el) {
		if (el.$on && el.$on[type] && el.$on[type].capture) {
			branch.push(el);
			branch.push(el.$on[type].cb);
		}
		el = el.parentNode;
	}
	while ((cb =  branch.pop())) {
		ev.currentTarget = branch.pop();
		cb.call(this, ev);
	}
	el = this;
	while (el) {
		if (el.$on && el.$on[type] && !el.$on[type].capture) {
			ev.currentTarget = el;
			el.$on[type].cb.call(this, ev);
		}
		if (el['on' + type]) {
			ev.currentTarget = el;
			el['on' + type].call(this, ev);
		}
		el = el.parentNode;
	}
};


doc.getElementById = function (id) {
	count('getElementById');
	var found = null,
		find = function (el) {
			if (el.id === id) {
				found = el;
				return true;
			}
			if (el.childNodes) {
				return el.childNodes.some(find);
			}
		};
	find(doc);
	return found;
};
doc.contains = function (node) {
	count('contains');
	while (node && node !== this) node = node.parentNode;
	return node === this;
};

// See note on querySelector all
doc.matches = function (selector) {
  var matches = doc.querySelectorAll(selector);
  var i = 0;

  while (matches[i] && matches[i] !== this) {
    i++;
  }

  return matches[i] ? true : false;
};

/*
*IMPORTANT*

This is not a full implementation.  It is just made for testing other components.

It supports
* multiple selectors separated with commas
* chained selectors separate with spaces (not direct descendants > )
* tag, id and className
* No attribute or pseudo selectors.

*/

doc.querySelectorAll = function (selector) {
	var nodes = [],
		selParser = /(?:(^|#|\.)([^#\.]+))/g,
		blanks = /\s+/g,
		conditions;

	selector.split(',').forEach(function (value) {
		var match;
		conditions = value.trim().replace(blanks,' ').split(' ').map(function (sel) {
			var condition = {classNames: []};
			/*jshint boss:true*/
			while (match = selParser.exec(sel)) {
				/*jshint boss:false*/
				switch (match[1]) {
					case "":
						condition.tag = match[2].toUpperCase();
						break;
					case "#":
						condition.id = match[2];
						break;
					case ".":
						condition.classNames.push(new RegExp('\\b' + match[2] + '\\b'));
						break;
					default:
						return false;
				}
			}
			return condition;
		});
	});
	var numConditions = conditions.length;
	var check = function (el, matches) {
		var condition = conditions[matches];
		if (!(
			(condition.id && el.id != condition.id) ||
			(condition.tag && el.nodeName != condition.tag) ||
			condition.classNames.some(function (className) {
				return className.test(el.className);
			})
		)) {
			matches++;

			if (matches == numConditions) {
				nodes.push(el);
				return;
			}
		}
		el.childNodes.forEach(function (childEl) {
			check(childEl, matches);
		});
	};
	check(this.body?this.body:this, 0);
	return nodes;
};

// See note on querySelector all
doc.querySelector = function (selector) {
	var elements = doc.querySelectorAll(selector);
	return (elements.length) ? elements[0] : null;
};
window.performance = new function () {
	var timestamp = 50;
	this.$elapse = function(amount) {
		timestamp += amount;
	};
	this.now = function() {
		return timestamp;
	};
};
window.cancelAnimationFrame = function() {};
window.requestAnimationFrame = function(callback) {
	window.requestAnimationFrame.$callback = callback;
};
window.requestAnimationFrame.$resolve = function() {
	if (window.requestAnimationFrame.$callback) window.requestAnimationFrame.$callback();
	window.requestAnimationFrame.$callback = null;
	window.performance.$elapse(20);
};
window.location = {};

var getHTML = function (node) {
	var prop, val,
		style, styles = [],
		html = '';

	if (!node.nodeName && node.nodeValue !== undefined) {
		return node.nodeValue;
	}
	html += '<' + node.nodeName;
	for (prop in node) {
		// Ignore properties that are meant for internal use
		if (prop[1] == '$') continue;
		val = node[prop];

		// Ignore functions, those will be revived on the client side.
		if (typeof val == 'function') continue;
		switch (prop) {
		case 'nodeName':
		case 'parentNode':
		case 'childNodes':
		case 'pathname':
		case 'search':
			continue;
		case 'checked':
			if (val == 'false') continue;
			break;
		case 'href':
			val = node.pathname;
			break;
		case 'className':
			prop = 'class';
			break;
		case 'style':
			if (val) {
				for (style in val) {
					if (val[style]) {
						styles.push(style + ': ' + val[style]);
					}
				}
				if (!styles.length) continue;
				val = styles.join(';');
			}
			break;
		}
		html += ' ' + prop + '="' + val.replace('"', '\\"') + '"';
	}

	if (node.childNodes.length) {
		html += '>' + node.childNodes.reduce(function (prev, node) {
			return prev + getHTML(node);
		}, '') + '</' + node.nodeName + '>';
	} else {
		// I don't know why Mithril assigns the content of textareas
		// to its value attribute instead of the innerHTML property.
		// Since it doesn't have children, the closing tag has to be forced.
		if (node.nodeName == 'TEXTAREA') {
			html += '></TEXTAREA>';
		} else {
			html += '/>';
		}
	}
	return html;
};
var getBrief = function (node) {
	var prop, val,
		style, styles = [],
		summary = {};

	if (!node.nodeName && node.nodeValue !== undefined) {
		return {value: node.nodeValue};
	}
	summary.tag = node.nodeName;
	for (prop in node) {
		// Ignore properties that are meant for internal use
		if (prop[1] == '$') continue;
		val = node[prop];

		// Ignore functions, those will be revived on the client side.
		if (typeof val == 'function') continue;
		switch (prop) {
		case 'nodeName':
		case 'parentNode':
		case 'childNodes':
		case 'pathname':
		case 'search':
			continue;
		case 'href':
			val = node.pathname;
			break;
		case 'style':
			if (val) {
				for (style in val) {
					if (val[style]) {
						styles.push(style + ': ' + val[style]);
					}
				}
				if (!styles.length) continue;
				val = styles.join(';');
			}
			break;
		}
		summary[prop] = val;
	}

	if (node.childNodes.length) {
		summary.children = node.childNodes.map(getBrief);
	}
	return summary;
};
var reset = function () {
	window.location.search = "?/";
	window.location.pathname = "/";
	window.location.hash = "";
	window.history = {};
	window.history.pushState = function(data, title, url) {
		window.location.pathname = window.location.search = window.location.hash = url;
	},
	window.history.replaceState = function(data, title, url) {
		window.location.pathname = window.location.search = window.location.hash = url;
	};
	var _body = doc.createElement('body');
	doc.appendChild(_body);
	doc.body = _body;
};
reset();

window.navigator = {

	userAgent: 'fake',
	stats: {
		clear: function () {
			used = {};
		},
		get: function () {
			return used;
		}
	},
	reset: reset,
	getHTML: function () {
		return getHTML(doc.body);
	},
	getBrief: function () {
		return getBrief(doc.body);
	},
	navigate: function (url) {
		var u = Url.parse(url, false, true);
		window.location.search = u.search || '';
		window.location.pathname = u.pathname || '';
		window.location.hash = u.hash || '';
	}
};

module.exports = window;
