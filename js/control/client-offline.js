clientCore = require('./client-core.js')

module.exports = function(initkey, mode) {
	clientCore(initkey, mode)
	// todo: parameterize clientCore and add 
	// overlay in offline client with information
}
