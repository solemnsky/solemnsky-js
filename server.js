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
    	var position = players[i].block.GetPosition();
    	var velocity = players[i].block.GetLinearVelocity();
        blob += ';' + players[i].name + ',' + players[i].id + ',' + position.x + ',' + position.y + ',' + velocity.x + ',' + velocity.y;
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
			ws.playerId = SolemnSky.addPlayer(320, 240, data, "#00ff00", "");
			break;
		case "MOVEMENT":
			var id = ws.playerId;
			var direction = split[0];
			var state = parseInt(split[1]);
			players[SolemnSky.findPlayerById(id)].movement[direction] = state;
			break;
	}
}

Server.prototype.onTick = function() {
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
SolemnSky.addUpdateCallback(GameServer.onTick);


//Start the tick loop
setInterval(SolemnSky.update, 1 / 60);
