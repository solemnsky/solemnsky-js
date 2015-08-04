/*                  ******** null/index.js ********                   //
\\ Client-side rendering for null	                                    \\ 
//                  ******** null/index.js ********                   */

PIXI = require('../../../assets/pixi.min.js')
Utils = require('../../resources/util.js')

module.exports = function(Null) {

Null.prototype.initRender = function(stage) { 
	this.vanillaStage = new PIXI.Container()
	stage.addChild(this.vanillaStage)
	stage.addChild(new PIXI.Text("welcome to the demo mode"))	
	this.vanilla.initRender(this.vanillaStage)
}

Null.prototype.stepRender = function(stage, delta) {
	this.vanilla.stepRender(this.vanillaStage, delta)
}

}
