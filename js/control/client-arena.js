/*                  ******** client-arena.js ********                  //
\\ Connects to an arena server.                                        \\
//                  ******** client-arena.js ********                  */
clientCore = require('./client-core.js')
PIXI = require('../../assets/pixi.min.js')
runPixi = require('../resources/pixi.js')
Utils = require('../resources/util.js')

module.exports = function(address, port, path, mode) {

/**** {{{ connectUI(next): connection interface ****/
// next: the next thing to do
connectUI = function(next) {
	ConnectUI = function() {
		this.text = new PIXI.Text("welcome to the online client", {fill: 0xFFFFFF})
		this.text.position = new PIXI.Point(800, 450)

		this.time = 0
	}

	ConnectUI.prototype.init = function(stage) { stage.addChild(this.text)	}
	ConnectUI.prototype.step = function(delta) {
		this.time += delta
	}
	ConnectUI.prototype.renderStep = function(stage, delta) {
		if (this.time > 2000) {
			this.text.text = "oh look, the text changed"
		} else {
			this.text.text = "welcome to the online client"
		}
	}
	ConnectUI.prototype.hasEnded = function() {
		if (this.time > 4000) {
			return true
		} else {
			return false
		}
	}

	runPixi(new ConnectUI(), next)
}
/**** }}} connection interface ****/

connectUI(function(){console.log("not really connecting...")})

/*
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
	console.log(message.data);
}

connect(address, port, path);
*/

}
