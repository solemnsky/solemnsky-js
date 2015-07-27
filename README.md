# SolemnSky technical reference 

SolemnSky's development at the moment is seperated into two distinct components: top-level control structures and 'modes', javascript objects over which the top-level control structures are parameterized.

## modes

To define a mode, a constructor must be exported along with the following prototypical methods:

### initialisation and simulation

	- init(players): this is called exactly once at the beginning of the game with an array of objects representing the players who will be playing, supplying their names and player ids in their 'name' and 'id' attributes.
	- step(delta): this is called at ~60Hz, and is supplied with the delta time since its last call. Its intention is to step the game world forward, simulating all game mechanics.

### rendering

	- initRender(renderer): called exactly once at the beginning of a game, with a PIXI renderer
	- stepRenderer(delta): called at ~60Hz, with the function of rendering the game world to the renderer with PIXI

### snapshots

	- clientAssert(id): make a snapshot to be sent from a client to the server (sent at ~20Hz)
	- serverAssert(): make a snapshot to be sent from the server to all clients (sent at ~20Hz)

### merging snapshots

	- clientMerge(id, snap): merge a snapshot sent from the server into a client
	- serverMerge(id, snap): merge a snapshot sent from a client into the server


