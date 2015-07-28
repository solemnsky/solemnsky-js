Null = require("../modes/null/")
Vanilla = require("../modes/vanilla/")
clientOffline = require("../control/client-offline.js")

Utils = require('../resources/util.js')

mode = new Vanilla()

clientOffline(mode, mode.makeInitData("default"), "vanilla game mode")
