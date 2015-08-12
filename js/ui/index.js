/*                  ******** run.js ********                           //
\\ A collection of trivial UI object constructors.                     \\
//                  ******** run.js ********                           */

var PIXI = require('../../assets/pixi.min.js')
var run = require('./run.js')

exports.run = run

exports.splash = function(texts, interval) {
	function Splash() {
		this.time = 0
		this.text = new PIXI.Text("", {fill: 0xFFFFFF})
	}

	Splash.prototype.init = function() {}
	Splash.prototype.step = function(delta) { 
		this.time += delta 
	}
	Splash.prototype.initRender = function(stage) { 
		stage.addChild(this.text) 
	}
	Splash.prototype.stepRender = function(stage, delta) {
		this.text.text = "asdf"
	}
	Splash.prototype.hasEnded = function() {
		return false
	}
	Splash.prototype.acceptKey = function(){}

	return new Splash()
}

exports.centerText = function(text) {
	var center = Object()
	center.init = function(){}
	center.step = function(){}
	center.initRender = function(stage) {
		this.text = new PIXI.Text(text, {fill: 0xFFFFFF})
		stage.addChild(text)
	}
	center.stepRender = function(){}
	center.acceptKey = function(){}
	center.hasEnded = function(){return false}
	return center
}

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
