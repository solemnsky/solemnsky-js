/*                  ******** maps.js ********                      //
\\ This file defines a set of maps.                                \\
//                  ******** maps.js ********                      */
maps = {
	bloxMap: {
		dimensions: 
			{ width: 3200, height: 800 }
		, blocks: 	
			[ 
				// bounding blocks
				{x:  1600, y:   5, w: 3200, h:  10}
				, {x:  1600, y: 895, w: 3200, h:  10}
				, {x:    5, y: 450, w:   10, h: 900}
				, {x: 3195, y: 450, w:   10, h: 900}

				// interesting blocks
				, {x: 290, y: 130, w: 40, h: 40}
				, {x: 330, y: 210, w: 40, h: 40}
				, {x: 670, y: 330, w: 40, h: 40}
				, {x: 410, y: 230, w: 40, h: 40}
				, {x: 550, y: 130, w: 40, h: 40}
				, {x: 590, y: 240, w: 40, h: 40}
				, {x: 590, y: 200, w: 20, h: 10}
				, {x: 490, y: 280, w: 20, h: 10}
				, {x: 630, y: 370, w: 40, h: 40}
				, {x: 770, y: 400, w: 40, h: 40}
			]
	}
}

module.exports = maps;
