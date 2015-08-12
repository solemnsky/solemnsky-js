var Vanilla = require("../modes/vanilla/")
var serverArena = require("../control/server-arena.js");

var mode = new Vanilla()

serverArena(50042, mode, "default")
