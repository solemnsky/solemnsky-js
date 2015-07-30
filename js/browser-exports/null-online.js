Null = require("../modes/null/")
NullRender = require("../modes/null/render.js");
NullRender(Null);

Utils = require('../resources/util.js')
clientArena = require("../control/client-arena.js")

mode = new Null()
clientArena("198.55.237.151", 50042, "/", mode)
