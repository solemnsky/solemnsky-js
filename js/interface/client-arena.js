/*									******** client-arena.js ********									 //
\\ Online arena client.																								 \\
//									******** client-arena.js ********									 */

var PIXI = require('../../assets/pixi.min.js')
var util = require('../resources/util.js')
var renderPerf = require('./elements/performance.js')

// FIXME: does not respect new mode loadAssets methods, so textures are not loaded

module.exports = function(mode, address, port, path) {

/**** {{{ ConnectUI ****/
	function ConnectUI() {
		this.entered = false
		this.countdown = 1
	}

	ConnectUI.prototype.init = function() {
	}
	ConnectUI.prototype.step = function(delta) {
		if (this.entered) 
			this.countdown -= delta / 1000
	}
	ConnectUI.prototype.initRender = function(stage) {
		this.text = 
			new PIXI.Text(
				'press enter to start\nuse arrow keys to fly'
				, {fill: 0xFFFFFF})
		this.text.position = new PIXI.Point(800, 450)
		stage.addChild(this.text)
	}
	ConnectUI.prototype.stepRender = function() { 
		if (this.entered) {
			this.text.position = 
				new PIXI.Point(800, 550 * this.countdown - 100)
		} 
	}
	ConnectUI.prototype.acceptKey = function(key, state) {
		if (state && key === 'enter') this.entered = true 
	}
	ConnectUI.prototype.hasEnded = function() {
		return this.countdown < 0
	}
/**** }}} ConnectUI ****/

/**** {{{ Game ****/
	function Game() {
		this.id = null;
		this.disconnected = false;
		this.initialised = false;
		this.serverValid = false;

		this.messageCue = []
		this.processingCue = false;

		this.chatting = false
		this.chatBuffer = ""
		this.eventLog = []

		this.modeStage = new PIXI.Container()
		this.perfStage = new PIXI.Container()
		this.chatStage = new PIXI.Container()
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
					var split = data.split(" ")
					switch (type) {
					case "CONNECTED":
						this.id = data;
						break;
					case "SNAP":
						if (this.id !== null)
							mode.clientMerge(this.id, mode.readAssertion(data)); 
						break
					case "JOIN":
						mode.join(split[1], split[0]); 
						break;
					case "QUIT":
						mode.quit(data); break
					case "CHAT":
						var id = split[0]
						var player = util.findElemById(mode.listPlayers(), id)
						if (player !== null)	
							this.eventLog.push(
								{ type: "chat"
								, from: player.name
								, chat: split.slice(1).join(" ") }
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
		stage.addChild(this.modeStage);
		stage.addChild(this.perfStage)
		stage.addChild(this.chatStage)

		renderPerf.initRender(this.perfStage)
	}
	var now, diff
	Game.prototype.stepRender = function(stage, delta, performance) {
		if (this.initialised) {
			if (this.id !== null) {
				mode.stepRender(this.id, this.modeStage, delta)
			} else {
				mode.stepRender(null, this.modeStage, delta)
			}
			this.displayChat()
		}

		now = Date.now()
		this.processCue()
		diff = Date.now() - now

		performance.cueTime = diff
		renderPerf.stepRender(this.perfStage, delta, performance)
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
					if ("abcdefghijklmnopqrstuvwxyz123456789".indexOf(key) !== -1) 
						if (this.shiftKey) 
							this.chatBuffer = this.chatBuffer + key.toUpperCase()
						else 
							this.chatBuffer = this.chatBuffer + key
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
		return this.disconnected
	}
/**** }}} ui control methods ****/

/**** {{{ chat ****/
	var size = 25
	var style = {fill: 0xFFFFFF, font: size + "px arial"}
	var height = (new PIXI.Text("I", style)).height
	var chatEntry = new PIXI.Text("", style)
	var backlog = new PIXI.Text("", style)
	var chatPrompt = new PIXI.Text("(press enter to chat)", style)
	Game.prototype.displayChat = function() {
		// WIP, will make prettier later
		
		var chatLog = this.eventLog.filter(
			function(event) {
				return event.type === "chat"
			}
		)

		this.chatStage.removeChildren()

		var chatLines = chatLog.map(
			function(value) { return value.from + ": " + value.chat }
		).join("\n")

		if (this.chatting) {
		/**** {{{ when chatting ****/
			backlog.text = chatLines
			backlog.position.set(15, 880 - height - backlog.height)
			this.chatStage.addChild(backlog)

			chatEntry.text = ">>" + this.chatBuffer + "|"
			chatEntry.position.set(15, 880 - height)
			this.chatStage.addChild(chatEntry)
		/**** }}} when chatting ****/
		} else {
		/**** {{{ when not chatting ****/
			backlog.text = chatLines
			backlog.position.set(15, 880 - height - backlog.height)
			backlog.alpha = 0.5
			this.chatStage.addChild(backlog)

			chatPrompt.position.set(15, 880 - height)
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
	}
	Game.prototype.broadcastLoop = function() {
		setTimeout(this.broadcastLoop.bind(this), 20)

		//Don't send snapshots if we don't have an id yet
		if (this.id !== null)
			this.send("SNAP " + mode.serialiseAssertion(mode.clientAssert(this.id)))
	}
/**** }}} network control ****/
/**** }}} Game ****/

	ConnectUI.prototype.next = function() {return new Game()}
	Game.prototype.next = function() {return new ConnectUI()}
	return new ConnectUI()
}
