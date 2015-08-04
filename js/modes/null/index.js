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
}
/**** }}} constructor ****/

/**** {{{ methods ****/
Null.prototype.findPlayerById = function(id) {
	return Utils.findElemById(this.players, id)
}
/**** }}} methods ****/

/**** {{{ initialisation ****/ 
Null.prototype.init = function(initdata) {
	var data = JSON.parse(initdata)	
	this.color = data.color
	this.players = data.players
}

Null.prototype.makeInitData = function(key) {
	if (key == 'red') {
		return JSON.stringify({color: 0xFF0000, players: []})
	} else {
		return JSON.stringify({color: 0xFFFFFF, players: []})
	}
}

Null.prototype.describeState = function() {
	return JSON.stringify({color: this.color, players: this.players})
}

/**** }}} initialisation ****/

/**** {{{ update loop ****/
Null.prototype.step = function(delta) {
	this.players.forEach(
		function(player) { player.timespent += delta }
	)
}
/**** }}} update loop ****/

/**** {{{ discrete networking ****/
Null.prototype.join = function(name, id) {
	if (typeof id !== undefined) {
		var ids = this.players.map(function(player) { return player.id })
		newId = Utils.findAvailableId(ids)	
	} else { newId = id }

	this.players.push({name: name, id: newId, timespent: 0})
	return newId
}

Null.prototype.quit = function(id) {
	Utils.removeElemById(this.players, id)
}
/**** }}} join() and quit() ****/

/**** {{{ continuous networking ****/
Null.prototype.clientAssert = function(id) {
	// a client speaks it mind to the server
	return JSON.stringify(this.findPlayerById(id).timespent)
}

Null.prototype.serverAssert = function() {
	return JSON.stringify(this.players)
}

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
/**** }}} continuous networking ****/

/**** {{{ misc ****/
Null.prototype.acceptKey = function(id, key, state) {
	// do absolutely nothing <3
	return false;
}

Null.prototype.hasEnded = function() {
	return false
}

Null.prototype.modeId = "null dev"
/**** }}} misc ****/
