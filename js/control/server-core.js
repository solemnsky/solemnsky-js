/*                  ******** server-core.js ********                   //
\\ This exports a base server, It should be adequately paremeterized   \\
// to be used in all other servers.                                    //
\\                  ******** server-core.js ********                   */

module.exports = function(port, mode, key, callback) {
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
	//STUB
	console.log("Client " + getClientAddress(client) + " disconnected");
}

function onMessage(client, message) {
	//STUB
	console.log("Message from client " + getClientAddress(client) + ": " + message);
	broadcast(getClientAddress(client) + " says " + message);
}

openSocket(port);
mode.init(mode.makeInitData(key));
}