/*                  ******** load-assets.js ********                   //
\\ Loading screen during mode.loadLoader().                            \\
//                  ******** load-assets.js ********                   */

var PIXI = require('../../../assets/pixi.min.js')

module.exports = function(str) {
	function Loader() {
		this.timer =  0
	}

	Loader.prototype.init = function() {
	}

	Loader.prototype.initRender = function(stage) {
		this.text = new PIXI.Text("", {fill: 0xFFFFFF})
		stage.addChild(this.text)
	}

	Loader.prototype.step = function(delta) {
		this.timer += delta
	}

	Loader.prototype.stepRender = function(stage) {
		this.text.text = this.timer
	}

	Loader.prototype.hasEnded = function() {
		return false
	}

	return Loader
}
