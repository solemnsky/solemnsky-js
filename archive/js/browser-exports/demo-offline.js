var runUI = require('../interface/run.js')

// allocate mode
var Vanilla = require('../modes/vanilla/')
require('../modes/vanilla/render.js')(Vanilla)
var Demo = require('../modes/demo/')
require('../modes/demo/render.js')(Demo)
var mode = new Demo(new Vanilla())
	
// write debug pointers
window.MODE = mode

// effects
var splash = require('../interface/effects/splash.js')
var fade = require('../interface/effects/fade.js')

// allocate control object
var client = require('../interface/client-offline.js')(mode) 
var ctrl = splash(fade(client, 250), 1500)

runUI(60, ctrl)
