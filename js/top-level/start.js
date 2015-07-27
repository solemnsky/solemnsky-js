/*                  ******** start.js ********                      //
\\ This file starts the engine and keeps it running.                \\
//                  ******** start.js ********                      */

//http://paulirish.com/2011/requestanimationframe-for-smart-animating/
if (typeof window !== "undefined") {
	//Client-side
	requestAnimFrame = (function() {
		return window.requestAnimationFrame   || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function(callback, /* DOMElement */ element){
				window.setTimeout(callback, SolemnSky.tickTimeMs);
			};
	})();
} else {
	//Server-side
	requestAnimFrame = function(callback, /* DOMElement */ element){
		setTimeout(callback, SolemnSky.tickTimeMs);
	};
}

/**** {{{ game state ****/
var myid = -1;

//Start up the game
SolemnSky = new Game();
SolemnSky.setFPS(60);
SolemnSky.init();
requestAnimFrame(update);
/**** }}} game state ****/

/**** {{{ safe update method ****/
then = Date.now();
function update() {
	now = Date.now();

	elapsed = now - then;
	requestAnimFrame(update);

	if (elapsed > SolemnSky.tickTimeMs) {
		then = now - (elapsed % SolemnSky.tickTimeMs);

		SolemnSky.update();
	}
} 
/**** }}} safe update method ****/

/**** {{{ constants, helper functions ****/
//Partial application yay
Function.prototype.partial = function() {
	var fn = this, args = arguments;
	return function() { 
		var filledArgs = Array.prototype.slice.call(args);
		for (var i=0, arg=0; arg < arguments.length; i++)
			if (filledArgs[i] === undefined)
				filledArgs[i] = arguments[arg++];
		return fn.apply(this, filledArgs);
	};
};
/**** }}} constants, helper functions ****/

if (typeof(module) !== "undefined") {
	module.exports = SolemnSky;
}
