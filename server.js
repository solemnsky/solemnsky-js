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
    	var position = this.players[i].block.GetPosition();
    	var velocity = this.players[i].block.GetLinearVelocity();
        blob += ';' + this.players[i].name + ',' + this.players[i].id + ',' + position.x + ',' + position.y + ',' + velocity.x + ',' + velocity.y;
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
	var blob = SolemnSky.emitBlob();

	//Send all the clients a tick message
	wss.clients.forEach(function each(client) {
		try {
			client.send(blob + "\n");
		} catch (e) {
			//They've disconnected

		}
	});
}

SolemnSky = new Game();
SolemnSky.setFPS(5);
SolemnSky.init();

GameServer = new Server();
GameServer.openSocket(50042);
SolemnSky.addUpdateCallback(function() {
	GameServer.onTick();
});

//Start the tick loop
setInterval(function() {
	SolemnSky.update();
}, SolemnSky.tickTimeMs);
