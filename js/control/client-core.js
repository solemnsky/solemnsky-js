/*                  ******** client-core.js ********                   //
\\ This exports a base client, a minimal wrapper over the offline      \\
// internals of a mode. It should be adequately paremeterized to be    //
\\ used in all other clients.                                          \\
//                  ******** client-core.js ********                   */

PIXI = require('../../assets/pixi.min.js')
nameFromKeyCode = require('../resources/keys.js')
runPixi = require('../resources/pixi.js')

module.exports = function(mode, callback, overlay) {
if (typeof overlay == "undefined") overlay = new PIXI.Container()
if (typeof callback  == "undefined") 
	callback = function() { }

function Game() {
	this.fps = new PIXI.Text("", {fill: 0xFFFFFF})
	this.fps.position = new PIXI.Point(1400, 10)
	this.modeStage = new PIXI.Container(); 
}

Game.prototype.init = function(stage) {
	stage.addChild(this.fps)
	stage.addChild(this.modeStage)
	stage.addChild(overlay)

	mode.initRender(this.modeStage)
}

Game.prototype.renderStep = function(stage, delta) {
	this.fps.text = 
		"render: " + renderFps + "Hz\n" + "engine: " + engineFps + "Hz"
	mode.stepRender(this.modeStage, delta) 
}

Game.prototype.step = function(delta) {
	mode.step(delta)
	this.callbackResult = callback()
}

Game.prototype.hasEnded = function() {
	return false
}

runPixi(new Game())

/**** {{{ event handling ****/
keyHandler = function(state) {
	return (
		function(e) 
			{ mode.acceptKey(0, nameFromKeyCode(e.keyCode), state) }
	)
}

window.addEventListener("keydown", keyHandler(true), true)
window.addEventListener("keyup", keyHandler(false), true)
/**** }}} event handling ****/
}
