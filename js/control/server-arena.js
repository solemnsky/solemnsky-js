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
}

function onMessage(client, message) {
	//STUB
	console.log("Message from client " + getClientAddress(client) + ": " + message);

	var type = message.data.split(" ")[0]
	var data = message.data.split(" ").splice(1).join(" ")

	switch (type) {
		case "CONNECT":
			client.id = mode.join(data); broadcast("JOIN " + data); 
			client.send("CONNECTED " + client.id); break;
		case "SNAP":
			mode.serverMerge(data); break
		default:
			client.send("ECHO " + data)
	}
}

openSocket(port);
mode.init(mode.makeInitData(key));
}
