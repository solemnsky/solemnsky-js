/*									******** fade.js ********									   //
\\ Fades the graphics in, good for entry transitions.            \\
//									******** fade.js ********									   */

var PIXI = require('../../../assets/pixi.min.js')


module.exports = function(ctrl, scale) {
	function Fade() {
		this.time = 0
		this.fading = true
	}

	Fade.prototype.init = function() {
		ctrl.init()
	}

	Fade.prototype.initRender = function(stage) {
		this.ctrlStage = new PIXI.Container
		ctrl.initRender(this.ctrlStage)

		stage.addChild(this.ctrlStage)
		this.ctrlStage.alpha = 0
	}

	Fade.prototype.step = function(delta) {
		ctrl.step(delta)
		if (this.fading)
			this.time += delta
		this.fading = this.time < scale
	}
	
	Fade.prototype.stepRender = function(stage, delta, performance) {
		ctrl.stepRender(this.ctrlStage, delta, performance)
		if (this.fading) 
			this.ctrlStage.alpha = this.time / scale
		else 
			this.ctrlStage.alpha = 1
	}

	Fade.prototype.hasEnded = function() {
		return ctrl.hasEnded()
	}

	Fade.prototype.acceptKey = function(key, state) {
		ctrl.acceptKey(key, state)
	}

	Fade.prototype.next = ctrl.next

	return new Fade()
}
