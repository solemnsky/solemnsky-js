/*                  ******** run.js ********                           //
\\ Runs a little UI object and then does something else.               \\
//                  ******** run.js ********                           */

// object: an object containing init, step, initRender, stepRender, hasEnded, and acceptKey properities (exactly the same as in the mode specification)
// next: the thing to do after the definition reportes that is has ended 

module.exports = function(object, next) {
if (typeof next === "undefined") next = function(){}

var running = true;

var engineFps = 0; var renderFps = 0
var renderFpsC = 0; var engineFpsC = 0

resetFps = function() {
	if (running) {
		window.setTimeout(resetFps, 1000)
		renderFps = renderFpsC; engineFps = engineFpsC
		renderFpsC = 0; engineFpsC = 0
	}
}

/**** {{{ requestAnimFrame ****/
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
requestAnimFrame = (function() {
	return window.requestAnimationFrame  || 
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
renderer =
	PIXI.autoDetectRenderer(1600, 900, 
		{backgroundColor : 0x000010, antialias : true})
document.body.appendChild(renderer.view)

stage = new PIXI.Container()
object.initRender(stage)
object.init()
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

/**** {{{ step ****/
// step()
then = Date.now()
function updateRender() {
	if (running) {
		renderFpsC++
		requestAnimFrame(updateRender)

		now = Date.now()
		delta = now - then
		then = now

		object.stepRender(stage, delta, renderFps, engineFps)
		renderer.render(stage)
	}
} 

thenEngine = Date.now()
function updateEngine() {
	running = (!object.hasEnded())
	if (running) {
		engineFpsC++

		requestAnimFrame(updateEngine)

		nowEngine = Date.now()
		delta = nowEngine - thenEngine
		thenEngine = nowEngine

		object.step(delta)
	} else {
		document.body.removeChild(renderer.view)
		renderer.destroy()
		next()
	}
}
/**** }}} step ****/

window.addEventListener("keyup", acceptKey(false))
window.addEventListener("keydown", acceptKey(true))

function acceptKey(state) {
	return function(e) {
		object.acceptKey(Utils.nameFromKeyCode(e.keycode), state)
	}
}

window.onresize = smartResize

smartResize()
resetFps()
updateRender()
updateEngine()
}
