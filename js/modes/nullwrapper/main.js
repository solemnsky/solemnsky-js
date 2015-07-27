/*                  ******** null/main.js ********                    //
\\ This is a trivial wrapper mode; it wraps a mode without doing shit.\\
//                  ******** null/main.js ********                    */

/**** {{{ constructor ****/
function NullWrapper(mode) {
	this.mode = mode
}
/**** }}} constructor ****/

/**** {{{ join() and quit() ****/
NullWrapper.prototype.join = function(name) {
	return this.mode.join(name)
}

NullWrapper.prototype.quit = function(id) {
	return this.mode.quit(id)
}
/**** }}} join() and quit() ****/

/**** {{{ init() and step() ****/
NullWrapper.prototype.init = function() {
	return this.mode.init()
}

NullWrapper.prototype.step = function(delta) {
	return this.mode.step(delta)
}

NullWrapper.prototype.hasEnded = function() {
	return this.mode.hasEnded()
}
/**** }}} init() and step() ****/

/**** {{{ initRender() and stepRender() ****/
NullWrapper.prototype.initRender = function(stage) {
	return this.mode.initRender(stage)
}

NullWrapper.prototype.stepRender = function(stage, delta) {
	return this.mode.stepRender(stage)
}
/**** }}} initRender() and stepRender()  ****/

/**** {{{ clientAssert() and serverAssert() ****/
NullWrapper.prototype.clientAssert = function(id) {
	return this.mode.clientAssert(id)
}

NullWrapper.prototype.serverAssert = function() {
	return this.mode.serverAssert()
}
/**** }}} clientAssert() and serverAssert() ****/

/**** {{{ clientMerge() and serverMerge() ****/
NullWrapper.prototype.clientMerge = function(id, snap) {
	return this.mode.clientMerge(id, snap)
}

NullWrapper.prototype.serverMerge = function(id, snap) {
	return this.mode.serverMerge(id, snap)
}
/**** }}} clientMerge() and serverMerge() ****/

/**** {{{ acceptKey ****/
NullWrapper.prototype.acceptKey = function(id, key, state) {
	return this.mode.acceptKey(id, key, state)
}
/**** }}} acceptInput ****/
