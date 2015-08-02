/*                  ******** client-arena.js ********                  //
\\ Connects to an arena server.                                        \\
//                  ******** client-arena.js ********                  */

clientCore = require('./client-core.js')
PIXI = require('../../assets/pixi.min.js')
ui = require('../ui/')

Vanilla = require('../modes/vanilla/')
VanillaRender = require('../modes/vanilla/render.js')
VanillaRender(Vanilla)
mode = new Vanilla()

module.exports = function(mode, address, port, path) {

/**** {{{ ConnectUI ****/
ConnectUI = function() {
	this.entered = false
	this.countdown = 1
}

ConnectUI.prototype.init = function() {}
ConnectUI.prototype.step = function(delta) {
	if (this.entered) {
		this.countdown -= (delta / 1000)
	}
}
ConnectUI.prototype.initRender = function(stage) {
	this.text = new PIXI.Text("press enter to start.", {fill: 0xFFFFFF})
	this.text.position = new PIXI.Point(800, 450)
	stage.addChild(this.text)
}
ConnectUI.prototype.stepRender = function() { 
	if (this.entered) {
		this.text.position = new PIXI.Point(800, (550 * this.countdown - 100))
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

mode = 

/**** {{{ Game ****/
Game = function() {
	this.disconnected = false;
}

// ui control methods
Game.prototype.init = function(){
	this.name = prompt("enter desired player name")	

	this.socket = new WebSocket("ws://" + address + ":" + port + path);
	this.socket.onopen = this.onConnected;
	this.socket.onclose = this.onDisconnected;
	this.socket.onmessage = this.onMessage;
}
Game.prototype.step = function(delta) { }
Game.prototype.initRender = function(stage) { }
Game.prototype.stepRender = function(stage, delta) {}
Game.prototype.acceptKey = function(){}
Game.prototype.hasEnded = function() {
	return (this.disconnected)
}

Game.prototype.onConnected = function() {
	var msg = "CONNECT " + this.name;
	console.log("sending: " + msg")
	this.send(msg)
}

Game.prototype.onDisconnected = function() {
	this.disconnected = true;
}

Game.prototype.onMessage = function(message) {
	console.log("recieving: " + message)
	var type = message.data.split(" ")[0]
	var data = message.data.split(" ").splice(1).join(" ")
	switch (type) {
		case "INIT":
			mode.init(data); break
		case "SNAP":
			mode.clientMerge(data); break	
		case "JOIN":
			mode.join(data); break
		case "QUIT":
			mode.quit(data); break
	}
	console.log(message.data);
}

// connect(address, port, path);
/**** }}} Game ****/

ConnectUI.prototype.next = function() {return new Game()}
Game.prototype.next = function() {return new ConnectUI()}
return new ConnectUI
}
