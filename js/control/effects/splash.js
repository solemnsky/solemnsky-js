/*									******** splash.js ********									 //
\\ Branding splash screen.                                       \\
//									******** splash.js ********									 */

module.exports = Splash

var PIXI = require('../../../assets/pixi.min.js')

function Splash() {
	this.time = 0
}

Splash.prototype.init = function() {
}

Splash.prototype.initRender = function(stage) {
	this.text = new PIXI.Text("The Solemnsky Project", {fill: 0xFFFFFF})
	this.text.position.set(800, 450)
	stage.addChild(this.text)
}

Splash.prototype.step = function(delta) {
	this.time += delta
}

var scale = 2000
var third = scale / 3

Splash.prototype.stepRender = function() {

	if (this.time < third) {
		this.text.alpha = this.time / third
	} else {
		if (this.time < third * 2) {
			this.text.alpha = 1
		} else {
			this.text.alpha = (scale - this.time) / third
		}
	}
}

Splash.prototype.hasEnded = function() {
	return this.time > scale + third
}
