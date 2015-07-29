Null = require("../modes/null/")
Vanilla = require("../modes/vanilla/")

Utils = require('../resources/util.js')

serverCore = require("./server-core.js");

mode = new Null()

serverCore(50042)
