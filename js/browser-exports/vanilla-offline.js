var ui = require('../ui/index.js')

// make mode
var Vanilla = require("../modes/vanilla/")
("../modes/vanilla/render.js")(Vanilla)
var mode = new Vanilla()

// use control method to turn mode into UI object
var clientOffline = require('../control/client-offline.js')
var myClient = clientOffline(mode)

ui.run(60, myClient)
