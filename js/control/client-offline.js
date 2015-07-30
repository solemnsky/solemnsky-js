/*                  ******** client-offline.js ********                //
\\ Small wrapper over client-core, tests a mode out offline.           \\
//                  ******** client-offline.js ********                */
clientCore = require('./client-core.js')
PIXI = require('../../assets/pixi.min.js')
runPixi = require('../resources/pixi.js')
splash = require('../resources/splash.js')

module.exports = function(mode, key) {

// overlay
overlay = new PIXI.Container()
text1 = new PIXI.Text("offline demo" , {fill: 0xFFFFFF})
text1.position = new PIXI.Point(800, 15)
overlay.addChild(text1)
text2 = new PIXI.Text("modeId = " + mode.modeId , {fill: 0xFFFFFF})
text2.position = new PIXI.Point(800, 850)
overlay.addChild(text2)

mode.init(mode.makeInitData(key))
mode.join("offline player")

function callback() { }

clientCore(mode, callback, overlay)
}
