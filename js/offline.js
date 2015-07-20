/*                  ******** offline.js ********                   //
\\ This file defines a simple offline client. It aims to be as     \\
// simple as possible, delegating all logic to game libraries.     // 
\\ It exists for testing and demonstration purposes.               \\ 
//                  ******** offline.js ********                   */

SolemnSky = new Game();
SolemnSky.setFPS(60);
SolemnSky.init();

/**** {{{ key bindings ****/
Mousetrap.bind('up', function() { 
		SolemnSky.findPlayerById(myid).movement.forward = true;
	}, 'keydown');
Mousetrap.bind('up', function() { 
		SolemnSky.findPlayerById(myid).movement.forward = false; 
	}, 'keyup');
Mousetrap.bind('down', function() { 
		SolemnSky.findPlayerById(myid).movement.backward = true; 
	}, 'keydown');
Mousetrap.bind('down', function() { 
		SolemnSky.findPlayerById(myid).movement.backward = false; 
	}, 'keyup');
Mousetrap.bind('left', function() { 
		SolemnSky.findPlayerById(myid).movement.left = true; 
	}, 'keydown');
Mousetrap.bind('left', function() { 
		SolemnSky.findPlayerById(myid).movement.left = false; 
	}, 'keyup');
Mousetrap.bind('right', function() { 
		SolemnSky.findPlayerById(myid).movement.right = true; 
	}, 'keydown');
Mousetrap.bind('right', function() { 
		SolemnSky.findPlayerById(myid).movement.right = false; 
	}, 'keyup');
/**** }}} key bindings ****/

// start things up
var myid = 0;
SolemnSky.addPlayer(0, 0, 0, "player", "", "")
SolemnSky.loadMap(maps.bloxMap)
