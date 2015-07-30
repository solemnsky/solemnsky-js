Null = require("../modes/null/")
NullRender = require("../modes/null/render.js");
NullRender(Null);

Utils = require('../resources/util.js')
clientOffline = require("../control/client-offline.js")

mode = new Null()
clientOffline(mode, "red", "vanilla game mode")
