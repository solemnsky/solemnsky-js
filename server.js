//Import Box2D library
Box2D = require("./assets/box2d.min.js");

//Socket server
WebSocketServer = require("ws").Server;

//Import common game engine code
Game = require("./game.js");

//List of boxes with which to initialize the world 
var boxes = [
	//{x: windowSize.width / 2, y: windowSize.height, w: 600, h: 10, static: true, fields: {life: 1e300}},
	{x:  90, y:  30, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}},
	{x: 130, y: 110, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}},
	{x: 470, y: 230, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}},
	{x: 210, y: 130, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}},
	{x: 350, y:  30, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}},
	{x: 390, y: 140, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}},
	{x: 430, y: 270, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}},
	{x: 570, y: 300, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}}
];

var lastId = 0;
Game.prototype.emitBlob = function() {
	var blob = this.players.length;
	var showPlayer = function(player) {
		var block = player.block;
		var position = block.GetPosition();
		var velocity = block.GetLinearVelocity();
		var angle = block.GetAngle();
		var angular = block.GetAngularVelocity();
		return (';' + player.name + ',' + player.id + ',' + position.x + ',' + position.y + ',' + velocity.x + ',' + velocity.y + ',' + angle + ',' + angular)
	}
	this.players.map(showPlayer).
		var player = this.players[i];
		var block = player.block;
		var position = block.GetPosition();
		var velocity = block.GetLinearVelocity();
		var angle = block.GetAngle();
		var angular = block.GetAngularVelocity();
		blob += ';' + player.name + ',' + player.id + ',' + position.x + ',' + position.y + ',' + velocity.x + ',' + velocity.y + ',' + angle + ',' + angular;
	}
	return blob;
}

function Server() {}

Server.prototype.initWorld = function() {
	//Init the boxes into the world
	for (var i = 0; i < boxes.length; i ++) {
		var box = boxes[i];
		SolemnSky.boxes.push(SolemnSky.createBox(box.x, box.y, box.w, box.h, box.static, box.fields));
	}
}

Server.prototype.emitBoxesBlob = function() {
	var blob = boxes.length;
	for (var i = 0; i < boxes.length; i ++) {
		var box = boxes[i];
		blob += ';' + box.x + ',' + box.y + ',' + box.w + ',' + box.h + ',' + box.static + ',' + JSON.stringify(box.fields).replace(/,/g, "\\:");
	}
	return blob;
}


Server.prototype.openSocket = function(port) {
	wss = new WebSocketServer({port: port});

	wss.on("connection", function connection(ws) {
		ws.on("message", function incoming(message) {
			GameServer.parseData(ws, message);
		});
		ws.on("close", function close() {
			console.log("Client left");
			SolemnSky.deletePlayer(ws.playerId);
		});

		ws.send("BOXES " + GameServer.emitBoxesBlob() + "\n");
	});
}

Server.prototype.parseData = function(ws, data) {
	var split = data.split(" ");
	var command = split[0];
	split.splice(0, 1);
	data = split.join(" ");
	// console.log("Command: " + command + " data: " + data);
	switch (command) {
		case "NAME":
			ws.playerId = SolemnSky.addPlayer(lastId++, 320 / SolemnSky.scale, 240 / SolemnSky.scale, data, "#00ff00", "");
			break;
		case "MOVEMENT":
			var id = ws.playerId;
			var direction = split[0];
			var state = parseInt(split[1]);
			SolemnSky.players[SolemnSky.findPlayerById(id)].movement[direction] = state;
			break;
	}
}

Server.prototype.onTick = function() {
	setTimeout(function() {
		GameServer.onTick();
	}, SolemnSky.tickTimeMs);

	var blob = SolemnSky.emitBlob();

	//Send all the clients a tick message
	wss.clients.forEach(function each(client) {
		try {
			client.send("PLAYERS " + blob + "\n");
		} catch (e) {
			//They've disconnected

		}
	});

	SolemnSky.update();
}

SolemnSky = new Game();
SolemnSky.setFPS(30);
SolemnSky.init();

GameServer = new Server();
GameServer.openSocket(50042);
GameServer.initWorld();

//Start the tick loop
GameServer.onTick();
