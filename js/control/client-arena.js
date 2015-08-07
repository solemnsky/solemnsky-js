/*                  ******** client-arena.js ********                  //
\\ Online arena client.                                                \\
//                  ******** client-arena.js ********                  */

PIXI = require('../../assets/pixi.min.js')
ui = require('../ui/')
renderHud = require('./hud.js')

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
	this.text = 
		new PIXI.Text(
			"press enter to start\nuse arrow keys to fly"
			, {fill: 0xFFFFFF})
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
	this.chatBuffer = ""
	this.eventLog = []
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
						var id = split[0]
						var player = Utils.findElemById(mode.listPlayers(), id)
						if (player !== null) 
							this.eventLog.push(
								{type: "chat", from: player.name, chat: split.slice(1).join(" ")}
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
		this.eventLog = this.eventLog.concat(mode.step(delta))
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
			if (key === "shift") this.shiftKey = state
			if (state) {
				if ("abcdefghijklmnopqrstuvwxyz123456789".indexOf(key) !== -1) {
					if (this.shiftKey) {
						this.chatBuffer = this.chatBuffer + key.toUpperCase()
					} else {
						this.chatBuffer = this.chatBuffer + key
					}
				}
				if (key === "space")
					this.chatBuffer = this.chatBuffer.concat(" ")
				if (key === "back_space")
					this.chatBuffer = this.chatBuffer.slice(0, this.chatBuffer.length - 1)
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
var size = 25
var style = {fill: 0xFFFFFF, font: size + "px arial"}
var height = (new PIXI.Text("I", style)).height
var maxLines = 15
var maxLinesNormal = 5 // max lines when not chatting
var chatEntry = new PIXI.Text("", style)
var backlog = new PIXI.Text("", style)
var chatPrompt = new PIXI.Text("(press enter to chat)", style)
Game.prototype.displayChat = function() {
	// WIP, will make prettier later
	
	var chatLog = this.eventLog.filter(
		function(event) {
			return (event.type === "chat")
		}
	)

	this.chatStage.removeChildren()

	if (this.chatting) {
	/**** {{{ when chatting ****/
		if (chatLog.length > maxLines) {
			var shownChat = chatLog	
		} else {
			var shownChat = chatLog	
		}

		var chatLines = shownChat.map(
			function(value) { return value.from + ": " + value.chat }
		).join("\n")
		// this function is duplicated because in the future
		// chat when not chatting will be displayed differently
		// so it's not worth designing this placeholder code well

		backlog.text = chatLines
		backlog.position.set(15, (880 - height) - backlog.height)
		this.chatStage.addChild(backlog)

		chatEntry.text = ">>" + this.chatBuffer + "|"
		chatEntry.position.set(15, (880 - height))
		this.chatStage.addChild(chatEntry)
	/**** }}} when chatting ****/
	} else {
	/**** {{{ when not chatting ****/
		if (chatLog.length > maxLinesNormal) {
			var shownChat = chatLog	
		} else {
			var shownChat = chatLog	
		}

		var chatLines = shownChat.map(
			function(value) { return value.from + ": " + value.chat }
		).join("\n")

		backlog.text = chatLines
		backlog.position.set(15, (880 - height) - backlog.height)
		backlog.alpha = 0.5
		this.chatStage.addChild(backlog)

		chatPrompt.position.set(15, (880 - height))
		chatPrompt.alpha = 0.3
		this.chatStage.addChild(chatPrompt)
	/**** }}} when not chatting ****/
	}
}
Game.prototype.openChat = function() {
	this.chatting = true;
	this.chatBuffer = ""
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
