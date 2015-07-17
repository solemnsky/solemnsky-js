
var players = [];
var lastId = 0;

var fps = 60.0;
var tickTime = 1 / fps;

function Player(x, y, name, color, image) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.name = name;
    this.color = color;
    this.image = image;
    this.id = lastId ++;
    
    this.movement = {
        forward: false,
        backward: false,
        left: false,
        right: false
    };
}

function addPlayer(x, y, name, color, image) {
    var player = new Player(x, y, name, color, image);
    players.push(player);
    return player.id;
}

function emitBlob() {
    var blob = players.length;
    for (var i = 0; i < players.length; i ++) {
        blob += ';' + players[i].name + ',' + players[i].id + ',' + players[i].x + ',' + players[i].y + ',' + players[i].vx + ',' + players[i].vy;
    }
    return blob;
}

function findPlayerById(id) {
    for (var i = 0; i < players.length; i ++) {
        if (players[i].id == id)
            return i;
    }
    return -1; //Blow up here
}

function deletePlayer(id) {
    var player = players[id];
    delete players[id];
}

function updatePlayer(id) {
    //TODO
}

var wss;
var WebSocketServer = require("ws").Server;
function openSocket(port) {

	wss = new WebSocketServer({port: port});

	wss.on("connection", function connection(ws) {
		ws.on("message", function incoming(message) {
			parseData(message);
		});

		ws.send(emitBlob() + "\n");
	});

	function parseData(data) {
		var split = data.split(" ");
		var command = split[0];
		split.splice(0, 1);
		data = split.join(" ");
		console.log("Command: " + command + " data: " + data);
		switch (command) {
			case "NAME":
				addPlayer(320, 240, data, "#00ff00", "");
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
