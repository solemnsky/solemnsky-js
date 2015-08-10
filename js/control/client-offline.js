/*                  ******** client-offline.js ********                //
\\ Offline demo client.                                                \\
//                  ******** client-offline.js ********                */

PIXI = require('../../assets/pixi.min.js')
ui = require('../ui/index.js')

renderPerf = require('./hud/performance.js')

module.exports = function(mode) {
	function Game() {
		this.perfStage = new PIXI.Container()
		this.modeStage = new PIXI.Container()

		this.eventLog = []
	}

	Game.prototype.init = function() { 
		mode.init(mode.makeInitData(""))
		mode.join("offline player")
	}

	Game.prototype.step = function(delta) {
		this.eventLog = this.eventLog.concat(mode.step(delta))
	}

	Game.prototype.initRender = function(stage) {
		stage.addChild(this.modeStage)
		stage.addChild(this.perfStage)

		mode.initRender(this.modeStage)
		renderPerf.initRender(this.perfStage)
	}

	Game.prototype.stepRender = function(stage, delta, performance) {
		mode.stepRender(0, this.modeStage, delta) 
		renderPerf.stepRender(this.perfStage, delta, performance)
	}

	Game.prototype.hasEnded = function() { return false }

	Game.prototype.acceptKey = function(key, state) {
		mode.acceptEvent({id: 0, type: "control", name: key, state: state})
	}

	return new Game() 
}
