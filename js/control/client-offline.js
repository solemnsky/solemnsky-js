/*                  ******** client-offline.js ********                //
\\ Offline demo client.                                                \\
//                  ******** client-offline.js ********                */

PIXI = require('../../assets/pixi.min.js')
ui = require('../ui/index.js')
renderHud = require('./hud.js')

module.exports = function(mode) {
	function Game() {
		this.fps = new PIXI.Text("", {fill: 0xFFFFFF})
		this.fps.position = new PIXI.Point(1400, 10)
		this.modeStage = new PIXI.Container(); 
		this.hudStage = new PIXI.Container()

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
		stage.addChild(this.fps)
		stage.addChild(this.modeStage)
		stage.addChild(this.hudStage)

		mode.initRender(this.modeStage)
	}

	Game.prototype.stepRender = function(stage, delta, performance) {
		this.fps.text = performance.tps + "tps, " + performance.fps + "fps" + "\nrender delta: " + performance.renderTime
		mode.stepRender(0, this.modeStage, delta) 
		renderHud(this.eventLog, this.hudStage)
	}

	Game.prototype.hasEnded = function() { return false }

	Game.prototype.acceptKey = function(key, state) {
		mode.acceptEvent({id: 0, type: "control", name: key, state: state})
	}

	return new Game() 
}
