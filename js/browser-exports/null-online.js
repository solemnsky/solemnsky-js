Null = require("../modes/null/")
NullRender = require("../modes/null/render.js");
Utils = require('../resources/util.js')

NullRender(Null);

clientOnline = require("../control/client-online.js")

mode = new Null()
clientOnline("198.55.237.151", 50042, "/", mode)
