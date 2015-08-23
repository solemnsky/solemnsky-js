/*                  ******** load-assets.js ********                   //
\\ Loading screen during mode.loadLoader().                            \\
//                  ******** load-assets.js ********                   */

// TODO

var PIXI = require('../../../assets/pixi.min.js')

module.exports = function(mode, key) {
	function Loader() {
		this.progress = 0

		this.textAnim = 0
	}

	Loader.prototype.init = function() {
		mode.loadAssets(key, 
			(function(athis) {		
				return function(progress) { athis.progress = progress }
			})(this)				
		)
	}

	Loader.prototype.initRender = function(stage) {
		this.bar = new PIXI.Graphics()
		this.text = new PIXI.Text("loading...", {fill: 0xFFFFFF})
		this.text.position.set(450, 400)
		stage.addChild(this.bar)
		stage.addChild(this.text)
	}

	Loader.prototype.step = function(delta) {
		
	}

	Loader.prototype.stepRender = function(stage) {
		this.bar.clear()
		this.bar.beginFill(0xFFFFFF)
		this.bar.drawRect(400, 445, this.progress * 100 + 400, 10)
	}

	Loader.prototype.hasEnded = function() {
		return this.progress === 1
	}

	return new Loader()
}
