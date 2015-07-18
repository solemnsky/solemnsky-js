# The SolemnSky Protocol

		>> represents a client action
		<< represents a server action

All messages over the web socket are prefixed with a single-word descriptor in capital LETTERS.

		>> CONNECT
		<< (no response)
		>> NAME <name>
		<< add the player to the game engine
		<< LIST <serialiseListing()>
		>> applyListing()
		>> SNAP <serialiseSnapshot()>
		<< applySnapshot()
		<< SNAP <emitTotalSnapshot()>
		>> applySnapshot()
		...
		<< remove player from listing
		<< LIST <serialiseListing()>
