/*jshint esnext:true */
/*global describe, it */
"use strict";
var expect = require('chai').expect,
	should = require('chai').should();

global.window = global.window || require('./utils/fake-dom.js');

var vDOM = require('../js/component/virtual-dom.js'),
	Parcel = require("../js/component/parcel.js"),
	v = vDOM.vNode;

class P1 extends Parcel {
	constructor (config) {
		super(config);
		config = config || {};
		this.counter = config.start || 0;
	}
	view (v) {
		return v('div.parcel',[
			v('p',this.counter),
			v('br')
		]);
	}

}

describe('Parcel', function () {
	describe('instance of', function () {
		var p = new Parcel();
		it('Parcel', function () {
			p.should.be.an.instanceof(Parcel);
			p.should.not.be.an.instanceof(P1);
		});
		var p1 = new P1();
		it('P1', function () {
			p1.should.be.an.instanceof(Parcel);
			p1.should.be.an.instanceof(P1);
		});
	});
	describe('init', function () {
		describe('no initial config', function () {
			var p = new P1();
			it('should have initialized counter', function () {
				(p.counter).should.be.equal(0);
			});
		});
		describe('no initial config', function () {
			var p = new P1({start:1});
			it('should have initialized counter', function () {
				(p.counter).should.be.equal(1);
			});
		});
	});
	describe('on destruction', function () {
		it('should be called when swapping root parcels', function (done) {
			class P1 extends Parcel {
				destructor () {
					done();
				}
			}
			vDOM.rootApp(P1);
			vDOM.rootApp(Parcel);
		});
		it('should be chained', function (done) {
			class P2 extends Parcel {
				destructor () {
					done();
				}
			}
			class P1 extends Parcel {
				constructor () {
					super();
					this.p2 = new P2();
				}
			}
			vDOM.rootApp(P1);
			vDOM.rootApp(Parcel);
		});
		it('should handle arrays of sub-parcels', function () {
			var count = 0;
			class P2 extends Parcel {
				destructor () {
					count++;
				}
			}
			class P1 extends Parcel {

				constructor () {
					super();
					this.subP = [];
					for (var i = 0; i < 5; i++)  {
						this.subP[i] = new P2();
					}
				}
			}
			vDOM.rootApp(P1);
			vDOM.rootApp(Parcel);
			expect(count).eql(5);

		});
		it('should run in its own context', function (done) {
			class P2 extends Parcel {
				constructor () {
					super();
					this.a = 4;
				}
				destructor () {
					expect(this.a).eql(4);
					done();
				}
			}
			class P1 extends Parcel {
				constructor () {
					super();
					this.p2 = new P2();
				}
			}
			vDOM.rootApp(P1);
			vDOM.rootApp(Parcel);
		});
	});


});


