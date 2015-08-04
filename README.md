# SolemnSky technical reference 

SolemnSky's development at the moment is seperated into two distinct components: top-level control structures and 'modes', javascript objects over which the top-level control structures are parameterized.  

Modes control the game logic throughout periods of the game where the only networked information involves the shifting of a dynamic (but fairly small) state. That is, things like switching maps are not done during the execution of modes. This is to make the specification of modes as simple and easy to understand as possible.

## modes

To define a mode, a constructor must be exported along with the following prototypical methods:

### initialisation

	- init(initdata): called exactly once at the beginning of the game, with an init string (for instance, players already in the game and the map being used)

	- makeInitData(key): this provides an initial piece of initdata, given a key

	- describeState(): describes the state of the game to a new player 

### update loop

	- step(delta): this is called at ~60Hz, and is supplied with the delta time since its last call. Its intention is to step the game world forward, simulating all game mechanics.

### discrete networking

	- join(nick, id): this is called when a player joins the game, and should return a 'player id' through which the player can be identified (used in other methods). The second parameter is optional, and defaults to the smallest available id.

	- quit(id): this is called when a player of a certain id quits the game

### "continuous" networking

	- clientAssert(id): make an assertion to be sent from a client to the server (sent at ~20Hz)

	- serverAssert(): make an assertion to be sent from the server to all clients (sent at ~20Hz)

	- clientMerge(id, snap): merge an assertion sent from the server to a client
	- serverMerge(id, snap): merge an assertion sent from a client to the server

### misc

	- modeId: the id of the mode, to check if a client and a server are compatible

	- hasEnded(): has the game ended?
	
  - acceptKey(id, key, state): player id puts a key into a state (input for clients)

## rendering (defined in seperate file, only for clients)

	- initRender(renderer): called exactly once at the beginning of a game, with a PIXI renderer

	- stepRenderer(id, delta): called at ~60Hz, with the function of rendering the game world to the renderer with PIXI and the id of the active player, null if not applicable


## top-level control structures

	Top-level control structure deal with making game modes playable. control/offline.js, for example, makes a game mode playable by a single offline player, and control/client-arena.js and control/server-arena.js respectively form a client-server pair where players can join and quit freely during a game. 

## arena multiplayer protocol

### entry protocol

    client: WHO
    server (to client): WHO <mode.modeId>
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

### verbs

    CONNECT: issued by client to request connection
    INIT: issued by server to give init data
    CONNECTED: issued by server to confirm and lock connection
    JOIN: issued by server when a player joins
    QUIT: issued by server when a player quits
    SNAP: issued by servers and clients with respective assertion data

