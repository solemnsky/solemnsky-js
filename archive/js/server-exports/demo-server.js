var Demo = require("../modes/demo/")
var Vanilla = require('../modes/vanilla')

var serverArena = require("../interface/server-arena.js");

var mode = new Demo(new Vanilla())

serverArena(50042, mode, "default")
