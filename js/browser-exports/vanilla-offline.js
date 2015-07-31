/*
Vanilla = require("../modes/vanilla/")
VanillaRenderer = require("../modes/vanilla/render.js");
VanillaRenderer.extend(Vanilla);

clientOffline = require("../control/client-offline.js")

Utils = require('../resources/util.js')

mode = new Vanilla()
clientOffline(mode, "default", "vanilla game mode")
*/

// make mode
Vanilla = require("../modes/vanilla/")
VanillaRenderer = require("../modes/vanilla/render.js");
VanillaRenderer(Vanilla);
mode = new Vanilla()

// use control function to turn mode into UI control object
clientOffline = require('../control/client-offline.js')

runPixi = require('../pixi/run.js')

runPixi(clientOffline(mode))
