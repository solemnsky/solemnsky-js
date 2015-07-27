/*                  ******** benchmark/main.js ********               //
\\ Overlays graphics with fps meters for engine and render loops.     \\
//                  ******** benchmark/main.js ********               */

/**** {{{ constructor ****/
function Benchmark(mode) {
	this.mode = mode

	this.lastRenderCounter = 0
	this.renderCounter = 0
	this.renderDelta = 0

	this.lastStepCounter = 0
	this.stepCounter = 0
	this.stepDelta = 0
}
/**** }}} constructor ****/

/**** {{{ join() and quit() ****/
Benchmark.prototype.join = function(name) {
	// a player joins and suggests a name for theirself
	// return a 'player id' 
	this.mode.join(name)
}

Benchmark.prototype.quit = function(id) {
	// a player with the specified id quits
	this.mode.quit(id)
}
/**** }}} join() and quit() ****/

/**** {{{ init() and step() ****/
Benchmark.prototype.init = function() {
	this.mode.init()
}

Benchmark.prototype.step = function(delta) {
	this.stepDelta += delta
	this.stepCounter++
	if (this.stepDelta > 1) {
		this.lastStepCounter = this.stepCounter
		this.stepCounter = 0
	}
	this.mode.step(delta)
}

Benchmark.prototype.hasEnded = function() {
	return this.mode.hasEnded()
}
/**** }}} init() and step() ****/

/**** {{{ initRender() and stepRender() ****/
Benchmark.prototype.initRender = function(stage) {
	stage.addChild(new PIXI.Container())
	stage.addChild(new PIXI.Container())
}

Benchmark.prototype.stepRender = function(stage, delta) {
	var fps = stage.children[0]
	var modeStage = stage.children[1]
	this.renderDelta += delta
	this.renderCounter++
	if (this.renderDelta > 1) {
		this.lastRenderCounter = this.renderCounter
		this.renderCounter = 0
	}
	this.mode.stepRender(modeStage, delta)
}
/**** }}} initRender() and stepRender()  ****/

/**** {{{ clientAssert() and serverAssert() ****/
Benchmark.prototype.clientAssert = function(id) {
	// a client speaks it mind to the server
	return "je pense donc je suis"
}

Benchmark.prototype.serverAssert = function() {
	// a server speaks it mind to the clients
	return "yeah well that's kind of a tautology isn't it"
}
/**** }}} clientAssert() and serverAssert() ****/

/**** {{{ clientMerge() and serverMerge() ****/
Benchmark.prototype.clientMerge = function(id, snap) {
	// when a client recieves a snapshot from the server
}

Benchmark.prototype.serverMerge = function(id, snap) {
	// when the server recieves a snapshot from a client
}
/**** }}} clientMerge() and serverMerge() ****/

/**** {{{ acceptKey ****/
Benchmark.prototype.acceptKey = function (id, key, state) {
	// player 'id' pressed 'key'
	// wtf are we going to do now
	// shitshitshitshit
}
/**** }}} acceptInput ****/
