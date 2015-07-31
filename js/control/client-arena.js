/*                  ******** client-arena.js ********                  //
\\ Connects to an arena server.                                        \\
//                  ******** client-arena.js ********                  */

clientCore = require('./client-core.js')
PIXI = require('../../assets/pixi.min.js')
ui = require('../ui/')

module.exports = function(mode, address, port, path) {

/**** {{{ ConnectUI ****/
ConnectUI = function() {
	this.entered = false
	this.countdown = 5
}

ConnectUI.prototype.init = function() {}
ConnectUI.prototype.step = function(delta) {
	if (this.entered) {
		this.countdown -= (delta / 1000)
	}
}
ConnectUI.prototype.initRender = function(stage) {
	this.text = new PIXI.Text("press enter to start...", {fill: 0xFFFFFF})
	stage.addChild(this.text)
}
ConnectUI.prototype.stepRender = function() {
	if (this.entered) {
		this.text.text = this.countdown
	}
}
ConnectUI.prototype.acceptKey = function(key, state) {
	if (state)
		if (key == "enter")
			this.entered = true
}
ConnectUI.prototype.hasEnded = function() {
	return (this.countdown < 0)
}

/**** }}} ConnectUI ****/

/**** {{{ Game ****/
Game = function() {
	this.disconnected = false;
}

// ui control methods
Game.prototype.init = function(){
	/*
	this.socket = new WebSocket("ws://" + address + ":" + port + path);
	this.socket.onopen = this.onConnected;
	this.socket.onclose = this.onDisconnected;
	this.socket.onmessage = this.onMessage;
	*/
}
Game.prototype.step = function(delta) {}
Game.prototype.initRender = function(stage) { }
Game.prototype.stepRender = function(stage, delta) {}
Game.prototype.hasEnded = function() {
	return (!this.disconnected)
}

Game.prototype.connect = function(address, port, path) {
}

Game.prototype.onConnected = function() {
	//STUB
	socket.send("TEST");
}

Game.prototype.onDisconnected = function() {
	this.disconnected = true;
}

Game.prototype.onMessage = function(message) {
	//STUB
	console.log(message.data);
}

// connect(address, port, path);
/**** }}} Game ****/

ConnectUI.prototype.next = function() {return new ConnectUI()}
connectUI = new ConnectUI()
game = new Game()

return connectUI

}
