/*                  ******** render.js ********                    //
\\ This file uses pixi to display the game world. Expected global  \\
// values in are:                                                  //
\\   SolemnSky (game engine)                                       \\
//                  ******** render.js ********                    */

var renderer =
	PIXI.autoDetectRenderer(1600, 900, {backgroundColor : 0x000010, antialias : true});

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
players = new PIXI.Container()
map = new PIXI.Container()

fps = new PIXI.Text("", {fill: 0xFFFFFF})
fps.position = new PIXI.Point(1400, 10)

stage.addChild(map)
stage.addChild(players)
stage.addChild(fps)

function renderMap() {
	map.removeChildren()

	var mapGraphics = new PIXI.Graphics()

	mapGraphics.clear
	mapGraphics.beginFill(0xFFFFFF, 1)
	
	SolemnSky.map.forEach(
		function(block) {
			var data = block.GetUserData()
			mapGraphics.drawRect(
				data.x - (data.w / 2)
				, data.y - (data.h / 2)
				, data.w, data.h
			)
		}
	)
	
	map.addChild(mapGraphics)
}

function renderPlayers() {
	players.removeChildren()

	SolemnSky.players.forEach(
		function(player) {
			var pos = SolemnSky.players[0].position
			var rot = SolemnSky.players[0].rotation
			var stalled = SolemnSky.players[0].stalled

			var playerGraphics = new PIXI.Graphics()

			playerGraphics.clear()
			playerGraphics.beginFill(0xFFFFFF , stalled ? 0.5 : 1)
			playerGraphics.drawRect(-(gameplay.playerWidth / 2), -(gameplay.playerHeight / 2), gameplay.playerWidth, gameplay.playerHeight)
			playerGraphics.beginFill(0x800000, 1)
			playerGraphics.drawRect(15, -(gameplay.playerHeight / 2), ((gameplay.playerWidth / 2) - 15), gameplay.playerHeight)

			playerGraphics.position = new PIXI.Point(pos.x, pos.y)
			playerGraphics.rotation = rot;
			
			players.addChild(playerGraphics)
		}
	)
}

function renderGame() {
	renderPlayers()
}
/**** }}} renderGame() ****/

/**** {{{ animate() ****/
var renderCounter = 0
var engineCounter = 0
var last = Date.now()

function logCounters() { 
	window.setTimeout(logCounters, 1000)

	fps.text = "render: " + renderCounter + "Hz\n" + "engine: " + engineCounter + "Hz"
	renderCounter = 0 
	engineCounter = 0 
}

function animate() {
	renderCounter += 1

	requestAnimationFrame(animate);
	renderGame()
	renderer.render(stage);
}

SolemnSky.addUpdateCallback( function() { engineCounter += 1 } )

window.addEventListener('resize', function(event){
	smartResize()
});
/**** }}} animate() ****/

smartResize()
renderMap()
animate();
logCounters();
