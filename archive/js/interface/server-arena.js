/*                  ******** server-arena.js ********                  //
// An arena server where players may join and quit freely.             \\
\\                  ******** server-arena.js ********                  */

var WebSocket = require("ws")
var wss = null

module.exports = function(port, mode, key) {

/**** {{{ utility functions ****/
	function getClientAddress(client) {
		return client._socket.remoteAddress + ":" + client._socket.remotePort;
	}

	function broadcast(message) {
		wss.clients.forEach(
			function(client) {
				try {
					client.send(message)
				} finally {
					//Disconnected... just ignore this
				}
			}
		)
	}

	function openSocket(aport) {
		wss = new WebSocket.Server({port: aport});
		wss.on("connection", function(client) {
			onClientConnected(client);
		});
	}
/**** }}} utility functions ****/

/**** {{{ callbacks ****/
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
		var type = message.split(" ")[0]
		var data = message.split(" ").splice(1).join(" ")

		switch (type) {
		// query methods
		case "PING":
			client.send("PONG"); break
		case "DESC":
			client.send("DESC first solemnsky server"); break
		case "WHO":
			client.send("WHO " + mode.modeId); break
				
		// assets
		case "ASSETS":
			client.send("ASSETS " + mode.describeAssets); break

		// connection
		case "CONNECT":
			client.send("INIT " + mode.serialiseState(mode.describeState()))
			client.id = mode.join(data); 
			broadcast("JOIN " + client.id + " " + data); 
			client.send("CONNECTED " + client.id); 
			break

		// snapshots
		case "SNAP":
			mode.serverMerge(client.id, mode.readAssertion(data)); break

		// chat				
		case "CHAT":
			broadcast("CHAT " + client.id + " " + data);
			break;

		default:
			client.send("ECHO " + data)
		}
	}
/**** }}} callbacks ****/

/**** {{{ simulation / broadcast ****/
	var then = Date.now()
	var now = null
	function logicLoop() {
		now = Date.now()
		mode.step(now - then)
		then = now
		setTimeout(logicLoop, 1/60)
	}

	function snapBroadcast() {
		console.log("broadcasting: " + mode.serverAssert())
		broadcast("SNAP " + mode.serialiseAssertion(mode.serverAssert()))	
		setTimeout(snapBroadcast, 20)
	}
/**** }}} simulation / broadcast ****/

	openSocket(port) // initialise websocket
	mode.init(mode.createState(key)) // initialise mode
	snapBroadcast() // snapshot broadcast loop
	logicLoop() // mode simulation loop
}
