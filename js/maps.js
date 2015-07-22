/*                  ******** maps.js ********                      //
\\ This file defines a set of maps.                                \\
//                  ******** maps.js ********                      */
maps = {
	bloxMap:  [
		// bounding blocks
		{x: 800, y: 5, w: 1600, h: 10, static: true},
		{x: 800, y: 895, w: 1600, h: 10, static: true},
		{x: 5, y: 450, w: 10, h: 900, static: true},
		{x: 1595, y: 450, w: 10, h: 900, static: true},

		{x:  90, y:  30, w: 40, h: 40, static: true},
		{x: 130, y: 110, w: 40, h: 40, static: true},
		{x: 470, y: 230, w: 40, h: 40, static: true},
		{x: 210, y: 130, w: 40, h: 40, static: true},
		{x: 350, y:  30, w: 40, h: 40, static: true},
		{x: 390, y: 140, w: 40, h: 40, static: true},
		{x: 430, y: 270, w: 40, h: 40, static: true},
		{x: 570, y: 300, w: 40, h: 40, static: true}
	]
}

if (typeof(module) !== "undefined") {
	module.exports = maps;
}
