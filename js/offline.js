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

//Start up the game
SolemnSky = new Game();
SolemnSky.setFPS(60);
SolemnSky.init();
requestAnimFrame(update);
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

	SolemnSky.projectiles.forEach(function each(projectile) {
		var data = projectile.GetUserData();
		var life = 1000 - (Date.now() - data.creationDate);
		if (life <= 0 || life > 1000)
			return;

		//If the S is in [0, 1] then tinycolor thinks it's a float from [0, 1]
		ctx.fillStyle = "#" + tinycolor("hsv(0, " + (Math.ceil(30 * (life / 1000)) + 1) + ", 100)").toHex();
		ctx.strokeStyle = "#" + tinycolor("hsv(0, " + (Math.ceil(50 * (life / 1000)) + 1) + ", 100)").toHex();

		renderBox(projectile, data.w, data.h);
	}, SolemnSky);
} // render()
/**** }}} rendering functions ****/

/**** {{{ safe update method ****/
then = Date.now();
function update() {
	now = Date.now();

	elapsed = now - then;
	// console.log(elapsed);
	requestAnimFrame(update);

	if (elapsed > SolemnSky.tickTimeMs) {
		then = now - (elapsed % SolemnSky.tickTimeMs);

		SolemnSky.update();
		render();
	}
} 
/**** }}} safe update method ****/

/**** {{{ key bindings ****/
Mousetrap.bind('up', 
	function() { SolemnSky.players[SolemnSky.findIndexById(myid)].movement.forward = true; sendSnapshot()}, 'keydown');
Mousetrap.bind('up', 
	function() { SolemnSky.players[SolemnSky.findIndexById(myid)].movement.forward = false; sendSnapshot()}, 'keyup');
Mousetrap.bind('down', 
	function() { SolemnSky.players[SolemnSky.findIndexById(myid)].movement.backward = true; sendSnapshot()}, 'keydown');
Mousetrap.bind('down', 
	function() { SolemnSky.players[SolemnSky.findIndexById(myid)].movement.backward = false; sendSnapshot()}, 'keyup');
Mousetrap.bind('left', 
	function() { SolemnSky.players[SolemnSky.findIndexById(myid)].movement.left = true; sendSnapshot()}, 'keydown');
Mousetrap.bind('left',
	function() { SolemnSky.players[SolemnSky.findIndexById(myid)].movement.left = false; sendSnapshot()}, 'keyup');
Mousetrap.bind('right', 
	function() { SolemnSky.players[SolemnSky.findIndexById(myid)].movement.right = true; sendSnapshot()}, 'keydown');
Mousetrap.bind('right', 
	function() { SolemnSky.players[SolemnSky.findIndexById(myid)].movement.right = false; sendSnapshot()}, 'keyup');
// ugh what an ugly hack
/**** }}} key bindings ****/

// start things up
var myid = 0;
SolemnSky.addPlayer(0, 0, 0, "player", "", "")
