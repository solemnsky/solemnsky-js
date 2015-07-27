Null = require("../modes/null/")
Vanilla = require("../modes/vanilla/")
runModeOffline = require("../control/offline.js")

mode = new Vanilla()

runModeOffline(mode)
