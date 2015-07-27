/*                  ******** null/main.js ********                    //
\\ This is a trivial placeholder mode; the 0 of the set of modes.     \\
// It has a very simple functionality for demonstration and testing.  //
\\ You can start from this file when you make a new mode.             \\
//                  ******** null/main.js ********                    */

/**** {{{ constructor ****/
function Null() {
  // state goes here
}
/**** }}} constructor ****/

/**** {{{ init() and step() ****/
Null.prototype.init = function(players) {
}

Null.prototype.step = function(delta) {
	// step the game state forward
	// called at ~60Hz, exact delta time supplied in milliseconds
}

Null.prototype.hasEnded = function() {
	// has the game ended?

	// WARNING: only return true when you're absolutely sure the game
	// has ended; if you're a client, wait for a confirmation from the server
}
/**** }}} init() and step() ****/

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
	// snapshot that is broadcasted from a client to the server
	return "je pens donc je suis"
}

Null.prototype.serverAssert = function() {
	// snapshot that is broadcasted from the server to all clients
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
Null.prototype.acceptKey(id, key) {
	// player 'id' pressed 'key'
	// wtf are we going to do now
	// shitshitshitshit
}
/**** }}} acceptInput ****/
