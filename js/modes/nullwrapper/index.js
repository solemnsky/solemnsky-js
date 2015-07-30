/*                  ******** null/index.js ********                    //
\\ This is a trivial wrapper mode; it wraps a mode without doing shit.\\
//                  ******** null/index.js ********                    */

module.exports = NullWrapper

/**** {{{ constructor ****/
function NullWrapper(mode) {
	this.mode = mode
	this.modeId = mode.modeId
}
/**** }}} constructor ****/

/**** {{{ init() and step() ****/
NullWrapper.prototype.makeInitData = function(key) {
	return this.mode.makeInitData(key)
}

NullWrapper.prototype.init = function(initdata) {
	return this.mode.init(initData)
}

NullWrapper.prototype.step = function(delta) {
	return this.mode.step(delta)
}

NullWrapper.prototype.hasEnded = function() {
	return this.mode.hasEnded()
}
/**** }}} init() and step() ****/

/**** {{{ join() and quit() ****/
NullWrapper.prototype.join = function(name) {
	return this.mode.join(name)
}

NullWrapper.prototype.quit = function(id) {
	return this.mode.quit(id)
}
/**** }}} join() and quit() ****/

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

/**** {{{ describeState() ****/
NullWrapper.prototype.describeState = function() {
	return this.mode.describeState()
}
/**** }}} returnState() ****/
