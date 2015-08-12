var Null = require("../modes/null/")
var serverArena = require("../control/server-arena.js");

var mode = new Null()

serverArena(50042, mode, "default")
