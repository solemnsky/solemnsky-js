var ui = require('../ui/index.js')

var Vanilla = require('../modes/vanilla/')
require('../modes/vanilla/render.js')(Vanilla)

// make mode
var Demo = require('../modes/demo/')
require('../modes/demo/render.js')(Demo)
var mode = new Demo(new Vanilla())
	
// debug pointer
window.MODE = mode

// use control method to turn mode into UI object
var clientOffline = require('../control/client-offline.js')
var myClient = clientOffline(mode) 

ui.run(60, myClient)

