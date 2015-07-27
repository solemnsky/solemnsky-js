/*                  ******** offline.js ********                   //
\\ This file makes an offline client to test out a mode with a     \\
// single player. Requites a 'mode' in scope.                      //
//                  ******** offline.js ********                   */

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
mode.init()
mode.join("offline player")

// initRender()
var renderer =
	PIXI.autoDetectRenderer(1600, 900, 
		{backgroundColor : 0x000010, antialias : true})
document.body.appendChild(renderer.view)

var stage = new PIXI.Container()

mode.initRender(stage)
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
// step()
then = Date.now()
function update() {
	requestAnimFrame(update)

	now = Date.now()
	delta = now - then

  mode.step(delta)
} 

// stepRender()
thenRender = Date.now()
function updateRender() {
	requestAnimFrame(updateRender)

	now = Date.now()
	delta = now - then

	smartResize()
	mode.stepRender(stage, delta)
	renderer.render(stage)
}
/**** }}} update loops ****/

update()
updateRender()

Mousetrap.handleKey = 
	function(key, modifiers, state) {
		mode.acceptKey(0, key, modifiers, state)
	}
