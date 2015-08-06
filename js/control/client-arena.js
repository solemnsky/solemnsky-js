/*                  ******** client-arena.js ********                  //
\\ Online arena client.                                                \\
//                  ******** client-arena.js ********                  */

PIXI = require('../../assets/pixi.min.js')
ui = require('../ui/')

Keys = require('../resources/keys.js')
nameFromKeyCode = Keys.nameFromKeyCode
keyCodeFromName = Keys.keyCodeFromName

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

	this.chatting = false
	this.chatBuffer = "this is what I'm saying"
	this.chatLog = 
		[ {from: "player 1", chat: "asdf", time: 1}
		, {from: "player 2", chat: "yeah, asdf to YOU good sir", time: 2}
		, {from: "player 3", chat: "yeah well fk this I'm leaving", time: 3}]
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
				split = data.split(" ")
				switch (type) {
					case "CONNECTED":
						this.id = data; break
					case "SNAP":
						if (this.id !== null)
							mode.clientMerge(this.id, data); break	
					case "JOIN":
						mode.join(split[1], split[0]); 
						break;
					case "QUIT":
						mode.quit(data); break
					case "CHAT":
						this.chatLog.push(
							{from: split[0], chat: split[1]}
						)
						break;
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

	this.modeStage = new PIXI.Container()
	stage.addChild(this.modeStage);

	this.fpsText = new PIXI.Text("", {fill: 0xFFFFFF})
	this.fpsText.position = new PIXI.Point(1400, 10)
	stage.addChild(this.fpsText)
	
	this.chatStage = new PIXI.Container()
	stage.addChild(this.chatStage)
}
Game.prototype.stepRender = function(stage, delta, x, y) {
	if (this.initialised) {
		if (this.id !== null) {
			mode.stepRender(this.id, this.modeStage, delta, x, y)
		} else {
			mode.stepRender(null, this.modeStage, delta, x, y)
		}
		this.fpsText.text = "render: " + x + "Hz\nengine: " + y + "Hz"
	}
	this.displayChat()
}
Game.prototype.acceptKey = function(key, state) {
	if (this.initialised) {
		if (key === "enter") { //Enter: Open chat
			if (state) {
				if (this.chatting) {
					this.sendChat();
				} else {
					this.openChat();
				}
			}
		}
		if (this.chatting) {
			//Espace for closing
			if (key === "escape") {
				this.closeChat();
			}
		}
		if (this.id !== null) 
			mode.acceptEvent({id: this.id, type: "control", name: key, state: state})
	}
}
Game.prototype.hasEnded = function() {
	return (this.disconnected)
}
/**** }}} ui control methods ****/

/**** {{{ chat ****/
Game.prototype.displayChat = function() {
	// WIP, will make prettier later
	var size = 25
	var style = {fill: 0xFFFFFF, font: size + "px arial"}
	var height = (new PIXI.Text("I", style)).height
	var maxLines = 15
	var maxLinesNormal = 5 // max lines when not chatting

	this.chatStage.removeChildren()
	if (this.chatting) {
	/**** {{{ when chatting ****/
		if (this.chatLog.length > maxLines) {
			var shownChat = this.chatLog	
		} else {
			var shownChat = this.chatLog	
		}

		var chatLines = shownChat.map(
			function(value) { return value.chat }
		).join("\n")

		var backlog = new PIXI.Text(chatLines, style)	
		backlog.position = new PIXI.Point(15, (880 - height) - backlog.height)

		var chatEntry = new PIXI.Text(">>" + this.chatBuffer, style)
		chatEntry.position = new PIXI.Point(15, (880 - height))
		this.chatStage.addChild(chatEntry)

		this.chatStage.addChild(backlog)
	/**** }}} when chatting ****/
	} else {
	/**** {{{ when not chatting ****/
		if (this.chatLog.length > maxLinesNormal) {
			var shownChat = this.chatLog	
		} else {
			var shownChat = this.chatLog	
		}

		var chatLines = shownChat.map(
			function(value) { return value.chat }
		).join("\n")

		var backlog = new PIXI.Text(chatLines, style)	
		backlog.position = new PIXI.Point(15, (880 - height) - backlog.height)
		backlog.alpha = 0.5

		/*
		var chatPrompt = new PIXI.Text("(press enter to chat)", style)
		chatPrompt.position = new PIXI.Point(15, (880 - height))
		chatPrompt.alpha = 0.3
		this.chatStage.addChild(chatPrompt)
		*/

		this.chatStage.addChild(backlog)
	/**** }}} when not chatting ****/
	}
}
Game.prototype.openChat = function() {
	this.chatting = true;
	this.chatBuffer = "chat buffer"
}
Game.prototype.closeChat = function() {
	this.chatting = false;
}
Game.prototype.sendChat = function() {
	this.closeChat();
	this.send("CHAT " + this.chatBuffer);
}
/**** }}} chat ****/

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
	if (message.data.split(" ")[0] !== "SNAP") 
		console.log("<<<" + message.data)
	this.messageCue.push(message.data)
	this.processCue()
}
Game.prototype.broadcastLoop = function() {
	setTimeout(this.broadcastLoop.bind(this), 20)

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
