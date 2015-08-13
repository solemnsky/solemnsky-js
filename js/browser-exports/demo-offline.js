var ui = require('../ui/index.js')

// allocate mode
var Vanilla = require('../modes/vanilla/')
require('../modes/vanilla/render.js')(Vanilla)
var Demo = require('../modes/demo/')
require('../modes/demo/render.js')(Demo)
var mode = new Demo(new Vanilla())
	
// write debug pointer
window.MODE = mode

// allocate control object
var client = require('../control/client-offline.js')(mode) 

ui.run(60, client)
