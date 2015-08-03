/*                  ******** vanilla/index.js ********                //
\\ General purpose base mode with mechanics, exposing useful bindings.\\
//                  ******** vanilla/index.js ********                */

module.exports = Vanilla

Box2D = require('../../../assets/box2d.min.js')

Utils = require('../../resources/util.js')
maps = require('../../resources/maps.js')

Player = require('./player.js')
gameplay = require('./gameplay.js')
snapshots = require('./snapshots.js')

/**** {{{ constructor ****/
function Vanilla() {
	this.players = []
	this.map = []
	this.scale = gameplay.physicsScale

	// box2d world
	this.world = null

	this.modeId = "vanilla dev"
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
	return Utils.findElemById(this.players, id)
}

Vanilla.prototype.createBox = function(x, y, w, h, isStatic, fields) {
	//Create a fixture definition for the box
	var fixDef = new b2FixtureDef;
	fixDef.density = 10;
	fixDef.friction = 1;
	fixDef.restitution = 0;

	//Create the body definition
	var bodyDef = new b2BodyDef;

	//Box type defined by the caller
	bodyDef.type = (isStatic ? b2Body.b2_staticBody : b2Body.b2_dynamicBody);

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
		{x: x, y: y, w: w, h: h, isStatic: isStatic, fields: fields});

	return box;
} 

Vanilla.prototype.loadMap = function (map) {
	map.forEach(
		function(box) {
			var box = this.createBox(
				box.x, box.y, box.w, box.h, box.isStatic, box.fields)		
			this.map.push(box);
		}, this)
}

Vanilla.prototype.evaluateContact = function(contact) {
	if (!contact.IsTouching()) {
		//Not touching
		return;
	}
	var bodyA = contact.GetFixtureA().GetBody();
	var bodyB = contact.GetFixtureB().GetBody();
	//Determine which is the player
	var player = bodyA;
	if (bodyA.GetUserData().isStatic)
		player = bodyB;

	var worldManifold = new Box2D.Collision.b2WorldManifold;
	contact.GetWorldManifold(worldManifold);

	//http://www.iforce2d.net/b2dtut/collision-anatomy
	var vel1 = bodyA.GetLinearVelocityFromWorldPoint(worldManifold.m_points[0]);
	var vel2 = bodyB.GetLinearVelocityFromWorldPoint(worldManifold.m_points[0]);
	var impactVelocity = {x: vel1.x - vel2.x, y: vel1.y - vel2.y};
	var impact = Math.sqrt(impactVelocity.x * impactVelocity.x + impactVelocity.y * impactVelocity.y);

	var loss = Math.max(gameplay.minimumContactDamage, impact * gameplay.contactDamangeMultiplier);

	player.GetUserData().health -= loss;
}
/**** }}} methods ***/

/**** {{{ init() and step() ****/
Vanilla.prototype.makeInitData = function(key) {
	return JSON.stringify({map: maps.bloxMap, players: []})
}

Vanilla.prototype.init = function(data) {
	this.gravity = new b2Vec2(0, gameplay.gravity);
	this.world = new b2World(
		this.gravity //gravity
		, true  //allow sleep
	);
	this.world.gravity = this.gravity;

	var initdata = JSON.parse(data)
	this.loadMap(initdata.map)
	initdata.players.forEach(
		function(player) {
			this.addPlayer(player.id, player.name)
		}
	)
}

Vanilla.prototype.step = function(delta) {
	// use box2d to mutate the player's states
	this.players.forEach( function(player) { player.writeToBlock() } )
	
	this.world.Step(
		delta / 1000 //time delta
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

/**** {{{ join() and quit() ****/
Vanilla.prototype.join = function(name, id) {
	if (typeof id !== undefined) {
		var ids = this.players.map(function(player) {return player.id})
		newId = Utils.findAvailableId(ids)
	} else {
		newId = id
	}
	this.addPlayer(newId, name)
	return newId
}

Vanilla.prototype.quit = function(id) {
	Utils.removeElemById(this.players, id)
}
/**** }}}} join() and quit() ****/

/**** {{{ clientAssert() and serverAssert() ****/
Vanilla.prototype.clientAssert = function(id) {
	return snapshots.serialiseSnapshot(
		snapshots.makePlayerSnapshot(this, id, 1, true, {})
	)
}

Vanilla.prototype.serverAssert = function() {
	return snapshots.serialiseSnapshot(
		snapshots.makeTotalSnapshot(this, 0)
	)
}
/**** }}} clientAssert() and serverAssert() ****/

/**** {{{ clientMerge() and serverMerge() ****/
Vanilla.prototype.clientMerge = function(id, data) {
	var snap = snapshots.readSnapshot(data)		
	snapshots.applySnapshot(this, this.clientAssert.concat([snap]))
}

Vanilla.prototype.serverMerge = function(id, data) {
	var snap = snapshots.readSnapshot(data)
	snapshots.applySnapshot(this, snap)
}

// this is currently very simplistic and does not do anything special
// for interactions
/**** }}} clientMerge() and serverMerge() ****/

/**** {{{ acceptKey() ****/
Vanilla.prototype.acceptKey = function(id, key, state) {
	var player = this.findPlayerById(id)
	if (player !== null) {
		switch (key) {
			case ("up"): player.movement.forward = state; break
			case ("down"): player.movement.backward = state; break
			case ("left"): player.movement.left = state; break
			case ("right"): player.movement.right = state; break
		}
	}
}
/**** }}} acceptKey ****/

/**** {{{ describeState() ****/
Vanilla.prototype.describeState = function() {
	return JSON.stringify({
		map: this.map
		, players: this.players.map(
			function(player) {
				return {id: player.id, name: player.name}
			}
		)
	})
}
/**** }}} returnState() ****/
