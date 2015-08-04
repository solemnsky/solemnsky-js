/*                  ******** client-arena.js ********                  //
\\ Online arena client.                                                \\
//                  ******** client-arena.js ********                  */

PIXI = require('../../assets/pixi.min.js')
ui = require('../ui/')

module.exports = function(mode, address, port, path) {

/**** {{{ ConnectUI ****/
ConnectUI = function() {
	this.entered = false
	this.countdown = 1
}

ConnectUI.prototype.init = function() {
}
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
	this.serverValid = false;

	this.messageCue = []
	this.processingCue = false;

	this.stage = null
}

/**** {{{ processCue ****/
Game.prototype.processCue = function() {
	if (this.processingCue === false && this.messageCue.length > 0) {
		this.processingCue = true;

		var message = this.messageCue.pop()
		var type = message.split(" ")[0]
		var data = message.split(" ").splice(1).join(" ")

		if (!this.serverValid) {
			if (type === "WHO") {
				if (data === mode.modeId) {
					this.send("CONNECT " + this.name)
					this.serverValid = true
				} else {
					console.log("invalid server response from WHO request")
					this.disconnected = true
				}
			}
		} else {
			if (!this.initialised) {
				if (type === "INIT") {
					mode.init(data); 
					mode.initRender(this.modeStage)
					this.initialised = true;
					this.broadcastLoop()
				}
			} else {
				switch (type) {
					case "CONNECTED":
						this.id = data; break
					case "SNAP":
						if (this.id !== null)
							mode.clientMerge(this.id, data); break	
					case "JOIN":
						split = data.split(" ")
						mode.join(split[1], split[0]); 
						break;
					case "QUIT":
						mode.quit(data); break
					default:
						break
				}
			}
		}

		this.processingCue = false;
		if (this.messageCue.length !== 0) 
			this.processCue()
	}
}
/**** }}} processCue ****/

/**** {{{ ui control methods ****/
Game.prototype.init = function(){
	this.name = prompt("enter desired player name")	

	this.socket = new WebSocket("ws://" + address + ":" + port + path);
	this.socket.onopen = this.onConnected.bind(this);
	this.socket.onclose = this.onDisconnected.bind(this);
	this.socket.onmessage = this.onMessage.bind(this);
}
Game.prototype.step = function(delta) { 
	if (this.initialised)
		mode.step(delta)
}
Game.prototype.initRender = function(stage) { 
	this.stage = stage
	this.modeStage = new PIXI.Container
	this.fpsText = new PIXI.Text("", {fill: 0xFFFFFF})
	this.fpsText.position = new PIXI.Point(1400, 10)
	this.stage.addChild(this.modeStage); this.stage.addChild(this.fpsText)
}
Game.prototype.stepRender = function(stage, delta, x, y) {
	if (this.initialised) {
		mode.stepRender(this.modeStage, delta, x, y)
		this.fpsText.text = "render: " + x + "Hz\nengine: " + y + "Hz"
	}
}
Game.prototype.acceptKey = function(key, state) {
	if (this.initialised)
		return mode.acceptKey(this.id, key, state);
}
Game.prototype.hasEnded = function() {
	return (this.disconnected)
}
/**** }}} ui control methods ****/

/**** {{{ network control ****/
Game.prototype.send = function(msg) {
	if (this.socket.readyState !== this.socket.OPEN) {
		//We're done here
		return false;
	}
	if (msg.split(" ")[0] !== "SNAP")
		console.log(">>>" + msg)
	this.socket.send(msg)
	return true;
}
Game.prototype.onConnected = function(event) {
	this.send("WHO")
}
Game.prototype.onDisconnected = function() {
	this.disconnected = true;
}
Game.prototype.onMessage = function(message) {
	if (message.data.split(" ")[0] === "SNAP") {
	} else {
		console.log("<<<" + message.data)
	}
	this.messageCue.push(message.data)
	this.processCue()
}
Game.prototype.broadcastLoop = function() {
	setTimeout(this.broadcastLoop.bind(this), 15)

	//Don't send snapshots if we don't have an id yet
	if (this.id !== null)
		this.send("SNAP " + mode.clientAssert(this.id))
}
/**** }}} network control ****/
/**** }}} Game ****/

ConnectUI.prototype.next = function() {return new Game()}
Game.prototype.next = function() {return new ConnectUI()}
return new ConnectUI
}
