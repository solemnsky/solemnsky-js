/*
Vanilla = require("../modes/vanilla/")
VanillaRenderer = require("../modes/vanilla/render.js");
VanillaRenderer.extend(Vanilla);

clientOffline = require("../control/client-offline.js")

Utils = require('../resources/util.js')

mode = new Vanilla()
clientOffline(mode, "default", "vanilla game mode")
*/
ui = require('../ui/index.js')

// make mode
Vanilla = require("../modes/vanilla/")
VanillaRenderer = require("../modes/vanilla/render.js");
VanillaRenderer(Vanilla);
mode = new Vanilla()

// use control method to turn mode into UI control object
clientOffline = require('../control/client-offline.js')
myClient = clientOffline(mode)

ui.run(myClient)
