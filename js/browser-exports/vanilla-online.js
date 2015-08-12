var ui = require('../ui/index.js')
var Util = require('../resources/util.js')

// make mode
var Vanilla = require('../modes/vanilla/')
require('../modes/vanilla/render.js')(Vanilla)
var mode = new Vanilla()

	
// debug pointer
window.MODE = mode

var address = Util.getQueryStringValue("address")
if (address === "")
	address = "localhost"

// use control method to turn mode into UI object
var clientOnline = require('../control/client-arena.js')
var myClient = clientOnline(mode, address, 50042, "/")

ui.run(60, myClient)

