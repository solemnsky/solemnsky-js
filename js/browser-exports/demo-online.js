var runUI = require('../interface/run.js')
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
var splash = require('../interface/effects/splash.js')
var fade = require('../interface/effects/fade.js')

// read address from url
var address = util.getQueryStringValue("address")
if (address === "")
	address = "localhost"

// allocate control object
var client = require('../interface/client-arena.js')(mode, address, 50042, '/') 
var ctrl = splash(fade(client, 250), 1500)

runUI(60, ctrl)
