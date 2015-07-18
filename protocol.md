# The SolemnSky Protocol

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
	CONNECT (apparently just a dummy message)
	MAP
		serialised map data
	NAME
		client requests name
	ID
		server confirms name, sends id
	LIST
		listing data 
	SNAP
		snapshot data
	CHAT
		(from client) say something
		(from server) broadcast a client's message (along with player id)
