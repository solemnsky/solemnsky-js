/*                  ******** splash.js ********                        //
\\ A UI object that just shows some text and exits! Is this useful?    \\
// Probably!                                                           //
\\                                                                     \\
//                  ******** splash.js ********                        */

PIXI = require('../../assets/pixi.min.js')

module.exports = function(texts, interval) {
if (typeof interval === "undefined") var interval = 1000

function Splash() {
	this.time = 0
	this.text = new PIXI.Text("", {fill: 0xFFFFFF})
}

Splash.prototype.init = function() {}
Splash.prototype.step = function(delta) { 
	this.time += delta 
}
Splash.prototype.initRender = function(stage) { 
	stage.addChild(this.text) 
}
Splash.prototype.stepRender = function(stage, delta) {
	this.text.text = "time is " + this.time
}
Splash.prototype.hasEnded = function() {
	(this.time > ((texts.length + 1) * interval))
}
Splash.prototype.acceptKey = function(){}

return new Splash()
}
