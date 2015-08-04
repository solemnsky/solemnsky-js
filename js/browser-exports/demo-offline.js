ui = require('../ui/index.js')

Vanilla = require('../modes/vanilla/')
require('../modes/vanilla/render.js')(Vanilla)

// make mode
Demo = require('../modes/demo/')
require('../modes/demo/render.js')(Demo)
mode = new Demo(new Vanilla())

// use control method to turn mode into UI object
clientOffline = require('../control/client-offline.js')
myClient = clientOffline(mode) 

ui.run(myClient)
