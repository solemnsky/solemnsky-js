# The SolemnSky technical reference 

SolemnSky's development is currently concerned with the design of a set of reasonably scalable and extendable infrastructures to use in the future, and a featureful game demo to demonstrate the overall design's effectiveness and feasibility. 

## modes

Modes are objects that represent the essential game logic of a game mode, i.e. the logic and design that is constant across all concievable implementations of a system (multiplayer or offline) using the game mode in question.

The seperation of modes and control structures (see the relevant section later in this readme) seperate boilerplate and things not directly related to game mechanics design (chatting, HUDs, networking) from the game mode definition, making the latter easy to understand and modify without fear of breaking other elements of the whole game experience.

To define a mode, a constructor must be exported along with the following prototypical methods:

### initialisation

- createState(key): this provides an initial state value, given a key, to be used when the game starts up from nothing
- init(initdata): called exactly once at the beginning of the game, with an initial state value
- describeAssets(): what assets (client-side and large) are necessary?
- describeState(): describes the current state of the game to a new client

### simulation

- acceptEvent(event): called when an external event happens. Clients rarely enter chat events into their game engines, servers rarely enter controller events into theirs.
- listPlayers(): array of player records, at least containing player nickname 'nick' and id number 'id'.
- step(delta): this is called at ~60Hz, and is supplied with the delta time since its last call. Its intention is to step the game world forward, simulating all game mechanics. Returns an array of events. Does not render. Must be called frequently.
- hasEnded(): has the game ended?

### discrete networking

- join(nick, id): this is called when a player joins the game, and should return a 'player id' through which the player can be identified (used in other methods). The second parameter is optional, and defaults to the smallest available id.
- quit(id): this is called when a player of a certain id quits the game

### "continuous" networking

- clientAssert(id): make an assertion to be sent from a client to the server (sent at ~50Hz)
- serverAssert(): make an assertion to be sent from the server to all clients (sent at ~50Hz)
- clientMerge(id, snap): merge an assertion sent from the server to a client (runs at ~50Hz)
- serverMerge(id, snap): merge an assertion sent from a client to the server (runs at ~50Hz)

- serialiseAssertion(snap): assertion -> string
- readAssertion(str): string -> assertion

### modeId

- modeId: the id of the mode, to check if a client and a server are compatible

### rendering (defined in seperate file, only for clients)

- loadAssets(key, onProgress): called exactly once at the beginning of the game with an assets key that describes the assets (textures for example) that need to be loaded, and has an onProgress callback parameterized on the completion of the asset loading as a value from 0 to 1 (loading assets can take a while).
- initRender(renderer): called exactly once at the beginning of a game, with a PIXI renderer
- stepRenderer(id, delta): called at ~60Hz, with the function of rendering the game world to the renderer with PIXI and the id of the active player, null if not applicable

## top-level control structures

Top-level control structure deal with making game modes playable. control/offline.js, for example, makes a game mode playable by a single offline player, and control/client-arena.js and control/server-arena.js respectively form a client-server pair where players can join and quit freely during a game. 

Top-level control structures do not define freeform functions, but rather ui control objects which are executed with the run method exported from the project's ui module. Similar to how the boilerplate of controls, UI, and networking is abstracted from mode objects, the boilerplate of running the rAF loop with render and simulation functions, reporting performance information, and managing transfer of control between ui objects (with the 'next' attribute) is abstracted from ui objects. 

### ui object required methods 

- init()
- initRender(stage)
- step(delta)
- stepRender(stage, delta, performance)
- hasEnded()
- acceptKey(key, state)
- next() (optional)

## events

'Events' may be passed into a mode with acceptEvent and the logical iteration method 'step' returns a list of events. These are used, respectively, to communicate the potentially large and variable set of information that may influence the game (from client's controls to their choices of planes to things they say in the chat) and the information that a game mode may make available for its clients, aside from the basic rendering method and the player listing (points being scored, kill interactions, and the like.) Events are never sent over the network. While team switching may be returned as an event from a game engine and subsequently rendered by the HUD, the communication of this information with other clients is to be done via the continuous networking methods.

Here is a hopefully complete listing of events as they currently stand, and should be updated as they grow:

events for acceptEvent:

- { type: "control", name: (key name), state: (boolean, if the key is pressed) }

events returned by step:

- (empty as of now)

## arena multiplayer protocol

### entry protocol

There are three simple responses dedicated to querying the server and preparing for a join.

	client: PING
	server (to client): PONG
	client: DESC
	server (to client): DESC <description, server name, etc>
	client: WHO
	server (to client): WHO <mode.modeId>

The ASSETS verb is used by the client to load the assets. This step takes some time and has a loading bar drawn in the UI.

	client: ASSETS
	server (to client): ASSETS <mode.describeAssets()>
	client loads assets with mode.loadAssets()

The CONNECT verb begins a process that enters the player into a server, where it can participate in the normal game protocol.

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

This loop runs approximately every 50 ms.

### chat protocol

	client: CHAT <something>
	server: CHAT <client id> <something>
	server enters chat event into mode
	clients enter chat into log

### verbs

- CONNECT: issued by client to request connection
- INIT: issued by server to give init data
- CONNECTED: issued by server to confirm and lock connection
- JOIN: issued by server when a player joins
- QUIT: issued by server when a player quits
- SNAP: issued by servers and clients with respective assertion data
- CHAT: issued by servers and clients; when issued by the server, has an id variable with the id of the player who sent the message to start with.

## code style

There is a .eslintrc in the root directory of this project. It's suggested you have eslint running in your editor, or at the very least running bin/lint.sh from the root directory before pushing commits. 
