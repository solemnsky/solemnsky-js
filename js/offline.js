/*                  ******** offline.js ********                   //
\\ This file defines a simple offline client. It aims to be as     \\
// simple as possible, delegating all logic to the game engine.    // 
\\ It exists for testing and demonstration purposes.               \\ 
//                  ******** offline.js ********                   */

/**** {{{ constants, helper functions ****/
// global DOM values
var canvas = document.getElementById("c");
var ctx = canvas.getContext("2d");

// smart request animation frame
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
/**** }}} constants, helper functions ****/

/**** {{{ game state ****/
SolemnSky = new Game();
SolemnSky.setFPS(60);
SolemnSky.init();
SolemnSky.addUpdateCallback(render);
requestAnimFrame(update);

function update() {
	SolemnSky.update()
	requestAnimFrame(update)
}
/**** }}} game state ****/

/**** {{{ rendering functions ****/
function renderBox(body, width, height) {
	//Reset the transform of the context
	ctx.resetTransform();

	//Box position
	var playerX = body.GetPosition().x * SolemnSky.scale;
	var playerY = body.GetPosition().y * SolemnSky.scale;

	//Transform the context to render this in position
	ctx.translate(playerX, playerY);
	ctx.rotate(body.GetAngle());
	
	//TODO: Use the shape's path
	ctx.fillRect(-width / 2, -height / 2, width, height);
	ctx.strokeRect(-width / 2, -height / 2, width, height);
}

function render() {
	//Clear the display before rendering
	ctx.resetTransform();
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, windowSize.width, windowSize.height);

	//Render player
	SolemnSky.players.forEach(function each(player) {
		ctx.fillStyle = "#bbffbb";
		ctx.strokeStyle = "#77ff77";

		renderBox(player.block, 30, 30);

		var playerX = player.block.GetPosition().x * this.scale;
		var playerY = player.block.GetPosition().y * this.scale;

		ctx.resetTransform();
		ctx.fillStyle = "#000000";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(player.name, playerX, playerY);
	}, SolemnSky);
	SolemnSky.map.forEach(function each(box) {
		var data = box.GetUserData();

		ctx.fillStyle = "#" + tinycolor("hsv(" + (100 * box.life / data.fields.life) + ", 30, 100)").toHex();
		ctx.strokeStyle = "#" + tinycolor("hsv(" + (100 * box.life / data.fields.life)+ ", 50, 100)").toHex();

		renderBox(box, data.w, data.h);
	}, SolemnSky);
} 
/**** }}} rendering functions ****/

/**** {{{ key bindings ****/
Mousetrap.bind('up', function() { 
		SolemnSky.findPlayerById(myid).movement.forward = true;
	}, 'keydown');
Mousetrap.bind('up', function() { 
		SolemnSky.findPlayerById(myid).movement.forward = false; 
	}, 'keyup');
Mousetrap.bind('down', function() { 
		SolemnSky.findPlayerById(myid).movement.backward = true; 
	}, 'keydown');
Mousetrap.bind('down', function() { 
		SolemnSky.findPlayerById(myid).movement.backward = false; 
	}, 'keyup');
Mousetrap.bind('left', function() { 
		SolemnSky.findPlayerById(myid).movement.left = true; 
	}, 'keydown');
Mousetrap.bind('left', function() { 
		SolemnSky.findPlayerById(myid).movement.left = false; 
	}, 'keyup');
Mousetrap.bind('right', function() { 
		SolemnSky.findPlayerById(myid).movement.right = true; 
	}, 'keydown');
Mousetrap.bind('right', function() { 
		SolemnSky.findPlayerById(myid).movement.right = false; 
	}, 'keyup');
/**** }}} key bindings ****/

// start things up
var myid = 0;
SolemnSky.addPlayer(0, 0, 0, "player", "", "")
