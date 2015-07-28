clientCore = require('./client-core.js')
PIXI = require('../../assets/pixi.min.js')

module.exports = function(mode, initdata) {

function predicate() {
	return false
}

overlay = new PIXI.Container()
text = new PIXI.Text("hey", {fill: 0xFFFFFF})
text.position = new PIXI.Point(800, 450)
overlay.addChild(text)

clientCore(mode, initdata, predicate, overlay)
}
