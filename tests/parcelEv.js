/*jshint esnext:true */
/*global describe, it */
"use strict";
var expect = require('chai').expect;

var simulateClick = require('./utils/simulateClick.js');

global.window = global.window || require('./utils/fake-dom.js');

var vDOM = require('../js/component/virtual-dom.js'),
	ParcelEv = require("../js/component/parcelEv.js");

describe ('ParcelEv', function () {
	describe('simple click', function () {
		it('with a single element', function () {
			var p,
				beenThere = false;
			class P extends ParcelEv {
				constructor () {
					super({
						EVENTS: {
							click: {
								button: function (ev) {
									expect(this).eql(p);
									beenThere = true;
								}
							}
						}
					});
				}
				view (v) {
					return v('button#id','hello');
				}

			}

			p = vDOM.rootApp(P);
			simulateClick(global.window.document.getElementById('id'));
			expect(beenThere).to.be.true;
			vDOM.rootApp(ParcelEv);
			expect(p._pNode.node.$on.click).to.be.empty;

		});
		it('with a nested elements', function () {
			var p,
				a = '';
			class P extends ParcelEv {
				constructor () {
					super({
						EVENTS: {
							click: {
								div: function (ev) {
									//should never bubble into this one
									expect(this).eql(p);
									a += ev.target.id;
								},
								button: function (ev) {
									expect(this).eql(p);
									a += ev.target.id;
								}
							}
						}
					});
				}
				view (v) {
					return v('div#id',[
						v('button#id0','hello'),
						v('button#id1','hello')
					]);
				}
			}

			p = vDOM.rootApp(P);
			simulateClick(global.window.document.getElementById('id0'));
			expect(a).eql('id0');
			vDOM.rootApp(ParcelEv);

		});
	});
});

