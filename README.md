# SolemnSky technical reference 

## game engine reference card

### user-facing methods
 - Game.addPlayer(id, x, y, name, color, image)
 - Game.deletePlayer(id)
 - Game.findPlayerById(id)
 - Game.addUpdateCallback(callback())
   - adds a callback to be executed at every Game.update() call 
 - (abandoned for some reason)
 - Game.setSimulating(simulating)
 - Game.setFPS(fps)

### initialisation and update methods
 - Game.init()
   - initialises the game, call this exactly once
 - Game.update()
   - updates the game, call this as often as you render

### snapshots, listings, and maps: justification of design pattern
  Snapshots, listings, and maps, collectively, can affect any part of the game state, but they are seperated by the rates at which they are sent over the network. Flexible snapshots may represent anything from changes in a player's movement to complete images of every player's positions, and are sent over the network at around 20Hz. Listings are meant to make sure all clients are synced up in terms of who has joined the game and what their stats are. Maps are potentially very large pieces of data with information on the environment.

### snapshots
  A snapshot represents a sort of delta in the dynamic part of the game state; a player, alone, might send snapshots of itself to the server, where they are simply merged, but in an engagement, where one player kills another player, perhaps the snapshot from the killer that said his shot hit could override the snapshot from the victim who thought the shot had missed (these sort of decisions are inevitable if we don't want to go back to the 'mile long keyboard')

  Snapshots are simple arrays of JSON objects and can be modified after being created with makeSnapshot. Assigning a null value to a parameter makes that parameter have no effect when applied to an engine.

 - Game.makeSnapshot([id])
   - makes a snapshot with the dynamic state from the players whos id is an element of the array given
 - Game.applySnapshot(snapshot)
   - applies the snapshot to the game state, potentially overriding the dynamic state of players 
 - Game.makeTotalSnapshot()
   - makes a snapshot with all the dynamic state of all the players
 - Game.serialiseSnapshot(snapshot)
 - Game.readSnapshot(string)
 - Game.emitTotalSnapshot()
   - emits a snapshot of everything (useful for server)

### listings
  A listing represents a static listing of players.  This is the type of thing that doesn't need to be broadcasted ever tick of the server clock.
	
 - Game.makeListing()
 - Game.applyListing(listing)
   - applies a listing, filling in players that are not yet in the engine's player list with null data
 - Game.serialiseListing(listing)
 - Game.readListing(string)
 - Game.emitListing()
   - emits the current listing (useful for server)

### maps
  Right now maps are just arrays of blocks. They will be more exciting in the future. This is the type of thing that you really, really, really don't want to broadcast at every tick of the clock.

 - Game.loadMap(map)
   - loads a map! w00t
 - Game.serialiseMap(map)
 - Game.readMap(string)
 - Game.emitMap()
   - emits the current map (useful for server)

## outline of protocol

    >> represents a client action
    << represents a server action

All messages over the web socket are prefixed with a single-word descriptor in capital LETTERS.

Connection protocol:

    >> CONNECT
    << MAP <serialiseMap()>
    >> loadMap()
    >> NAME <name>
    << ID <new player id>
    << addPlayer()
    << JOIN <name>
    << LIST <serialiseListing()> (to all clients)
    >> applyListing()

Snapshot loop (~20Hz):

    >> SNAP <serialiseSnapshot()> (to all clients)
    << applySnapshot()
    << broadcast SNAP <emitTotalSnapshot()> (from all clients)
    >> applySnapshot() (in response to all clients)

Chat protocol:

    >> CHAT <message>
    << CHAT <id> <message> (to all players)

Quit protocol:

    >> (stop responding)
    << remove player from listing
    << LIST <serialiseListing()> (to all clients)

verbs:
 - CONNECT (apparently just a dummy message)
 - MAP: serialised map data
 - NAME: client requests name
 - ID: server confirms name, sends id
 - JOIN: alert that a player has joined
 - LIST: listing data 
 - SNAP: snapshot data
 - CHAT: 
   - (from client) say something
   - (from server) broadcast a client's message (along with player id)
