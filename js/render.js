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
function drawPlayer(player) {
	if (typeof(player.sprite) === "undefined") {
		var texture = PIXI.Texture.fromImage('http://pixijs.github.io/examples/_assets/basics/bunny.png');
		var bunny = new PIXI.Sprite(texture);
		bunny.anchor.x = 0.5;
		bunny.anchor.y = 0.5;
		player.sprite = bunny;
		player.sprite.scale = new PIXI.Point(4, 4)
		stage.addChild(bunny);
	}
	var position = player.block.GetPosition()
	player.sprite.position.x = position.x * SolemnSky.scale
	player.sprite.position.y = position.y * SolemnSky.scale
}

function renderGame() {
	SolemnSky.players.forEach(function(player) {
		drawPlayer(player);
	});
}
/**** }}} renderGame() ****/

/**** {{{ animate() ****/

function animate() {
	smartResize()
	renderGame()

	renderer.render(stage);
}

SolemnSky.addUpdateCallback(animate);

/**** }}}{ animate() ****/
