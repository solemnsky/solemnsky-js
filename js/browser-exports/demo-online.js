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

// effects
var splash = require('../control/effects/splash.js')
var fade = require('../control/effects/fade.js')

// read address from url
var address = util.getQueryStringValue("address")
if (address === "")
	address = "localhost"

// allocate control object
var Client = require('../control/client-arena.js')(mode, address, 50042, '/') 
var ctrl = splash(fade(new Client(), 250), 1500)

ui.run(60, ctrl)
