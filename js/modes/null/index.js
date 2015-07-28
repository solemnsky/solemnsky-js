/*                  ******** null/index.js ********                   //
\\ This is a trivial placeholder mode; the 0 of the set of modes.     \\
// It has a very simple functionality for demonstration and testing.  //
\\ You can start from this file when you make a new mode.             \\
//                  ******** null/index.js ********                   */

module.exports = Null

/**** {{{ constructor ****/
function Null() {
	this.players = []
}
/**** }}} constructor ****/

/**** {{{ init() and step() ****/
Null.prototype.init = function(initkey, players) {
	// initialise game with a key describing some key factors about
	// this particular game, aside from the mode (for instance, a map name)
}

Null.prototype.step = function(delta) {
	// step the game state forward
	// called at ~60Hz, exact delta time supplied in milliseconds
}

Null.prototype.hasEnded = function() {
	// do you think the game has ended?
}
/**** }}} init() and step() ****/

/**** {{{ join() and quit() ****/
Null.prototype.join = function(name) {
	// a player joins and suggests a name for theirself
	// return a 'player id' 
	return 0
}

Null.prototype.quit = function(id) {
	// a player with the specified id quits
}
/**** }}} join() and quit() ****/

/**** {{{ initRender() and stepRender() ****/
Null.prototype.initRender = function(stage) {
	// this method is called exactly once at the beginning of a match,
	// supplied with a fresh PIXI container (PIXI methods are in scope)
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
