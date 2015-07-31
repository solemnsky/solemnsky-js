/*                  ******** client-arena.js ********                  //
\\ Connects to an arena server.                                        \\
//                  ******** client-arena.js ********                  */

clientCore = require('./client-core.js')
PIXI = require('../../assets/pixi.min.js')
ui = require('../ui/')

Game = function() {
	this.socket = null
}

// ui control methods
Game.prototype.init = function(){}
Game.prototype.step = function(delta) {}
Game.prototype.initRender = function(stage) {}
Game.prototype.stepRender = function(stage, delta) {}
Game.prototype.hasEnded = function() {return false}

Game.prototype.connect(address, port, path) {
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
