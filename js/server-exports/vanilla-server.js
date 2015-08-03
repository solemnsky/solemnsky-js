Vanilla = require("../modes/vanilla/")
Utils = require('../resources/util.js')
serverArena = require("../control/server-arena.js");

mode = new Vanilla()

serverArena(50042, mode, "default")
