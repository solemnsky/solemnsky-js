ui = require('../ui/index.js')

// make mode
Vanilla = require('../modes/vanilla/')
VanillaRenderer = require('../modes/vanilla/render.js')
VanillaRenderer(Vanilla)
mode = new Vanilla()

// use control method to turn mode into UI object
clientOnline = require('../control/client-arena.js')
// myClient = clientOnline(mode, "198.55.237.151", 50042, "/") 
myClient = clientOnline(mode, "localhost", 50042, "/")

ui.run(60, myClient)
