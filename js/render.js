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
player.beginFill(0xFFFFFF, 0.5)
player.drawRect(-21, -21, 42, 42)

map = new PIXI.Graphics()

stage.addChild(map)
stage.addChild(player)

function renderMap () {
	map.clear
	map.beginFill(0xFFFFFF, 1)
	
	SolemnSky.map.forEach(
		function(block) {
			var data = block.GetUserData()
			map.drawRect(data.x - (data.w / 2), data.y - (data.h / 2), data.w, data.h)
		}
	)
}

function renderGame() {
	var pos = SolemnSky.players[0].position
	var rot = SolemnSky.players[0].rotation
	player.position = new PIXI.Point(pos.x, pos.y)
	player.rotation = rot;
}
/**** }}} renderGame() ****/

/**** {{{ animate() ****/

function animate() {
	requestAnimationFrame(animate);
	renderGame()
	renderer.render(stage);
}

window.addEventListener('resize', function(event){
	smartResize()
});

renderMap()
animate();
