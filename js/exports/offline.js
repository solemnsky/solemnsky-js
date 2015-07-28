Null = require("../modes/null/")
Vanilla = require("../modes/vanilla/")
clientOffline = require("../control/client-offline.js")

mode = new Vanilla()

clientOffline("", mode)
