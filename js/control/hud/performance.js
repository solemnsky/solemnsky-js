/*                  ******** performance.js ********                   //
\\ Performance data display in top right of screen.                    \\
//                  ******** performance.js ********                   */

PIXI = require('../../../assets/pixi.min.js')

style = {fill: 0xFFFFFF}
var fps = new PIXI.Text("fps", style)
var counter = 0

exports.initRender = function(stage) {
	stage.addChild(fps)	
}
exports.stepRender = function(stage, delta, performance) {
	counter += delta
	if (counter > 500) {
		fps.text = performance.fps + "fps, " + performance.fps + "tps\n" + "l/r/s: " + performance.logicTime + "/" + performance.renderTime + "/" + performance.sleepTime
		counter -= 500
	}
}
