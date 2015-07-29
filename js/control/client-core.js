/*                  ******** client-core.js ********                   //
\\ This exports a base client, a minimal wrapper over the offline      \\
// internals of a mode. It should be adequately paremeterized to be    //
\\ used in all other clients.                                          \\
//                  ******** client-core.js ********                   */

PIXI = require('../../assets/pixi.min.js')
nameFromkeyCode = require('../resources/keys.js')
pixiCore = require('./pixi-core.js')

module.exports = function(mode, callback, overlay) {
if (typeof overlay == "undefined") overlay = new PIXI.Container()
if (typeof callback  == "undefined") 
	callback = function() { }

running = true;

pixiCore(init, step, logicStep, secondStep)

var fps = new PIXI.Text("", {fill: 0xFFFFFF})
fps.position = new PIXI.Point(1400, 10)
var modeStage = new PIXI.Container(); 

init = function(stage) {
	stage.addChild(fps)
	stage.addChild(modeStage)
	stage.addChild(overlay)

	mode.initRender(modeStage)
}

var renderCounter = 0
step = function(stage, delta) {
	renderCounter++
	mode.stepRender(modeStage, delta) 
}

var engineCounter = 0
logicStep = function(delta) {
	engineCounter++
	mode.step(delta)
	callback()
}

secondStep = function() { 
	fps.text = 
		"render: " + renderCounter + "Hz\n" + "engine: " + engineCounter + "Hz"
	renderCounter = 0 
	engineCounter = 0 
}

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
