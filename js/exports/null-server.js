Null = require("../modes/null/")
Vanilla = require("../modes/vanilla/")

Utils = require('../resources/util.js')

serverCore = require("../control/server-core.js");

mode = new Null()

Server = serverCore(50042)
Server.openSocket();
