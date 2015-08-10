/*                  ******** performance.js ********                   //
\\ Performance data display in top right of screen.                    \\
//                  ******** performance.js ********                   */

PIXI = require('../../../assets/pixi.min.js')

style = {fill: 0xFFFFFF}
var fps = new PIXI.Text("fps", style)

exports.initRender = function(stage) {
	stage.addChild(fps)	
}
exports.stepRender = function(stage, delta, performance) {

}
