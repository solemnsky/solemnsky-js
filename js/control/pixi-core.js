/*                  ******** pixi-core.js ********                     //
\\ This exports a method for a basic UI with pixi, highly reusable.    \\
//                  ******** pixi-core.js ********                     */

// init: function called exactly once with a container
// step: function called in a 60Hz loop with a container and a time delta
// logicStep: step logic forward, supplied with a time delta
// set running = true at any time to break out

module.exports = function(init, renderStep, logicStep, secondStep) {
if (typeof init === "undefined") init = function(stage) {}
if (typeof renderStep === "undefined") renderStep = function(stage, delta) {}
if (typeof logicStep === "undefined") logicStep = function(delta) {}
if (typeof secondStep === "undefined") secondStep = function() {}

running = true;

engineFps = 0; renderFps = 0
renderFpsC = 0; engineFpsC = 0
resetFps = function() {
	window.setTimeout(resetFps, 1000)
	renderFps = renderFpsC; engineFps = engineFpsC
	renderFpsC = 0; engineFpsC = 0
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
init(stage)
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
	renderFpsC++
	if (!running) return
	requestAnimFrame(updateRender)

	now = Date.now()
	delta = now - then
	then = now

	renderStep(stage, delta)
	renderer.render(stage)
} 
if (!running) return

thenEngine = Date.now()
function updateEngine() {
	engineFpsC++
	if (!running) return

	requestAnimFrame(updateEngine)

	nowEngine = Date.now()
	delta = nowEngine - thenEngine
	thenEngine = nowEngine

	logicStep(delta)
}
if (!running) return
/**** }}} step ****/

window.onresize = smartResize

smartResize()
resetFps()
updateRender()
updateEngine()
}
