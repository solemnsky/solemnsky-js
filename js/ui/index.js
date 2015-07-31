/*                  ******** run.js ********                           //
\\ A collection of trivial UI object constructors.                     \\
//                  ******** run.js ********                           */

PIXI = require('../../assets/pixi.min.js')
run = require('./run.js')

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
