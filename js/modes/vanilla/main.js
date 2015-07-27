/*                  ******** vanilla/main.js ********                 //
\\ Matchsticks and basic flight mechanics, with box2d                 \\
//                  ******** vanilla/main.js ********                 */

/**** {{{ constructor ****/
function Vanilla() {
	this.players = []
	this.map = []
	this.scale = gameplay.physicsScale

	// box2d world
	this.world = null
}
/**** }}} constructor ****/

/**** {{{ useful functions ****/
Vanilla.prototype.addPlayer = function(id, name) {
	if (this.players.some(function(player) {return player.id == id})) {
		return null
	} else {
		var player = new Player(this, id, 900, 450, name);
		this.players.push(player);
		player.block.SetUserData(player);
		player.block.SetSleepingAllowed(false);
		player.block.SetBullet(true);
		player.respawning = true;
		return player.id;
	}
}

Vanilla.prototype.findPlayerById = function(id) {
	for (var i = 0; i < this.players.length; i ++) {
		if (this.players[i].id == id)
			return this.players[i]; 
	}
	return null; 
}
/**** }}} useful functions ***/

/**** {{{ init() and step() ****/
Vanilla.prototype.init = function(players) {
	this.gravity = new b2Vec2(0, gameplay.gravity);
	this.world = new b2World(
		this.gravity //gravity
		, true  //allow sleep
	);
	this.world.gravity = this.gravity;

	var listener = new Box2D.Dynamics.b2ContactListener;
	listener.BeginContact = function(contact) {
		this.evaluateContact(contact);
	};
	this.world.SetContactListener(listener);

	players.forEach(
		function(playerData) {
			this.addPlayer(playerData.id, playerData.name)
		}
	)
}

Vanilla.prototype.step = function(delta) {
	// use box2d to mutate the player's states
	this.players.forEach( function(player) { player.writeToBlock() } )
	this.world.Step(
		diff / 1000   //time delta
	,   10       //velocity iterations
	,   10       //position iterations
	);
	// glenn's magic contact listening, affects 'health' values of players
	for (var contact = this.world.GetContactList(); contact != null; contact = contact.GetNext()) {
		this.evaluateContact(contact);
	}

	this.players.forEach( function(player) { player.readFromBlock() } )

	// tick each player forward
	this.players.forEach(function each(player) {
		player.update(this, diff);
	}, this);

	this.updateCallbacks.forEach(function each(callback) {
		callback(diff);
	}, this);
}

Vanilla.prototype.hasEnded = function() {
	return false;
	// has the game ended?

	// WARNING: only return true when you're absolutely sure the game
	// has ended; if you're a client, wait for a confirmation from the server
}
/**** }}} init() and step() ****/

/**** {{{ initRender() and stepRender() ****/
Vanilla.prototype.initRender = function(stage) {
	// TODO: import archived/render.js
}

Vanilla.prototype.stepRender = function(stage, delta) {
	// TODO: import archived/render.js
}
/**** }}} initRender() and stepRender()  ****/

/**** {{{ clientAssert() and serverAssert() ****/
Vanilla.prototype.clientAssert = function(id) {
	// snapshot that is broadcasted from a client to the server
	return "je pense donc je suis"
}

Vanilla.prototype.serverAssert = function() {
	// snapshot that is broadcasted from the server to all clients
	return "yeah well that's kind of a tautology isn't it"
}
/**** }}} clientAssert() and serverAssert() ****/

/**** {{{ clientMerge() and serverMerge() ****/
Vanilla.prototype.clientMerge = function(id, snap) {
	// when a client recieves a snapshot from the server
}

Vanilla.prototype.serverMerge = function(id, snap) {
	// when the server recieves a snapshot from a client
}
/**** }}} clientMerge() and serverMerge() ****/

/**** {{{ acceptKey ****/
Vanilla.prototype.acceptKey(id, key, modifiers, state) {
	var applyToMovement = function(movement) {
		if (state == "keyup") {
			movement = false
		} else { movement = true }
	}
	var player = this.findPlayerById(id)
	if (player !== null) {
		switch (key) {
			case ("up"):
				applyToMovement(player.movement.forward); break;
			case ("down"):
				applyToMovement(player.movement.backward); break;
			case ("left"):
				applyToMovement(player.movement.left); break;
			case ("right"):
				applyToMovement(player.movement.right); break;
		}
	}
}
/**** }}} acceptInput ****/
