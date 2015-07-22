/*                  ******** maps.js ********                      //
\\ This file defines a set of maps.                                \\
//                  ******** maps.js ********                      */
maps = {
	bloxMap:  [
		// bounding blocks
		{x: 800, y: 2, w: 1600, h: 4, static: true},
		{x: 800, y: 898, w: 1600, h: 4, static: true},
		{x: 5, y: 450, w: 10, h: 900, static: true},
		{x: 1595, y: 450, w: 10, h: 900, static: true},

		{x:  290, y:  130, w: 40, h: 40, static: true},
		{x: 330, y: 210, w: 40, h: 40, static: true},
		{x: 670, y: 330, w: 40, h: 40, static: true},
		{x: 410, y: 230, w: 40, h: 40, static: true},
		{x: 550, y:  130, w: 40, h: 40, static: true},
		{x: 590, y: 240, w: 40, h: 40, static: true},
		{x: 590, y: 200, w: 20, h: 10, static: true},
		{x: 490, y: 280, w: 20, h: 10, static: true},
		{x: 630, y: 370, w: 40, h: 40, static: true},
		{x: 770, y: 400, w: 40, h: 40, static: true}
	]
}

if (typeof(module) !== "undefined") {
	module.exports = maps;
}
