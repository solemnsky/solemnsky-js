/*                  ******** run.js ********                           //
\\ Runs a UI object.                                                   \\ 
//                  ******** run.js ********                           */

// object: an object containing init, step, initRender, stepRender, hasEnded, and acceptKey properities 

var PIXI = require('../../assets/pixi.min.js')

var Keys = require('../resources/keys.js')
var nameFromKeyCode = Keys.nameFromKeyCode

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
		var w = window.innerWidth; var h = window.innerHeight;
		if ((w / h) > (16 / 9)) {
			var nw = h * (16 / 9); var nh = h
			renderer.resize(nw, nh)
			setMargins((w - nw) / 2, 0)
		} else {
			var nh = w * (9 / 16); var nw = w
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
var requestAnimFrame = (function(target) {
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

function runWithStage(target, renderer, stage, object) {
	stage.removeChildren()
	renderer.render(stage)

	object.initRender(stage)
	object.init()

	var blurred = false
	var running = true

	var accum = 0;

	// performance data
	var fps = 0; var fpsC = 0
	var tps = 0; var tpsC = 0
	var processStart = 0 // used for getting delta times
	var logicTime = 0; var renderTime = 0; var sleepTime = 0
	// the cycle deltas 

	function resetFps() {
		if (running) {
			window.setTimeout(resetFps, 1000)
			fps = fpsC; fpsC = 0
			tps = tpsC; tpsC = 0
		}
	}

	/**** {{{ step ****/
	var then = Date.now()
	function update() {
		running = (!object.hasEnded())

		var now = Date.now()
		var delta = now - then
		then = now

		if (running) { 
			if (!blurred) {
				requestAnimFrame(update) 
			} else {
				setTimeout(update, ((1/target) * 1000))
			}

			sleepTime = Date.now() - processStart
			
			accum += delta
			
			processStart = Date.now() // start logic
			var needPaint = false;
			while (accum >= ((1 / target) * 1000)) {
				object.step((1 / target) * 1000)
				accum -= ((1 / target) * 1000)
				needPaint = true
				tpsC++
			}
			logicTime = Date.now() - processStart // end logic

			if (needPaint) {
				var performance = 
					{ tps: tps
					, fps: fps
					, logicTime: logicTime
					, renderTime: renderTime 
					, sleepTime: sleepTime }
				processStart = Date.now() // start render
				object.stepRender(stage, delta, performance)
				renderer.render(stage)
				renderTime = Date.now() - processStart // end render
				fpsC++
			}

			processStart = Date.now() // start sleep
		} else {
			window.removeEventListener("keyup", acceptKeyUp)
			window.removeEventListener("keydown", acceptKeyDown)
			window.removeEventListener("blur", onBlur)
			window.removeEventListener("focus", onFocus)

			if (typeof object.next !== "undefined")
				runWithStage(target, renderer, stage, object.next())
		}
	} 
	/**** }}} step ****/

	function acceptKeyUp(e) { acceptKey(e, false) }
	function acceptKeyDown(e) { acceptKey(e, true) }
	function acceptKey(e, state) {
		const name = nameFromKeyCode(e.keyCode)
		object.acceptKey(name, state)
		// some keys have quite obnoxious default cases
		// while others, such as the debug terminal, do not
		switch (name) {
		case ("back_space"): 
			e.preventDefault(); break
		default: break
		}
	}	

	function onBlur() { blurred = true }
	function onFocus() { blurred = false }	

	window.addEventListener("keyup", acceptKeyUp)
	window.addEventListener("keydown", acceptKeyDown)
	window.addEventListener("blur", onBlur)
	window.addEventListener("focus", onFocus)

	resetFps()
	update()
}
