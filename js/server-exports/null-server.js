Null = require("../modes/null/")
Utils = require('../resources/util.js')
serverCore = require("../control/server-core.js");

mode = new Null()

serverCore(50042, mode, "default")
