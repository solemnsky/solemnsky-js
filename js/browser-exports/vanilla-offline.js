Null = require("../modes/null/")
Vanilla = require("../modes/vanilla/")
VanillaRenderer = require("../modes/vanilla/render.js");

VanillaRenderer.extend(Vanilla);

clientOffline = require("../control/client-offline.js")

Utils = require('../resources/util.js')

mode = new Vanilla()
clientOffline(mode, "default", "vanilla game mode")
