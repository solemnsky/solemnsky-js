# SolemnSky technical reference 

SolemnSky's development at the moment is seperated into two distinct components: top-level control structures and 'modes', javascript objects over which the top-level control structures are parameterized.  

Modes control the game logic throughout periods of the game where the only networked information involves the shifting of a dynamic (but fairly small) state. That is, things like switching maps are not done during the execution of modes. This is to make the specification of modes as simple and easy to understand as possible.

## modes

To define a mode, a constructor must be exported along with the following prototypical methods:

### initialisation and simulation

	- makeInitData(key): this provides an initial piece of initdata, given a key

	- init(initdata): this is called exactly once at the beginning of the game, with an initkey, which defines what the new client has to know about the game 

	- step(delta): this is called at ~60Hz, and is supplied with the delta time since its last call. Its intention is to step the game world forward, simulating all game mechanics.

	- hasEnded(): has the game ended?

### joining and quitting

	- join(nick, <id>): this is called when a player joins the game, and should return a 'player id' through which the player can be identified (used in other methods). A manual id may be specified as second parameter.
	- quit(id): this is called when a player of a certain id quits the game

### rendering

	- initRender(renderer): called exactly once at the beginning of a game, with a PIXI renderer
	- stepRenderer(delta): called at ~60Hz, with the function of rendering the game world to the renderer with PIXI

### assertions

	- clientAssert(id): make an assertion to be sent from a client to the server (sent at ~20Hz)
	- serverAssert(): make an assertion to be sent from the server to all clients (sent at ~20Hz)

### merging snapshots

	- clientMerge(id, snap): merge an assertion sent from the server to a client
	- serverMerge(id, snap): merge an assertion sent from a client to the server

### information to new clients

	- describeState(): describes the state of the game to a new player 
	- modeId: the id of the mode, to check if a client and a server are compatible

## top-level control structures

	Top-level control structure deal with making game modes playable. control/offline.js, for example, makes a game mode playable by a single offline player, and control/client-arena.js and control/server-arena.js respectively form a client-server pair where players can join and quit freely during a game. 

## arena multiplayer protocol

### entry protocol

    client: CONNECT <player name>
    server (to client): INIT <mode.describeState()>
    server joins player
    server (to all clients): JOIN <client id> <client name>
    clients join player
    server (to specific client): CONNECTED <client id>

### game protocol

    client: SNAP <mode.clientAssert()>
    server merges snapshot with mode.serverMerge
    server: SNAP <mode.serverAssert()>
    clients merge snapshot with mode.clientMerge

This loop runs approximately every 15 ms.

