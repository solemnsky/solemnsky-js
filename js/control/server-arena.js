/*                  ******** server-arena.js ********                  //
// An arena server where players may join and quit freely.             \\
\\                  ******** server-arena.js ********                  */

module.exports = function(port, mode, key) {
//Sockets
WebSocket = require("ws");

function getClientAddress(client) {
	return client._socket.remoteAddress + ":" + client._socket.remotePort;
}

function broadcast(message) {
	wss.clients.forEach(function(client) {
		try {
			client.send(message);
		} catch (e) {
			//Disconnected... just ignore this
		}
	});
}

function openSocket(port) {
	wss = new WebSocket.Server({port: port});
	wss.on("connection", function(client) {
		onClientConnected(client);
	});
}

function onClientConnected(client) {
	//Bind the client's handlers
	client.on("message", function(message) {
		onMessage(client, message);
	});
	client.on("close", function() {
		onClientDisconnected(client);
	});

	console.log("Client " + getClientAddress(client) + " connected");
}

function onClientDisconnected(client) {
	console.log("Client " + getClientAddress(client) + " disconnected");
	mode.quit(client.id)
	broadcast("QUIT " + client.id)
}

function onMessage(client, message) {
	// console.log("recieved from " + getClientAddress(client) + ": " + message);
	var type = message.split(" ")[0]
	var data = message.split(" ").splice(1).join(" ")

	switch (type) {
		case "WHO":
			client.send("WHO " + mode.modeId); break
		case "CONNECT":
			client.send("INIT " + mode.describeState())
			client.id = mode.join(data); 
			broadcast("JOIN " + client.id + " " + data); 
			client.send("CONNECTED " + client.id); 
			break
		case "SNAP":
			mode.serverMerge(client.id, data); break
		case "CHAT":
			broadcast("CHAT " + mode.findPlayerById(client.id).name + ": " + data);
			break;
		default:
			client.send("ECHO " + data)
	}
}

then = Date.now()
function logicLoop() {
	now = Date.now()
	mode.step(now - then)
	then = now
	setTimeout(logicLoop, (1/60))
}

function snapBroadcast() {
	console.log("broadcasting: " + mode.serverAssert())
	broadcast("SNAP " + mode.serverAssert())	
	setTimeout(snapBroadcast, 50)
}

openSocket(port);
mode.init(mode.makeInitData(key));
snapBroadcast()
logicLoop()
}
