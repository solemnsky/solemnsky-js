/*
Vanilla = require("../modes/vanilla/")
VanillaRenderer = require("../modes/vanilla/render.js");
VanillaRenderer.extend(Vanilla);

clientOffline = require("../control/client-offline.js")

Utils = require('../resources/util.js')

mode = new Vanilla()
clientOffline(mode, "default", "vanilla game mode")
*/
splash = require('../pixi/splash.js')
runPixi = require('../pixi/run.js')

runPixi(splash(["adsf"], 1000))
