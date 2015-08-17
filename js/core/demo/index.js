/*                  ******** demo/index.js ********                   //
\\ Development demo with fun features!                                \\
//                  ******** demo/index.js ********                   */

module.exports = Demo

/**** {{{ constructor ****/
function Demo(vanilla) {
	this.vanilla = vanilla
}
/**** }}} constructor ****/

/**** {{{ initialisation ****/ 
Demo.prototype.createState = function(key) {
	return this.vanilla.createState(key)
}

Demo.prototype.init = function(initdata) {
	this.vanilla.init(initdata)
}

Demo.prototype.describeAssets = function() {
	return this.vanilla.describeAssets()
}	

Demo.prototype.describeState = function() {
	return this.vanilla.describeState()
}
/**** }}} initialisation ****/

/**** {{{ simulation****/
Demo.prototype.acceptEvent = function(theEvent) {
	if (theEvent.type === "control" 
		&& theEvent.name === "f" && theEvent.state) {
		// somebody's fired a bullet
		var player = this.vanilla.findPlayerById(theEvent.id)	
		if (player !== null) 
			this.vanilla.addProjectile(
				theEvent.id, null
				, {x: player.position.x + Math.cos(player.rotation) * 30 
					, y: player.position.y + Math.sin(player.rotation) * 30}
				, {x: player.velocity.x + Math.cos(player.rotation) * 200
					, y: player.velocity.y + Math.sin(player.rotation) * 200})
	}
	this.vanilla.acceptEvent(theEvent)
}

Demo.prototype.listPlayers = function() {
	return this.vanilla.listPlayers()
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
	return this.vanilla.clientAssert(id)
}

Demo.prototype.serverAssert = function() {
	return this.vanilla.serverAssert()
}

Demo.prototype.clientMerge = function(id, snap) {
	this.vanilla.clientMerge(id, snap)
}

Demo.prototype.serverMerge = function(id, snap) {
	this.vanilla.serverMerge(id, snap)
}

Demo.prototype.serialiseAssertion = function(snap) {
	return this.vanilla.serialiseAssertion(snap)
}

Demo.prototype.readAssertion = function(str) {
	return this.vanilla.readAssertion(str)
}
/**** }}} continuous networking ****/

Demo.prototype.modeId = "demo dev"
