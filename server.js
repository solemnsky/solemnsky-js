//Import Box2D library
Box2D = require("./assets/box2d.min.js");

//Socket server
WebSocketServer = require("ws").Server;

//Import common game engine code
Game = require("./game.js");

var lastId = 0;

Game.prototype.emitBlob = function() {
	var blob = this.players.length;
	for (var i = 0; i < this.players.length; i ++) {
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

		ws.send(SolemnSky.emitBlob() + "\n");
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

//Start the tick loop
GameServer.onTick();