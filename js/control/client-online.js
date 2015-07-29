/*                  ******** client-online.js ********                 //
\\ Wrapper over client-core that connects to a given server.           \\
//                  ******** client-online.js ********                 */
clientCore = require('./client-core.js')
PIXI = require('../../assets/pixi.min.js')

module.exports = function(address, port, path, mode) {

// overlay
overlay = new PIXI.Container()
text1 = new PIXI.Text("online test" , {fill: 0xFFFFFF})
text1.position = new PIXI.Point(800, 15)
overlay.addChild(text1)

// function callback() { }
// clientCore(mode, callback, overlay)

function connect(address, port, path) {
	socket = new WebSocket("ws://" + address + ":" + port + path);
	socket.onopen = onConnected;
	socket.onclose = onDisconnected;
	socket.onmessage = onMessage;
}

function onConnected() {
	//STUB
	socket.send("TEST");
}

function onDisconnected() {
	//STUB
}

function onMessage(message) {
	//STUB
	console.log(message);
}

connect(address, port, path);

}
