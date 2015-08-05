/*                  ******** client-offline.js ********                //
\\ Offline demo client.                                                \\
//                  ******** client-offline.js ********                */

PIXI = require('../../assets/pixi.min.js')
ui = require('../ui/index.js')

module.exports = function(mode) {
	function Game() {
		this.fps = new PIXI.Text("", {fill: 0xFFFFFF})
		this.fps.position = new PIXI.Point(1400, 10)
		this.modeStage = new PIXI.Container(); 
	}

	Game.prototype.init = function() { 
		mode.init(mode.makeInitData(""))
		mode.join("offline player")
	}

	Game.prototype.step = function(delta) {
		mode.step(delta)
	}

	Game.prototype.initRender = function(stage) {
		stage.addChild(this.fps)
		stage.addChild(this.modeStage)

		mode.initRender(this.modeStage)
	}

	Game.prototype.stepRender = 
		function(stage, delta, fps) {
			this.fps.text = fps + "tps"
			mode.stepRender(0, this.modeStage, delta) 
		}

	Game.prototype.hasEnded = function() {
		return false
	}

	Game.prototype.acceptKey = function(key, state) {
		mode.acceptKey(0, key, state)
	}

	return new Game() 
}
