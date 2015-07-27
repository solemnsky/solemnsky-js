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

/**** {{{ box2d synonyms ****/
b2Vec2         = Box2D.Common.Math.b2Vec2
b2BodyDef      = Box2D.Dynamics.b2BodyDef
b2Body         = Box2D.Dynamics.b2Body
b2FixtureDef   = Box2D.Dynamics.b2FixtureDef
b2Fixture      = Box2D.Dynamics.b2Fixture
b2World        = Box2D.Dynamics.b2World
b2MassData     = Box2D.Collision.Shapes.b2MassData
b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
b2CircleShape  = Box2D.Collision.Shapes.b2CircleShape
b2DebugDraw    = Box2D.Dynamics.b2DebugDraw;
/**** }}} box2d synonyms ****/

/**** {{{ methods ****/
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

Vanilla.prototype.createBox = function(x, y, w, h, static, fields) {
	//Create a fixture definition for the box
	var fixDef = new b2FixtureDef;
	fixDef.density = 10;
	fixDef.friction = 1;
	fixDef.restitution = 0;

	//Create the body definition
	var bodyDef = new b2BodyDef;

	//Box type defined by the caller
	bodyDef.type = (static ? b2Body.b2_staticBody : b2Body.b2_dynamicBody);

	//Read from the fields, if they exist
	if (typeof fields !== "undefined") {
		if (typeof fields.density !== "undefined") 
			fixDef.density = fields.density;
		if (typeof fields.friction !== "undefined") 
			fixDef.friction = fields.friction;
		if (typeof fields.restitution !== "undefined") 
			fixDef.restitution = fields.restitution;
	}
	
	//Positions the center of the object (not upper left!)
	bodyDef.position.x = x / this.scale;
	bodyDef.position.y = y / this.scale;
	
	fixDef.shape = new b2PolygonShape;
	
	// half width, half height. eg actual height here is 1 unit
	fixDef.shape.SetAsBox(w / 2 / this.scale, h / 2 / this.scale);
	box = this.world.CreateBody(bodyDef);
	box.CreateFixture(fixDef);

	box.life = 1;
	if (typeof fields !== "undefined" && typeof fields.life !== "undefined") box.life = fields.life;

	box.SetUserData(
		{x: x, y: y, w: w, h: h, isStatic: static, fields: fields});

	return box;
} 
/**** }}} methods ***/

/**** {{{ join() and quit() ****/
Vanilla.prototype.join = function(name) {
	var ids = this.players.map(function(player) {return player.id})
	var fillGap = Utils.range(0, (ids.length - 1)).reduce(
		function(acc, x) { 
			if (acc === null) {
				if (ids[x] == x) {
					return x
				} else { return null }
			} else { return acc }
		}
	, 0)
	var id = ids.length
	if (fillGap !== null) id = fillGap		
	this.addPlayer(id, name)
}

Vanilla.prototype.quit = function(id) {

}
/**** }}}} join() and quit() ****/

/**** {{{ init() and step() ****/
Vanilla.prototype.init = function() {
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
}

Vanilla.prototype.step = function(delta) {
	// use box2d to mutate the player's states
	this.players.forEach( function(player) { player.writeToBlock() } )
	this.world.Step(
		delta / 1000   //time delta
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
		player.step(delta);
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
	stage.removeChildren()
	var text = new PIXI.Text("hey", {fill: 0xFFFFFF})
	text.position = new PIXI.Point(800, 450)
	stage.addChild(text)
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
Vanilla.prototype.acceptKey = function(id, key, modifiers, state) {
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
