/*									******** splash.js ********									 //
\\ Branding splash screen.                                       \\
//									******** splash.js ********									 */

var PIXI = require('../../../assets/pixi.min.js')

module.exports = function(ctrl, scale) {
	var third = scale / 3

	function Splash() {
		this.time = 0
	}

	Splash.prototype.init = function() { } 

	Splash.prototype.initRender = function(stage) {
		this.text = new PIXI.Text("The Solemnsky Project", {fill: 0xFFFFFF})
		this.text.position.set(800, 450)
		stage.addChild(this.text)
	}

	Splash.prototype.step = function(delta) {
		this.time += delta
	}

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

	Splash.prototype.acceptKey = function() {}

	Splash.prototype.hasEnded = function() {
		return this.time > scale 
	}

	Splash.prototype.next = function() {return ctrl}

	return new Splash()
}
