//Import Box2D library
Box2D = require("./assets/box2d.min.js");

//Socket server
WebSocketServer = require("ws").Server;

//Import common game engine code
Game = require("./game.js");
SolemnSky = new Game();
SolemnSky.init();

Game.prototype.emitBlob = function() {
    var blob = players.length;
    for (var i = 0; i < players.length; i ++) {
        blob += ';' + players[i].name + ',' + players[i].id + ',' + players[i].x + ',' + players[i].y + ',' + players[i].vx + ',' + players[i].vy;
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

	setInterval(this.onTick, 1 / 20.0);
}

Server.prototype.parseData = function(ws, data) {
	var split = data.split(" ");
	var command = split[0];
	split.splice(0, 1);
	data = split.join(" ");
	// console.log("Command: " + command + " data: " + data);
	switch (command) {
		case "NAME":
			ws.playerId = SolemnSky.addPlayer(320, 240, data, "#00ff00", "");
			break;
	}
}

Server.prototype.onTick = function() {
	SolemnSky.update();

	//Send all the clients a tick message
	wss.clients.forEach(function each(client) {
		try {
			client.send(SolemnSky.emitBlob() + "\n");
		} catch (e) {
			//They've disconnected

		}
	});
}

GameServer = new Server();
GameServer.openSocket(50042);
