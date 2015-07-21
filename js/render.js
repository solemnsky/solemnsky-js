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

/**** {{{ drawing various types of entities ****/
function drawPlayer(player) {
	//Only create a sprite for this player if we haven't already
	if (typeof(player.sprite) === "undefined") {
		//TODO: Temporary bunny texture until we can get better assets
		var texture = PIXI.Texture.fromImage('http://pixijs.github.io/examples/_assets/basics/bunny.png');
		var bunny = new PIXI.Sprite(texture);
		//Box2d objects are anchored in the center
		bunny.anchor.x = 0.5;
		bunny.anchor.y = 0.5;
		//Assign it so we don't create more
		player.sprite = bunny;
		//TODO: Temp scaling
		player.sprite.scale = new PIXI.Point(4, 4)
		stage.addChild(bunny);
	}
	//Update position of the sprite to the player's position
	var position = player.block.GetPosition()
	player.sprite.position.x = position.x * SolemnSky.scale
	player.sprite.position.y = position.y * SolemnSky.scale
}

function drawBox(box) {
	//Only create a sprite for this box if we haven't already
	if (typeof(box.sprite) === "undefined") {
		//TODO: Temporary bunny texture until we can get better assets
		var texture = PIXI.Texture.fromImage('http://pixijs.github.io/examples/_assets/basics/bunny.png');
		var bunny = new PIXI.Sprite(texture);
		//Box2d objects are anchored in the center
		bunny.anchor.x = 0.5;
		bunny.anchor.y = 0.5;
		//Assign it so we don't create more
		box.sprite = bunny;
		//TODO: Temp scaling
		box.sprite.scale = new PIXI.Point(2, 2)
		stage.addChild(bunny);
	}
	//Update position of the sprite to the box's position
	var position = box.GetPosition()
	box.sprite.position.x = position.x * SolemnSky.scale
	box.sprite.position.y = position.y * SolemnSky.scale
}
/**** }}} drawing various types of entities ****/

function renderGame() {
	//Render players
	SolemnSky.players.forEach(function(player) {
		drawPlayer(player);
	});

	//Render the map
	SolemnSky.map.forEach(function(box) {
		drawBox(box);
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
