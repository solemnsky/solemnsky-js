Null = require("../modes/null/")
NullRender = require("../modes/null/render.js");
NullRender(Null);

Utils = require('../resources/util.js')
clientOnline = require("../control/client-online.js")

mode = new Null()
clientOnline("198.55.237.151", 50042, "/", mode)
