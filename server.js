//Import Box2D library
Box2D = require("./assets/box2d.min.js");

//Import common game engine code
require("./game.js");

function emitBlob() {
    var blob = players.length;
    for (var i = 0; i < players.length; i ++) {
        blob += ';' + players[i].name + ',' + players[i].id + ',' + players[i].x + ',' + players[i].y + ',' + players[i].vx + ',' + players[i].vy;
    }
    return blob;
}

var wss;
var WebSocketServer = require("ws").Server;
function openSocket(port) {
	wss = new WebSocketServer({port: port});

	wss.on("connection", function connection(ws) {
		ws.on("message", function incoming(message) {
			parseData(ws, message);
		});
		ws.on("close", function close() {
			deletePlayer(ws.playerId);
		});

		ws.send(emitBlob() + "\n");
	});

	function parseData(ws, data) {
		var split = data.split(" ");
		var command = split[0];
		split.splice(0, 1);
		data = split.join(" ");
		console.log("Command: " + command + " data: " + data);
		switch (command) {
			case "NAME":
				ws.playerId = addPlayer(320, 240, data, "#00ff00", "");
				break;
		}
	}
}

openSocket(50042);

function onTick() {
	//Send all the clients a tick message
	wss.clients.forEach(function each(client) {
		try {
			client.send(emitBlob() + "\n");
		} catch (e) {
			//They've disconnected

		}
	});
}

setInterval(onTick, 1 / 20.0);
