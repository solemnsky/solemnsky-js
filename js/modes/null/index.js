/*                  ******** null/index.js ********                   //
\\ This is a trivial placeholder mode; the 0 of the set of modes.     \\
// It has a very simple functionality for demonstration and testing.  //
\\ You can start from this file when you make a new mode.             \\
//                  ******** null/index.js ********                   */

// merely keeps track of who's online (and how long they've been there)
// the background color is customizable, can be white or red! 

module.exports = Null

Utils = require('../../resources/util.js')

/**** {{{ constructor ****/
function Null() {
	this.players = []
}
/**** }}} constructor ****/

/**** {{{ methods ****/
Null.prototype.findPlayerById = function(id) {
	Utils.findElemById(this.player, id)
}
/**** }}} methods ****/

/**** {{{ init() and step() ****/
Null.prototype.makeInitData = function(key) {
	if (key == 'red') {
		return 0xFF0000
	} else {
		return 0xFFFFFF
	}
}

Null.prototype.init = function(initdata) {
	this.color = initdata
}

Null.prototype.step = function(delta) {
	this.players.forEach(
		function(player) {
			player.timespent += delta
		}
	)
}

Null.prototype.hasEnded = function() {
	return false
}
/**** }}} init() and step() ****/

/**** {{{ join() and quit() ****/
Null.prototype.join = function(name) {
	ids = this.players.map(function(player) { return player.id })
	newId = Utils.findAvailableId(ids)	
	this.players.push({name: name, id: newId, timespent: 0})
	return newId
}

Null.prototype.quit = function(id) {
	Utils.removeElemById(this.players, id)
}
/**** }}} join() and quit() ****/

/**** {{{ initRender() and stepRender() ****/
Null.prototype.initRender = function(stage) { }

Null.prototype.stepRender = function(stage, delta) {
	stage.removeChildren
	stage.addChild(new PIXI.Text(
		JSON.stringify(this.players)
	))
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
Null.describeState = function() {
	JSON.stringify(this.players)
}
/**** }}} returnState() ****/
