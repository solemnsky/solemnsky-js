/*                  ******** null/index.js ********                   //
\\ Client-side rendering for null	                                    \\ 
//                  ******** null/index.js ********                   */

PIXI = require('../../../assets/pixi.min.js')
Utils = require('../../resources/util.js')

module.exports = function(Demo) {

Demo.prototype.initRender = function(stage) { 
	this.vanilla.initRender(stage)
}

Demo.prototype.stepRender = function(stage, delta) {
	this.vanilla.stepRender(stage, delta)
}

}
