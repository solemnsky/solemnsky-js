/*                  ******** render.js ********                    //
\\ This file defines a gameLoop() method for clients.              \\
//                  ******** render.js ********                    */


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

function render(canvas, ctx) {
	canvas.height = 900;
	canvas.width = 1600;

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
