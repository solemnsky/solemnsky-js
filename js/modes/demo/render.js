/*                  ******** demo/render.js ********                  //
\\ Rendering for the demo.                                            \\
//                  ******** demo/render.js ********                  */

var PIXI = require('../../../assets/pixi.min.js')

module.exports = function(Demo) {

	Demo.prototype.initRender = function(stage) { 
		var title = new PIXI.Text("solemnsky development demo", {fill: 0xFFFFFF})
		title.position = new PIXI.Point(800 - title.width / 2, 10)
		stage.addChild(title)

		this.vanillaStage = new PIXI.Container()
		stage.addChild(this.vanillaStage)
		this.vanilla.initRender(this.vanillaStage)
	}

	Demo.prototype.stepRender = function(id, stage, delta) {
		this.vanilla.stepRender(id, this.vanillaStage, delta)
	}

}
