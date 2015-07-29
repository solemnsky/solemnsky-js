/*                  ******** client-core.js ********                   //
\\ This exports a base client, a minimal wrapper over the offline      \\
// internals of a mode. It should be adequately paremeterized to be    //
\\ used in all other clients.                                          \\
//                  ******** client-core.js ********                   */

PIXI = require('../../assets/pixi.min.js')
nameFromkeyCode = require('../resources/keys.js')
runPixi = require('../resources/pixi.js')

module.exports = function(mode, callback, overlay) {
if (typeof overlay == "undefined") overlay = new PIXI.Container()
if (typeof callback  == "undefined") 
	callback = function() { }

fps = new PIXI.Text("", {fill: 0xFFFFFF})
fps.position = new PIXI.Point(1400, 10)
modeStage = new PIXI.Container(); 

init = function(stage) {
	stage.addChild(fps)
	stage.addChild(modeStage)
	stage.addChild(overlay)

	mode.initRender(modeStage)
}

step = function(stage, delta) {
	fps.text = 
		"render: " + renderFps + "Hz\n" + "engine: " + engineFps + "Hz"
	mode.stepRender(modeStage, delta) 
}

logicStep = function(delta) {
	mode.step(delta)
	callback()
}

pixiCore(init, step, logicStep)

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
