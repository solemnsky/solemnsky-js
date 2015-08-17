/*                  ******** load-assets.js ********                   //
\\ Loading screen during mode.loadLoader().                            \\
//                  ******** load-assets.js ********                   */

// TODO

var PIXI = require('../../../assets/pixi.min.js')

module.exports = function(mode, key) {
	function Loader() {
		this.progress = 0
	}

	Loader.prototype.init = function() {
		mode.loadAssets(key, function(progress) { this.progress = progress } )
	}

	Loader.prototype.initRender = function(stage) {
		this.text = new PIXI.Text("", {fill: 0xFFFFFF})
		stage.addChild(this.text)
	}

	Loader.prototype.step = function(delta) {
	}

	Loader.prototype.stepRender = function(stage) {
		this.text.text = this.progress
	}

	Loader.prototype.hasEnded = function() {
		return this.progress === 1
	}

	return new Loader()
}
