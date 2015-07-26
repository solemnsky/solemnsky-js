/*                  ******** maps.js ********                      //
\\ This file defines a set of maps.                                \\
//                  ******** maps.js ********                      */
maps = {
	bloxMap:  [
		// bounding blocks
		{x:  800, y:   5, w: 1600, h:  10, isStatic: true, fields: {}},
		{x:  800, y: 895, w: 1600, h:  10, isStatic: true, fields: {}},
		{x:    5, y: 450, w:   10, h: 900, isStatic: true, fields: {}},
		{x: 1595, y: 450, w:   10, h: 900, isStatic: true, fields: {}},

		{x: 290, y: 130, w: 40, h: 40, isStatic: true, fields: {}},
		{x: 330, y: 210, w: 40, h: 40, isStatic: true, fields: {}},
		{x: 670, y: 330, w: 40, h: 40, isStatic: true, fields: {}},
		{x: 410, y: 230, w: 40, h: 40, isStatic: true, fields: {}},
		{x: 550, y: 130, w: 40, h: 40, isStatic: true, fields: {}},
		{x: 590, y: 240, w: 40, h: 40, isStatic: true, fields: {}},
		{x: 590, y: 200, w: 20, h: 10, isStatic: true, fields: {}},
		{x: 490, y: 280, w: 20, h: 10, isStatic: true, fields: {}},
		{x: 630, y: 370, w: 40, h: 40, isStatic: true, fields: {}},
		{x: 770, y: 400, w: 40, h: 40, isStatic: true, fields: {}}
	]
}

if (typeof(module) !== "undefined") {
	module.exports = maps;
}
