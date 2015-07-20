/*                  ******** render.js ********                    //
\\ This file uses pixi to display the game world. Expected global  \\
// values in include:                                              //
\\   SolemnSky (game engine), potential chat feature.              \\
//                  ******** render.js ********                    */

var renderer = 
	PIXI.autoDetectRenderer(1600, 900, {backgroundColor : 0x1099bb});
document.body.appendChild(renderer.view);

var stage = new PIXI.Container();

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

/**** {{{ renderGame() ****/
player = new PIXI.Graphics()
player.beginFill(0xFFFFFF, 1)
player.drawRect(0, 0, 30, 30)
player.position = new PIXI.Point(0, 0)
stage.addChild(player)

function renderGame() {
	var pos = SolemnSky.players[0].block.GetPosition()
	player.position.x = pos.x 
	player.position.y = pos.y 
}
/**** }}} renderGame() ****/

/**** {{{ animate() ****/
//http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame   || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame    || 
		window.oRequestAnimationFrame      || 
		window.msRequestAnimationFrame     || 
		function(callback, /* DOMElement */ element){
			window.setTimeout(callback, SolemnSky.tickTimeMs);
		};
})();

function animate() {
	SolemnSky.update()
	smartResize()

	renderGame()

	renderer.render(stage);

	requestAnimationFrame(animate);
}
/**** }}}{ animate() ****/

animate();
