/*                  ******** run.js ********                           //
\\ A collection of trivial UI object constructors.                     \\
//                  ******** run.js ********                           */

var PIXI = require('../../assets/pixi.min.js')
var run = require('./run.js')

exports.run = run

exports.combineOverlay = function(overlay, object) {
	function Result() { 
		this.overlay = new PIXI.Container()
		this.main = new PIXI.Container()
	}

	Result.prototype.init = function() {
		overlay.init(); object.init()
	}
	Result.prototype.step = function(delta) {
		overlay.step(delta); object.step(delta)
	}
	Result.prototype.initRender = function(stage) {
		overlay.initRender(this.overlay); object.initRender(this.main)
		stage.addChild(this.overlay); stage.addChild(this.main)
	}
	Result.prototype.stepRender = function(stage, delta, x, y) {
		overlay.stepRender(this.overlay, delta, x, y)
		object.stepRender(this.main, delta, x, y)
	}
	Result.prototype.acceptKey = function(key, state){
		object.acceptKey(key, state)
	}
	Result.prototype.hasEnded = function() { return object.hasEnded() }

	return new Result()
}
