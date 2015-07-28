clientCore = require('./client-core.js')
PIXI = require('../../assets/pixi.min.js')

module.exports = function(mode, initdata, description) {

function predicate() {
	return false
}

overlay = new PIXI.Container()
text1 = new PIXI.Text("offline demo" , {fill: 0xFFFFFF})
text1.position = new PIXI.Point(800, 15)
overlay.addChild(text1)
text2 = new PIXI.Text(description , {fill: 0xFFFFFF})
text2.position = new PIXI.Point(800, 850)
overlay.addChild(text2)

clientCore(mode, initdata, predicate, overlay)
}
