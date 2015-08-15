/*									******** splash.js ********									 //
\\ Splash screen.                                                      \\
//									******** splash.js ********									 */

module.exports = Splash

var PIXI = require('../../assets/pixi.min.js')

function Splash() {
	this.time = 0
}

Splash.prototype.init = function() {
}

Splash.prototype.initRender = function(stage) {
	this.text = new PIXI.Text
	this.text.position.set(800, 450)
	stage.addChild(this.text)
}

Splash.prototype.step = function(delta) {
	this.time += delta
}

Splash.prototype.stepRender = function() {
	this.text.text = this.time
}

Splash.prototype.hasEnded = function() {
	return this.time > 1000
}
