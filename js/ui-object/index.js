/*                  ******** run.js ********                           //
\\ A collection of trivial UI object constructors.                     \\
//                  ******** run.js ********                           */

PIXI = require('../../assets/pixi.min.js')
run = require('./run.js')

module.exports = {
	run = run

	splash = function(texts, interval) {
		function Splash() {
			this.texts = texts.reverse
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
			if (this.texts.length !== 0) 
				if (this.time > interval) {
					this.text.text = this.texts.pop()
					this.time = 0
				}
		}
		Splash.prototype.hasEnded = function() {
			(this.texts.length === 0)
		}
		Splash.prototype.acceptKey = function(){}

		return new Splash()
	}
}
