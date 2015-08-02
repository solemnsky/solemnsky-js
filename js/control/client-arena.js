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

/**** {{{ Game ****/
Game = function() {
	this.id = null;
	this.disconnected = false;
	this.initialised = false;

	this.messageCue = []
	this.processingCue = false;
}

Game.prototype.processCue = function() {
	if (this.processingCue === false && this.messageCue.length > 0) {
		this.processingCue = true;

		var message = this.messageCue.pop
		var type = message.split(" ")[0]
		var data = message.split(" ").splice(1).join(" ")

		if (this.intialised) {
			if (type === "INIT") {
				mode.init(data); this.initialised = true;
			}
		} else {
			switch (type) {
				case "CONNECTED":
					this.id = data
				case "SNAP":
					mode.clientMerge(data); break	
				case "JOIN":
					mode.join(data); break
				case "QUIT":
					mode.quit(data); break
				default:
					break
			}
		}

		this.processingCue = false;
		if (this.messageCue.length !== 0) 
			this.processCue()
	}
}

// ui control methods
Game.prototype.init = function(){
	this.name = prompt("enter desired player name")	

	this.socket = new WebSocket("ws://" + address + ":" + port + path);
	this.socket.onopen = this.onConnected.bind(this);
	this.socket.onclose = this.onDisconnected.bind(this);
	this.socket.onmessage = this.onMessage.bind(this);
}
Game.prototype.step = function(delta) { 
	mode.step(delta)
}
Game.prototype.initRender = function(stage) { 
	if (this.initialised)
		mode.initRender(stage)
}
Game.prototype.stepRender = function(stage, delta, x, y) {
	if (this.initialised) 
		mode.stepRender(stage, delta, xy, y)
}
Game.prototype.acceptKey = function(key, state) {
	if (this.initialised)
		mode.acceptKey(this.id, key, state)
}
Game.prototype.hasEnded = function() {
	return (this.disconnected)
}

Game.prototype.onConnected = function(event) {
	var msg = "CONNECT " + this.name;
	console.log("sending: " + msg)
	this.socket.send(msg)
}

Game.prototype.onDisconnected = function() {
	this.disconnected = true;
}

Game.prototype.onMessage = function(message) {
	console.log("recieving: " + message.data)
	this.messageCue.push(message.data)
	this.processCue()
}
/**** }}} Game ****/

ConnectUI.prototype.next = function() {return new Game()}
Game.prototype.next = function() {return new ConnectUI()}
return new ConnectUI
}
