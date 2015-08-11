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
	this.projectiles = []
	this.mapData = []
	// some involved things about the map, like links to the box2d blocks
	// and pixi container is stored in this.map, this.mapData is just
	// the data from resources/maps.js
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

/**** {{{ internal utility methods ****/
Vanilla.prototype.addPlayer = function(id, name) {
	if (this.players.some(function(player) {return player.id == id})) {
		return null
	} else {
		var player = new Player(this, id, 900, 450, name);
		this.players.push(player);
		player.block.SetSleepingAllowed(false);
		player.block.SetBullet(true);
		player.respawning = true;
		return player.id;
	}
}

Vanilla.prototype.findPlayerById = function(id) {
	return Utils.findElemById(this.players, id)
}

Vanilla.prototype.loadMap = function (map) {
	this.mapData = map
	this.map = []
	map.blocks.forEach(
		function(block) {
			var box = this.createBody(
				{x: block.x, y: block.y}
				, this.createShape("rectangle", {width: block.w, height: block.h})
				, {isStatic: true, bodyType: "map"} 
			)
			this.map.push(box);
		}, this)
}

Vanilla.prototype.evaluateContact = function(contact) {
	if (!contact.IsTouching()) {
		//Not touching yet
		return;
	}
	var bodyA = contact.GetFixtureA().GetBody();
	var bodyB = contact.GetFixtureB().GetBody();
	//Determine which is the player
	if (bodyA.GetUserData().bodyType == "player") {
		var player = bodyA
	} else {
		if (bodyB.GetUserData().bodyType == "player")
			player = bodyB
	}

	var worldManifold = new Box2D.Collision.b2WorldManifold;
	contact.GetWorldManifold(worldManifold);

	//http://www.iforce2d.net/b2dtut/collision-anatomy
	var vel1 = 
		bodyA.GetLinearVelocityFromWorldPoint(worldManifold.m_points[0]);
	var vel2 = 
		bodyB.GetLinearVelocityFromWorldPoint(worldManifold.m_points[0]);
	var impactVelocity = {x: vel1.x - vel2.x, y: vel1.y - vel2.y};
	var impact = 
		Math.sqrt(
			impactVelocity.x * impactVelocity.x 
			+ impactVelocity.y * impactVelocity.y);

	var loss = Math.max(gameplay.minimumContactDamage, impact * gameplay.contactDamangeMultiplier);

	// write the collision's effect to the player object
	var playerData = this.findPlayerById(player.GetUserData().bodyId)
	if (playerData !== null)
		playerData.health -= loss;
}

Vanilla.prototype.writeProjectilesToBlock = function () {
	this.projectiles.forEach(
		function(projectile) {
			projectile.block.SetPosition(
				new b2Vec2(
					projectile.position.x / this.scale
					, projectile.position.y / this.scale)
			)
			projectile.block.SetLinearVelocity(
				new b2Vec2(
					projectile.velocity.x / this.scale
					, projectile.velocity.y / this.scale)
			)
		}
	, this)
}
Vanilla.prototype.readProjectilesFromBlock = function () {
	this.projectiles.forEach(
		function(projectile) {
			var vel = projectile.block.GetLinearVelocity()
			var pos = projectile.block.GetPosition()

			projectile.velocity.x = vel.x * this.scale
			projectile.velocity.y = vel.y * this.scale
			projectile.position.x = pos.x * this.scale
			projectile.position.y = pos.y * this.scale
		}
	, this)
}
/**** }}} internal utility methods ***/

/**** {{{ physics interface methods ****/
Vanilla.prototype.createShape = function(type, props) {
	w = props.width; h = props.height
	switch (type) {
		case ("rectangle"): {
			shape = new b2PolygonShape
			shape.SetAsBox(w / 2 / this.scale, h / 2 / this.scale)
			return shape
		}
		case ("triangle"): {
			shape = new b2PolygonShape
			shape.SetAsArray([
				new b2Vec2.Make(-w/2 / this.scale, h/2 / this.scale)
				, new b2Vec2.Make(-w/2 / this.scale, -h/2 / this.scale)
				, new b2Vec2.Make(w/2 / this.scale, 0)], 3)
			return shape 
		}
	}
}

Vanilla.prototype.createBody = function(pos, shape, props) {
	/**** {{{ default params****/
	// parameters used for the body definition
	if (typeof props == "undefined") props = {}
	if (typeof props.density == "undefined") props.density = 20
	if (typeof props.friction == "undefined") props.friction = 0.7
	if (typeof props.restitution == "undefined") props.restitution = 0
	// if body is static, does not move
	if (typeof props.isStatic == "undefined") props.isStatic = true
	// if body is played, does not collide with other players
	if (typeof props.isPlayer == "undefined") props.isPlayer = false
	
	// parameters passed to body userdata
	// "player" or "map" for the time being
	if (typeof props.bodyType == "undefined") props.bodyType = null
	// for players, just the player ID, otherwise null
	if (typeof props.bodyId == "undefined") props.bodyType = null
	/**** }}} default params ****/

	/**** {{{ fixture definition ****/
	var fixDef = new b2FixtureDef
	fixDef.density = props.density
	fixDef.friction = props.friction
	fixDef.restitution = props.restitution
	fixDef.shape = shape

	if (props.isPlayer) {
		fixDef.filter.categoryBits = 0x0002
		fixDef.filter.maskBits = 0x0001
	} else {
		fixDef.filter.categoryBits = 0x0001
	}
	/**** }}} fixture definition ****/

	/**** {{{ body definition ****/
	var bodyDef = new b2BodyDef
	bodyDef.type = 
		((!props.isStatic)? b2Body.b2_dynamicBody : b2Body.b2_staticBody)
	bodyDef.position.x = pos.x / this.scale
	bodyDef.position.y = pos.y / this.scale
	/**** }}} body definition ****/
	
	// enter box into world with body and fixture definitions
	box = this.world.CreateBody(bodyDef); box.CreateFixture(fixDef)
	box.SetUserData({bodyType: props.bodyType, bodyId: props.bodyId})

	return box
} 
/**** }}} physics interface methods ****/

/**** {{{ mode-facing methods ****/
Vanilla.prototype.addProjectile = function(id, type, pos) {
	var shape = this.createShape("rectangle", {width: 5, height: 5})	
	var block = this.createBody(pos, shape, {bodyType: "projectile", bodyId: id})
	this.projectiles.push({id: id, type: type, position: pos, velocity: {x: 0, y: 0}, block: block})
}
/**** }}} mode-facing methods ****/

/**** {{{ initialisation ****/
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
	, this)
}

Vanilla.prototype.makeInitData = function(key) {
	return JSON.stringify({map: maps.bloxMap, players: []})
}

Vanilla.prototype.describeState = function() {
	return JSON.stringify({
		map: this.mapData
		, players: this.players.map(
			function(player) {
				return {id: player.id, name: player.name}
			}
		)
	})
}
/**** }}} initialisation ****/

/**** {{{ simulation****/
Vanilla.prototype.acceptEvent = function(theEvent) {
	if (theEvent.type == "control") {
		var player = this.findPlayerById(theEvent.id)
		if (player !== null) {
			state = theEvent.state
			switch (theEvent.name) {
				case ("up"): player.movement.forward = state; return true;
				case ("down"): player.movement.backward = state; return true;
				case ("left"): player.movement.left = state; return true;
				case ("right"): player.movement.right = state; return true;
			}
		}
	}
}

Vanilla.prototype.listPlayers = function() {
	return this.players.map(
		function(player) {
			return { name: player.name, id: player.id }
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

	this.readProjectilesFromBlock()
	// some operation on projectiles
	this.writeProjectilesToBlock()

	return [] // event log, currently STUB
}

/**** }}} simulation ****/

/**** {{{ discrete networking ****/
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
/**** }}}} discrete networking ****/

/**** {{{ continuous networking ****/
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

Vanilla.prototype.clientMerge = function(id, data) {
	var snap = snapshots.readSnapshot(data)		
	var mysnap = snapshots.readSnapshot(this.clientAssert(id))
	if (snap !== null)
		snapshots.applySnapshot(this, snap.concat(mysnap))
}

Vanilla.prototype.serverMerge = function(id, data) {
	var snap = snapshots.readSnapshot(data)
	if (snap !== null)
		snapshots.applySnapshot(this, snap)
}
/**** }}} continuous networking ****/

/**** {{{ misc ****/
Vanilla.prototype.modeId = "vanilla engine"

Vanilla.prototype.hasEnded = function() { return false }


/**** }}} misc ****/
