/*                  ******** null/index.js ********                   //
\\ This is a trivial placeholder mode; the 0 of the set of modes.     \\
// It has a very simple functionality for demonstration and testing.  //
\\ You can start from this file when you make a new mode.             \\
//                  ******** null/index.js ********                   */

// merely keeps track of who's online (and how long they've been there)
// the background color is customizable via initdata

module.exports = Null

Utils = require('../../resources/util.js')

/**** {{{ constructor ****/
function Null() {
	this.players = []

	this.modeId = "null dev"
}
/**** }}} constructor ****/

/**** {{{ methods ****/
Null.prototype.findPlayerById = function(id) {
	return Utils.findElemById(this.players, id)
}
/**** }}} methods ****/

/**** {{{ init() and step() ****/
Null.prototype.makeInitData = function(key) {
	if (key == 'red') {
		return JSON.stringify({color: 0xFF0000, players: []})
	} else {
		return JSON.stringify({color: 0xFFFFFF, players: []})
	}
}

Null.prototype.init = function(initdata) {
	var data = JSON.parse(initdata)	
	this.color = data.color
	this.players = data.players
}

Null.prototype.step = function(delta) {
	this.players.forEach(
		function(player) { player.timespent += delta }
	)
}

Null.prototype.hasEnded = function() {
	return false
}
/**** }}} init() and step() ****/

/**** {{{ join() and quit() ****/
Null.prototype.join = function(name, id) {
	if (typeof id !== undefined) {
		ids = this.players.map(function(player) { return player.id })
		newId = Utils.findAvailableId(ids)	
	} else {
		newId = id
	}

	this.players.push({name: name, id: newId, timespent: 0})
	return newId
}

Null.prototype.quit = function(id) {
	Utils.removeElemById(this.players, id)
}
/**** }}} join() and quit() ****/

/**** {{{ initRender() and stepRender() ****/
Null.prototype.initRender = function(stage) { 
	stage.addChild(new PIXI.Text("", {fill: 0xFFFFFF}))
}

Null.prototype.stepRender = function(stage, delta) {
	stage.children[0].text = 
		this.players.reduce(
			function(acc, player) {
				return acc + "\n" + JSON.stringify(player)
			} 
		, "")
}
/**** }}} initRender() and stepRender()  ****/

/**** {{{ clientAssert() and serverAssert() ****/
Null.prototype.clientAssert = function(id) {
	// a client speaks it mind to the server
	return JSON.stringify(this.findPlayerById(id).timespent)
}

Null.prototype.serverAssert = function() {
	return JSON.stringify(this.players)
}
/**** }}} clientAssert() and serverAssert() ****/

/**** {{{ clientMerge() and serverMerge() ****/
Null.prototype.clientMerge = function(id, snap) {
	// sync all the other players, but be sure to keep myself intact
	var myself = this.findPlayerById(id)
		this.players = JSON.parse(snap)
		Utils.removeElemById(this.players, id)
	if (myself !== null) 
		this.players.push(myself)
}

Null.prototype.serverMerge = function(id, snap) {
	var player = this.findPlayerById(id)
	if (player !== null)
		player.timespent = JSON.parse(snap)
}
/**** }}} clientMerge() and serverMerge() ****/

/**** {{{ acceptKey ****/
Null.prototype.acceptKey = function(id, key, state) {
	// do absolutely nothing <3
}
/**** }}} acceptInput ****/

/**** {{{ describeState() ****/
Null.prototype.describeState = function() {
	return JSON.stringify({color: this.color, players: this.players})
}
/**** }}} describeState() ****/
