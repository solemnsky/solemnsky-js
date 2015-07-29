Null = require("../modes/null/")
Vanilla = require("../modes/vanilla/")
VanillaRenderer = require("../modes/vanilla/render.js");

VanillaRenderer.extend(Vanilla);

clientOnline = require("../control/client-online.js")

Utils = require('../resources/util.js')

mode = new Vanilla()
clientOnline("198.55.237.151", 50042, "/", mode)
