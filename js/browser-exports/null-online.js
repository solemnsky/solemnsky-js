ui = require('../ui/index.js')

// make mode
Null = require('../modes/null/')
NullRenderer = require('../modes/null/render.js')
NullRenderer(Null)
mode = new Null()

// use control method to turn mode into UI object
clientOnline = require('../control/client-arena.js')
// myClient = clientOnline(mode, "198.55.237.151", 50042, "/") 
myClient = clientOnline(mode, "localhost", 50042, "/")

ui.run(myClient)
