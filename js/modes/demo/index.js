/*                  ******** demo/index.js ********                   //
\\ Development demo with fun features!                                \\
//                  ******** demo/index.js ********                   */

module.exports = Demo

Utils = require('../../resources/util.js')

/**** {{{ constructor ****/
function Demo(vanilla) {
	this.vanilla = vanilla
}
/**** }}} constructor ****/

/**** {{{ initialisation ****/ 
Demo.prototype.init = function(initdata) {
	this.vanilla.init(initdata)
}

Demo.prototype.makeInitData = function(key) {
	return this.vanilla.makeInitData(key)
}

Demo.prototype.describeState = function() {
	return this.vanilla.describeState()
}
/**** }}} initialisation ****/

/**** {{{ simulation****/
Demo.prototype.acceptEvent = function(theEvent) {
	this.vanilla.acceptEvent(theEvent)
}

Demo.prototype.playerList = function() {
	return this.vanilla.playerList()
}

Demo.prototype.step = function(delta) {
	return this.vanilla.step(delta)
}

Demo.prototype.hasEnded = function() {
	return this.vanilla.hasEnded()
}
/**** }}} simulation****/

/**** {{{ discrete networking ****/
Demo.prototype.join = function(name, id) {
	this.vanilla.join(name, id)
}

Demo.prototype.quit = function(id) {
	this.vanilla.quit(id)
}
/**** }}} join() and quit() ****/

/**** {{{ continuous networking ****/
Demo.prototype.clientAssert = function(id) {
	this.vanilla.clientAssert(id)
}

Demo.prototype.serverAssert = function() {
	this.vanilla.serverAssert()
}

Demo.prototype.clientMerge = function(id, snap) {
	this.vanilla.clientMerge(id, snap)
}

Demo.prototype.serverMerge = function(id, snap) {
	this.vanilla.serverMerge(id, snap)
}
/**** }}} continuous networking ****/

Demo.prototype.modeId = "demo dev"
