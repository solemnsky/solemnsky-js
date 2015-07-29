/*                  ******** server-core.js ********                   //
\\ This exports a base server, It should be adequately paremeterized   \\
// to be used in all other servers.                                    //
\\                  ******** server-core.js ********                   */

module.exports = function(port, mode, key, callback) {
//Sockets
WebSocket = require("ws");

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
		onClientDisconneced(client);
	});

	console.log("Client connected");
}

function onClientDisconnected(client) {
	//STUB
	console.log("Client disconnected");
}

function onMessage(client, message) {
	//STUB
	console.log("Message from client: " + message);
	client.send("TEST");
}

openSocket(port);
mode.init(mode.makeInitData(key));
}