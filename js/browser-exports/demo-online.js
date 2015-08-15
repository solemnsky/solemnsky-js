var ui = require('../ui/index.js')
var util = require('../resources/util.js')

// allocate mode
var Vanilla = require('../modes/vanilla/')
require('../modes/vanilla/render.js')(Vanilla)
var Demo = require('../modes/demo/')
require('../modes/demo/render.js')(Demo)
var mode = new Demo(new Vanilla())
	
// write debug pointer
window.MODE = mode

// read address from url
var address = util.getQueryStringValue("address")
if (address === "")
	address = "localhost"

// allocate control object
var Client = require('../control/client-arena.js')(mode) 
var Splash = require('../control/effects/splash.js')
Splash.prototype.next = Client
var ctrl = new Splash()

ui.run(60, ctrl)
