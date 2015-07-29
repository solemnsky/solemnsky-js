Null = require("../modes/null/")
Vanilla = require("../modes/vanilla/")
clientOffline = require("../control/client-offline.js")

Utils = require('../resources/util.js')

mode = new Vanilla()
clientOffline(mode, "default", "vanilla game mode")
