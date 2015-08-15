var ui = require('../ui/index.js')

// allocate mode
var Vanilla = require('../modes/vanilla/')
require('../modes/vanilla/render.js')(Vanilla)
var Demo = require('../modes/demo/')
require('../modes/demo/render.js')(Demo)
var mode = new Demo(new Vanilla())
	
// write debug pointers
window.MODE = mode

// effects
var splash = require('../control/effects/splash.js')
var fade = require('../control/effects/fade.js')

// allocate control object
var Client = require('../control/client-offline.js')(mode) 
var ctrl = splash(fade(new Client(), 250), 1500)

ui.run(60, ctrl)
