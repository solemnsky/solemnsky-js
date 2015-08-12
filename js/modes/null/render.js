/*                  ******** null/index.js ********                   //
\\ Rendering for the null mode.                                       \\
//                  ******** null/index.js ********                   */

var PIXI = require('../../../assets/pixi.min.js')

module.exports = function(Null) {

	Null.prototype.initRender = function(stage) { 
		stage.addChild(new PIXI.Text("", {fill: 0xFFFFFF}))
	}

	Null.prototype.stepRender = function(id, stage, delta) {
		stage.children[0].text = 
			this.players.reduce(
				function(acc, player) {
					return acc + "\n" + JSON.stringify(player)
				} 
			, "")
	}

}
