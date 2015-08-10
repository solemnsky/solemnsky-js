ui = require('../ui/index.js')

// make mode
Vanilla = require('../modes/vanilla/')
VanillaRenderer = require('../modes/vanilla/render.js')
VanillaRenderer(Vanilla)
mode = new Vanilla()

Util = require('../resources/util.js')

var address = Util.getQueryStringValue("address")
if (address === "")
	address = "localhost";

// use control method to turn mode into UI object
clientOnline = require('../control/client-arena.js')
myClient = clientOnline(mode, address, 50042, "/")

ui.run(60, myClient)
