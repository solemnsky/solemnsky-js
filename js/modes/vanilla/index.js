/*									******** vanilla/index.js ********								//
\\ General purpose base mode with mechanics, exposing useful bindings.\\
//									******** vanilla/index.js ********								*/

module.exports = Vanilla

var Box2D = require('../../../assets/box2d.min.js')

var Utils = require('../../resources/util.js')
var maps = require('../../resources/maps.js')

var Player = require('./player.js')
var gameplay = require('./gameplay.js')
var snapshots = require('./snapshots.js')

/**** {{{ constructor ****/
function Vanilla() {
	this.map = []
		// array of map elements, with game state, box2d, and pixi objects
	this.projectiles = []
		// array of projectiles, with gane state, box2d, and pixi objects
	this.players = []
		// array of players, with game state, box2d, and pixi objects
		
		// all of these arrays have a 'block' and 'anim' element
		// for their box2d body and pixi container respectively,
		// along with other top-level values with game state

	this.mapData = []
		// cache of raw map data

	this.world = null
		// box2d world

	this.textures = null
		// cache of textures
	this.graphics = 
		{ mapStage: null
			, projectileStage: null
			, playerStage: null }
		// the three pixi stages, constructed with pixi data from the
		// map, projectile and player arrays and updated each render tick
}
/**** }}} constructor ****/

/**** {{{ box2d synonyms ****/
var b2Vec2				 = Box2D.Common.Math.b2Vec2
var b2BodyDef			 = Box2D.Dynamics.b2BodyDef
var b2Body				 = Box2D.Dynamics.b2Body
var b2FixtureDef	 = Box2D.Dynamics.b2FixtureDef
// var b2Fixture			= Box2D.Dynamics.b2Fixture
var b2World				 = Box2D.Dynamics.b2World
// var b2MassData			= Box2D.Collision.Shapes.b2MassData
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
// var b2CircleShape	= Box2D.Collision.Shapes.b2CircleShape
// var b2DebugDraw		= Box2D.Dynamics.b2DebugDraw;
/**** }}} box2d synonyms ****/

/**** {{{ internal utility methods ****/
Vanilla.prototype.addPlayer = function(id, name) {
	if (this.players.some(function(player) {return player.id === id})) 
		return null

	var player = new Player(this, id, 900, 450, name);
	this.players.push(player);
	player.block.SetSleepingAllowed(false);
	player.block.SetBullet(true);
	player.respawning = true;
	return player.id;
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
			this.map.push(
				{ block: box
				, position: {x: block.x, y: block.y} 
				, dimensions: {w: block.w, h: block.h}}
			)
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
	var player = null
	if (bodyA.GetUserData().bodyType === "player") 
		player = bodyA
	if (bodyB.GetUserData().bodyType === "player")
		player = bodyB
	if (player === null) return 

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
					projectile.position.x / gameplay.physicsScale 
					, projectile.position.y / gameplay.physicsScale)
			)
			projectile.block.SetLinearVelocity(
				new b2Vec2(
					projectile.velocity.x / gameplay.physicsScale 
					, projectile.velocity.y / gameplay.physicsScale)
			)
		}
	, this)
}
Vanilla.prototype.readProjectilesFromBlock = function () {
	this.projectiles.forEach(
		function(projectile) {
			var vel = projectile.block.GetLinearVelocity()
			var pos = projectile.block.GetPosition()

			projectile.velocity.x = vel.x * gameplay.physicsScale
			projectile.velocity.y = vel.y * gameplay.physicsScale
			projectile.position.x = pos.x * gameplay.physicsScale
			projectile.position.y = pos.y * gameplay.physicsScale
		}
	, this)
}
/**** }}} internal utility methods ***/

/**** {{{ physics interface methods ****/
Vanilla.prototype.createShape = function(type, props) {
	var w = props.width; var h = props.height
	var shape = new b2PolygonShape
	var scale = gameplay.physicsScale
	switch (type) {
	case ("rectangle"): {
		shape.SetAsBox(w / 2 / scale, h / 2 / scale)
		return shape
	}
	case ("triangle"): {
		shape.SetAsArray([
			new b2Vec2.Make(-w/2 / scale, h/2 / scale)
			, new b2Vec2.Make(-w/2 / scale, -h/2 / scale)
			, new b2Vec2.Make(w/2 / scale, 0)], 3)
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
	var scale = gameplay.physicsScale
	var bodyDef = new b2BodyDef
	bodyDef.type = 
		((!props.isStatic)? b2Body.b2_dynamicBody : b2Body.b2_staticBody)
	bodyDef.position.x = pos.x / scale
	bodyDef.position.y = pos.y / scale
	/**** }}} body definition ****/
	
	// enter box into world with body and fixture definitions
	var box = this.world.CreateBody(bodyDef); box.CreateFixture(fixDef)
	box.SetUserData({bodyType: props.bodyType, bodyId: props.bodyId})

	return box
} 
/**** }}} physics interface methods ****/

/**** {{{ mode-facing methods ****/
Vanilla.prototype.addProjectile = function(id, type, pos) {
	var shape = this.createShape("rectangle", {width: 5, height: 5})	
	var block = this.createBody(pos, shape, {isStatic: false, isPlayer: false, bodyType: "projectile", bodyId: id})
	this.projectiles.push(
		{ id: id
		, type: type
		, position: pos
		, dimensions: {w: 5, h: 5}
		, velocity: {x: 0, y: 0}
		, block: block})
}
/**** }}} mode-facing methods ****/

/**** {{{ initialisation ****/
Vanilla.prototype.init = function(data) {
	this.gravity = new b2Vec2(0, gameplay.gravity);
	this.world = new b2World(
		this.gravity //gravity
		, true	//allow sleep
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

/**** {{{ simulation ****/
Vanilla.prototype.acceptEvent = function(theEvent) {
	if (theEvent.type === "control") {
		var player = this.findPlayerById(theEvent.id)
		if (player !== null) {
			var state = theEvent.state
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
	,		10			 //velocity iterations
	,		10			 //position iterations
	);
	// glenn's magic contact listening, affects 'health' values of players
	for (var contact = this.world.GetContactList(); contact !== null; contact = contact.GetNext()) {
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
	var newId
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
