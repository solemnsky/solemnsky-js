# The SolemnSky Protocol

		>> represents a client action
		<< represents a server action

All messages over the web socket are prefixed with a single-word descriptor in capital LETTERS.

Connection protocol:
		>> CONNECT
		<< MAP <emitMapBlob()>
		>> load map in game engine
		>> NAME <name>
		<< add the player to the game engine
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
