/*                  ******** server-core.js ********                   //
\\ This exports a base server, It should be adequately paremeterized   \\
// to be used in all other servers.                                    //
\\                  ******** server-core.js ********                   */

module.exports = function(port) {
//Sockets
WebSocket = require("ws");

function openSocket() {
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
}

function onClientDisconnected(client) {
	//STUB
}

function onMessage(client, message) {
	//STUB
}

}