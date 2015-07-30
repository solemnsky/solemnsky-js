/*                  ******** splash.js ********                        //
\\ A UI control object (see pixi.js) acting as a splashscreen.         \\
//                  ******** splash.js ********                        */

PIXI = require('../../assets/pixi.min.js')

module.exports = function(texts, interval) {
if (typeof interval === "undefined") var interval = 1000
function Splash() {
	this.time = 0
	this.text = new PIXI.Text("", {fill: 0xFFFFFF})
}

Splash.prototype.initRender = function(stage) { stage.addChild(this.text) }
Splash.prototype.step = function(delta) { this.time += delta }
Splash.prototype.stepRender = function(stage, delta) {
	this.text = "time is " + this.time
}
Splash.prototype.hasEnded = function() {
	(this.time > ((texts.length + 1) * interval))
}

return new Splash()
}
