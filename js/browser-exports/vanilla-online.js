var ui = require('../ui/index.js')
var util = require('../resources/util.js')

// allocate mode
var Vanilla = require('../modes/vanilla/')
require('../modes/vanilla/render.js')(Vanilla)
var mode = new Vanilla()
	
// write debug pointer
window.MODE = mode

// read address from url
var address = util.getQueryStringValue("address")
if (address === "")
	address = "localhost"

// allocate control object
var client = require('../control/client-arena.js')(mode, address, 50042, "/")

ui.run(60, client)
