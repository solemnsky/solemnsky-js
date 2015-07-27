/*                  ******** offline.js ********                   //
\\ This file defines a simple offline client. It aims to be as     \\
// simple as possible, delegating all logic to game libraries.     // 
\\ It exists for testing and demonstration purposes.               \\ 
//                  ******** offline.js ********                   */

/**** {{{ key bindings ****/
Mousetrap.bind('i', function() { 
		SolemnSky.findPlayerById(myid).movement.forward = true;
	}, 'keydown');
Mousetrap.bind('i', function() { 
		SolemnSky.findPlayerById(myid).movement.forward = false; 
	}, 'keyup');
Mousetrap.bind('k', function() { 
		SolemnSky.findPlayerById(myid).movement.backward = true; 
	}, 'keydown');
Mousetrap.bind('k', function() { 
		SolemnSky.findPlayerById(myid).movement.backward = false; 
	}, 'keyup');
Mousetrap.bind('j', function() { 
		SolemnSky.findPlayerById(myid).movement.left = true; 
	}, 'keydown');
Mousetrap.bind('j', function() { 
		SolemnSky.findPlayerById(myid).movement.left = false; 
	}, 'keyup');
Mousetrap.bind('l', function() { 
		SolemnSky.findPlayerById(myid).movement.right = true; 
	}, 'keydown');
Mousetrap.bind('l', function() { 
		SolemnSky.findPlayerById(myid).movement.right = false; 
	}, 'keyup');
/**** }}} key bindings ****/

// start things up
var myid = 0;
SolemnSky.addPlayer(0, 800, 450, "player")
