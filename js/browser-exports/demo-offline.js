var ui = require('../ui/index.js')
var msgpack = require('../../assets/msgpack.min.js')

// allocate mode
var Vanilla = require('../modes/vanilla/')
require('../modes/vanilla/render.js')(Vanilla)
var Demo = require('../modes/demo/')
require('../modes/demo/render.js')(Demo)
var mode = new Demo(new Vanilla())
	
// write debug pointers
window.MODE = mode
window.MSGPACK = msgpack

// allocate control object
var client = require('../control/client-offline.js')(mode) 

ui.run(60, client)
