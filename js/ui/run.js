/*                  ******** run.js ********                           //
\\ Runs a UI object.                                                   \\ 
//                  ******** run.js ********                           */

// object: an object containing init, step, initRender, stepRender, hasEnded, and acceptKey properities (exactly the same as in the mode specification)

Keys = require('../resources/keys.js')
nameFromKeyCode = Keys.nameFromKeyCode
keyCodeFromName = Keys.keyCodeFromName

module.exports = function(target, object) {
	var renderer =
		PIXI.autoDetectRenderer(1600, 900, 
			{backgroundColor : 0x000010, antialias : true})
	document.body.appendChild(renderer.view)
	var stage = new PIXI.Container()

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

	window.onresize = smartResize
	smartResize()
	
	runWithStage(target, renderer, stage, object)
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
				window.setTimeout(callback, (1/target) * 1000);
			};
	})();
	/**** }}} requestAnimFrame ****/

runWithStage = function(target, renderer, stage, object) {
	stage.removeChildren()
	renderer.render(stage)

	object.initRender(stage)
	object.init()

	var running = true;

	var fps = 0; var fpsC = 0
	var tps = 0; var tpsC = 0
	var accum = 0;
	var lastPrint = Date.now()

	resetFps = function() {
		if (running) {
			window.setTimeout(resetFps, 1000)
			fps = fpsC; fpsC = 0
			tps = tpsC; tpsC = 0
		}
	}

	/**** {{{ step ****/
	then = Date.now()
	function update() {
		running = (!object.hasEnded())
		if (running) {
			requestAnimFrame(update)

			now = Date.now()
			delta = now - then
			then = now

			accum += delta

			var needPaint = false;
			while (accum >= ((1 / target) * 1000)) {
				object.step(delta)
				accum -= ((1 / target) * 1000)
				needPaint = true
				tpsC++
			}

			if (needPaint) {
				object.stepRender(stage, delta, tps, fps)
				renderer.render(stage)
				fpsC++
			}
		} else {
			window.removeEventListener("keyup", acceptKeyUp)
			window.removeEventListener("keydown", acceptKeyDown)
			if (typeof object.next !== "undefined")
				runWithStage(target, renderer, stage, object.next())
		}
	} 
	/**** }}} step ****/

	function acceptKeyUp(e) {
		if (object.acceptKey(nameFromKeyCode(e.keyCode), false))
			e.preventDefault(); //Don't allow the page to use this
	}
	function acceptKeyDown(e) {
		if (object.acceptKey(nameFromKeyCode(e.keyCode), true))
			e.preventDefault(); //Don't allow the page to use this
	}

	window.addEventListener("keyup", acceptKeyUp)
	window.addEventListener("keydown", acceptKeyDown)

	resetFps()
	update()
}
