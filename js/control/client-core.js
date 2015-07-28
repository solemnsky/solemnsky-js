/*                  ******** client-core.js ********                   //
\\ This exports a base client, a minimal wrapper over the offline      \\
// internals of a mode. It should be adequately paremeterized to be    //
\\ used in all other clients.                                          \\
//                  ******** client-core.js ********                   */

PIXI = require("../../assets/pixi.min.js")
nameFromkeyCode = require("../resources/keys.js")

module.exports = function(mode, initdata) {
/**** {{{ requestAnimFrame ****/
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
requestAnimFrame = (function() {
	return window.requestAnimationFrame   || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame    || 
		window.oRequestAnimationFrame      || 
		window.msRequestAnimationFrame     || 
		function(callback, /* DOMElement */ element){
			window.setTimeout(callback, SolemnSky.tickTimeMs);
		};
})();
/**** }}} requestAnimFrame ****/

/**** {{{ init ****/
// init()
mode.init(initdata)
mode.join("offline player")

// initRender()
var renderer =
	PIXI.autoDetectRenderer(1600, 900, 
		{backgroundColor : 0x000010, antialias : true})
document.body.appendChild(renderer.view)

var fps = new PIXI.Text("", {fill: 0xFFFFFF})
fps.position = new PIXI.Point(1400, 10)

var stage = new PIXI.Container(); stage.addChild(fps)
var modeStage = new PIXI.Container(); stage.addChild(modeStage)

mode.initRender(modeStage)
/**** }}} init ****/

/**** {{{ smartResize() ****/
function setMargins(mleft, mtop) {
	document.body.style.setProperty("margin-left", mleft + "px")
	document.body.style.setProperty("margin-top", mtop + "px")
}

function smartResize() {
	w = window.innerWidth; h = window.innerHeight;
	if ((w / h) > (16 / 9)) {
		nw = h * (16 / 9); nh = h
		renderer.resize(nw, nh)
		setMargins((w - nw) / 2, 0)
	} else {
		nh = w * (9 / 16); nw = w
		renderer.resize(nw, nh)
		setMargins(0, (h - nh) / 2)
	}

	stage.scale = new PIXI.Point(nw / 1600, nh / 900)
}
/**** }}} smartResize() ****/

/**** {{{ update loops ****/
var renderCounter = 0
var engineCounter = 0

function logCounters() { 
	window.setTimeout(logCounters, 1000)

	fps.text = "render: " + renderCounter + "Hz\n" + "engine: " + engineCounter + "Hz"
	renderCounter = 0 
	engineCounter = 0 
}

simulating = true;

// step()
then = Date.now()
function update() {
	engineCounter++
	requestAnimFrame(update)

	now = Date.now()
	delta = now - then
	then = now

	if (simulating) mode.step(delta)
} 

// stepRender()
thenRender = Date.now()
function updateRender() {
	renderCounter++
	requestAnimFrame(updateRender)

	nowRender = Date.now()
	delta = nowRender - thenRender
	thenRender = now

	mode.stepRender(modeStage, delta)
	renderer.render(stage)
}
/**** }}} update loops ****/

/**** {{{ event handling ****/
keyHandler = function(state) {
	return (
		function(e) {
			mode.acceptKey(0, nameFromKeyCode(e.keyCode), state)
		}
	)
}

window.onresize = smartResize
window.addEventListener("keydown", keyHandler(true), true)
window.addEventListener("keyup", keyHandler(false), true)
/**** }}} event handling ****/

smartResize()
update()
updateRender()
logCounters()
}
