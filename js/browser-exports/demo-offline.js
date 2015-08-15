var ui = require('../ui/index.js')

// allocate mode
var Vanilla = require('../modes/vanilla/')
require('../modes/vanilla/render.js')(Vanilla)
var Demo = require('../modes/demo/')
require('../modes/demo/render.js')(Demo)
var mode = new Demo(new Vanilla())
	
// write debug pointers
window.MODE = mode

// allocate control object
var Client = require('../control/client-offline.js')(mode) 
var Splash = require('../control/effects/splash.js')
Splash.prototype.next = function(){return new Client()}
var ctrl = new Splash()

ui.run(60, ctrl)
