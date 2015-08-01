Null = require("../modes/null/")
Utils = require('../resources/util.js')
serverArena = require("../control/server-arena.js");

mode = new Null()

serverArena(50042, mode, "default")
