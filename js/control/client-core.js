/*                  ******** client-core.js ********                   //
\\ This exports a base client, a minimal wrapper over the offline      \\
// internals of a mode. It should be adequately paremeterized to be    //
\\ used in all other clients.                                          \\
//                  ******** client-core.js ********                   */

PIXI = require('../../assets/pixi.min.js')
ui = require('../ui/index.js')

module.exports = function(mode, hasEnded) {
	function Game() {
		this.fps = new PIXI.Text("", {fill: 0xFFFFFF})
		this.fps.position = new PIXI.Point(1400, 10)
		this.modeStage = new PIXI.Container(); 
	}

	Game.prototype.init = function() {
		mode.init()
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
		function(stage, delta, renderFps, engineFps) {
			this.fps.text = 
				"render: " + renderFps + "Hz\n" + "engine: " + engineFps + "Hz"
			mode.stepRender(this.modeStage, delta) 
		}

	Game.prototype.hasEnded = function() {
		return hasEnded()
	}

	Game.prototype.acceptKey = function(key, state) {
		mode.acceptKey(0, key, state)
	}

	return new Game() 
}
