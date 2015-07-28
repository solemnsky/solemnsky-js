/*                  ******** null/index.js ********                   //
\\ This is a trivial placeholder mode; the 0 of the set of modes.     \\
// It has a very simple functionality for demonstration and testing.  //
\\ You can start from this file when you make a new mode.             \\
//                  ******** null/index.js ********                   */

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
	this.players.push({name: name, id: newId})
	return newId
}

Null.prototype.quit = function(id) {
	Utils.removeElemById(this.players, id)
}
/**** }}} join() and quit() ****/

/**** {{{ initRender() and stepRender() ****/
Null.prototype.initRender = function(stage) {
	stage.removeChildren
}

Null.prototype.stepRender = function(stage, delta) {
	// step the PIXI renderer state forward
	// called at ~60Hz, exact delta time supplied in milliseconds
}
/**** }}} initRender() and stepRender()  ****/

/**** {{{ clientAssert() and serverAssert() ****/
Null.prototype.clientAssert = function(id) {
	// a client speaks it mind to the server
	return "je pense donc je suis"
}

Null.prototype.serverAssert = function() {
	// a server speaks it mind to the clients
	return "yeah well that's kind of a tautology isn't it"
}
/**** }}} clientAssert() and serverAssert() ****/

/**** {{{ clientMerge() and serverMerge() ****/
Null.prototype.clientMerge = function(id, snap) {
	// when a client recieves a snapshot from the server
}

Null.prototype.serverMerge = function(id, snap) {
	// when the server recieves a snapshot from a client
}
/**** }}} clientMerge() and serverMerge() ****/

/**** {{{ acceptKey ****/
Null.prototype.acceptKey = function(id, key, state) {
	// player 'id' pressed 'key'
	// wtf are we going to do now
	// shitshitshitshit
}
/**** }}} acceptInput ****/

/**** {{{ describeState() ****/
Null.describeState = function() {
	// describes the state of the game to a new player, telling them
	// everything that they need to know (passed to an init())
}
/**** }}} returnState() ****/
