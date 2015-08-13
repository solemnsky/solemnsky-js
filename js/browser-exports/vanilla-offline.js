var ui = require('../ui/index.js')

// allocate mode
var Vanilla = require("../modes/vanilla/")
require("../modes/vanilla/render.js")(Vanilla)
var mode = new Vanilla()
	
// write debug pointer
window.MODE = mode

// allocate control object
var client = require('../control/client-offline.js')(mode)

ui.run(60, client)
