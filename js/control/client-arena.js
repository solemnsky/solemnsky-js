/*                  ******** client-arena.js ********              //
\\ This is a client that connects to an arena server, where teams  \\
// are not fixed by any lobby mechanic and players can come and go //
\\ from the game as they please.                                   \\
//                  ******** client-arena.js ********              */

PIXI = require("../../assets/pixi.min.js")
nameFromkeyCode = require("../resources/keys.js")

clientCore = require('./client-core.js')

module.exports = function(address, mode) {
	clientCore("this should be recieved from the server", mode)
	mode.init("this data should also be recieved from the server", "as should this")
}

