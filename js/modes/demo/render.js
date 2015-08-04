/*                  ******** demo/render.js ********                  //
\\ Rendering for the demo.                                            \\
//                  ******** demo/render.js ********                  */

PIXI = require('../../../assets/pixi.min.js')
Utils = require('../../resources/util.js')

module.exports = function(Demo) {

Demo.prototype.initRender = function(stage) { 
	var title = new PIXI.Text("solemnsky development demo", {fill: 0xFFFFFF})
	title.position = new PIXI.Point(800, 10)
	stage.addChild(title)

	this.vanillaStage = new PIXI.Container()
	stage.addChild(this.vanillaStage)
	this.vanilla.initRender(this.vanillaStage)
}

Demo.prototype.stepRender = function(stage, delta) {
	this.vanilla.stepRender(this.vanillaStage, delta)
}

}
