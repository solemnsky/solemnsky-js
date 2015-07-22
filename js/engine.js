/*                  ******** engine.js ********                    //
\\ This file defines the game engine object, methods to run        \\
// it, various user-facing methods for clients and servers, and    // 
\\ methods to generate, serialise, and merge various parts of the  \\
// game state, grouped by the frequencies at which they reasonably //
\\ are expected to update. (Read full documentation in the README.)\\
//                  ******** engine.js ********                    */

/**** {{{ misc definitions ****/
if (typeof(windowSize) === "undefined") {
	//Server, we need to init this stuff
	windowSize = {
		width: 1600,
		height: 900 
	}
}

//Shorthands so we don't have long names for the box2d types
var	  b2Vec2         = Box2D.Common.Math.b2Vec2
	, b2BodyDef      = Box2D.Dynamics.b2BodyDef
	, b2Body         = Box2D.Dynamics.b2Body
	, b2FixtureDef   = Box2D.Dynamics.b2FixtureDef
	, b2Fixture      = Box2D.Dynamics.b2Fixture
	, b2World        = Box2D.Dynamics.b2World
	, b2MassData     = Box2D.Collision.Shapes.b2MassData
	, b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
	, b2CircleShape  = Box2D.Collision.Shapes.b2CircleShape
	, b2DebugDraw    = Box2D.Dynamics.b2DebugDraw;
/**** }}} helpful values ****/

/**** {{{ Game() ****/
function Game() {
		// the total game state 
	this.players = []
	this.map = []

		// the box2d world
	this.world = null;

		// update callbacks on Game.update()
	this.updateCallbacks = [];

		// fps and ticktimes, not used internally	
	this.fps = 60.0;
	this.tickTime = 1 / this.fps;
	this.tickTimeMs = 1000 / this.fps;

		// whether the simulation is running
	this.simulating = true;

		// constant scale factor for converting box2d to pixel distances 
	this.scale = gameplay.physicsScale; 
};

/**
 * Create a box in the world with the specified properties
 * @param x The box's x center position (in pixels)
 * @param y The box's y center position (in pixels)
 * @param w The box's width (in pixels)
 * @param h The box's height (in pixels)
 * @param static If the box should be static (true for dynamic)
 * @param fields An object containing fields for the box
 */
/**** {{{ createBox() ****/
Game.prototype.createBox = function(x, y, w, h, static, fields) {
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
		{x: x, y: y, w: w, h: h, static: static, fields: fields});

	return box;
} 
/**** }}} createBox() ****/
/**** }}} Game() ****/

/**** {{{ user-facing methods ****/
Game.prototype.addPlayer = function(id, x, y, name, color, image) {
	if (this.players.some(function(player) {return player.id == id})) {
		return -1
	} else {
		var player = new Player(id, x, y, name, color, image);
		this.players.push(player);
		player.block.SetUserData(player);
		player.block.SetSleepingAllowed(false);
		player.block.SetBullet(true);
		return player.id;
	}
}

Game.prototype.findPlayerById = function(id) {
	for (var i = 0; i < this.players.length; i ++) {
		if (this.players[i].id == id)
			return this.players[i]; 
	}
	return -1; 
}

Game.prototype.deletePlayer = function(id) {
	var index = this.findIndexById(id);
	var player = this.players[index];
	var block = player.block;
	this.world.DestroyBody(block);
	this.players.splice(index, 1);
}

Game.prototype.addUpdateCallback = function(callback) {
	this.updateCallbacks.push(callback);
}

Game.prototype.setSimulating = function(simulating) {
	this.simulating = simulating;
}

Game.prototype.setFPS = function(fps) {
	this.fps = fps;
	this.tickTime = 1 / this.fps;
	this.tickTimeMs = 1000 / this.fps;
}

/**** }}} user-facing methods ****/

/**** {{{ initialise and update ****/
// initialize the game world 
Game.prototype.init = function() {
	//Default world gravity
	this.gravity = new b2Vec2(0, gameplay.gravity);

	//Create the world
	this.world = new b2World(
		this.gravity //gravity
		, true  //allow sleep
	);
	this.world.gravity = this.gravity;

	var listener = new Box2D.Dynamics.b2ContactListener;
	listener.BeginContact = function(contact) {
		SolemnSky.evaluateContact(contact);
	};
	this.world.SetContactListener(listener);
}; // init()

// method that is called on every update
var last = Date.now();
Game.prototype.update = function() {
	var diff = Date.now() - last;
	last = Date.now();

	if (this.simulating) {
		this.players.forEach(
			function(player) {
				player.block.SetPosition(new b2Vec2(player.position.x / this.scale, player.position.y / this.scale))	
				player.block.SetLinearVelocity(new b2Vec2(player.velocity.x / this.scale, player.velocity.y / this.scale))
				player.block.SetAngle(player.rotation)
			} 
		, this)

		this.world.Step(
			diff / 1000   //time delta
		,   10       //velocity iterations
		,   10       //position iterations
		);
		this.world.ClearForces();

		for (var contact = this.world.GetContactList(); contact != null; contact = contact.GetNext()) {
			this.evaluateContact(contact);
		}

		this.players.forEach(function each(player) {
			player.update(this, diff);
		}, this);

		this.players.forEach(
			function(player) {
				var vel = player.block.GetLinearVelocity()
				player.velocity.x = vel.x * this.scale; 
				player.velocity.y = vel.y * this.scale;
				var pos = player.block.GetPosition()
				player.position.x = pos.x * this.scale; 
				player.position.y = pos.y * this.scale;
				player.rotation = player.block.GetAngle()
			}
			, this)

		this.updateCallbacks.forEach(function each(callback) {
			callback(diff);
		}, this);
	}
} // update()

/**** }}} initialise and update ****/

/**** {{{ contacts ****/ 

Game.prototype.evaluateContact = function(contact) {
	if (!contact.IsTouching()) {
		//Not touching
		return;
	}
	var bodyA = contact.GetFixtureA().GetBody();
	var bodyB = contact.GetFixtureB().GetBody();
	//Determine which is the player
	var player = bodyA;
	if (bodyA.GetUserData().static)
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
	player.GetUserData().onLoseHealth(loss);
}

/**** }}} contacts ****/

/**** {{{ snapshot ****/
function SnapshotPoint(id, movement, pos, vel, angle, angleVel) {
	this.id = id;
	this.movement =  movement ;
	this.pos = pos;
	this.vel = vel;
	this.angle = angle;
	this.angleVel = angleVel;
}

Game.prototype.applySnapshotPoint = function(snapshot) {
	var index = this.findIndexById(snapshot.id);
	if (index !== (-1)) {
		var posProps = 
			[snapshot.pos, snapshot.vel, snapshot.angle, snapshot.angleVel]
		if (snapshot.movement != null) {
			this.players[index].movement = snapshot.movement
		}
		if (posProps.every(function(x) {return x != null})) {
			this.players[index].block.SetPosition(
				new b2Vec.make(snapshot.pos.x, snapshot.pos.y))
			this.players[index].block.SetLinearVelocity(
				new b2Vec.make(snapshot.vel.x, snapshot.vel.y))
			this.players[index].block.SetAngle(
				new b2Vec.make(snapshot.angle.x, snapshot.angle.y))
			this.players[index].block.SetAngularVelocity(
				new b2Vec.make(snapshot.angleVel.x, snapshot.angleVel.y))
		}
	}
}

Game.prototype.applySnapshot = function(snapshot) {
	snapshot.forEach(function(i) {this.applySnapshotPoint(i)}, this)
}

Game.prototype.makeSnapshotPoint = function(id) {
	var player = this.players[this.findIndexById(id)]
	if (typeof player !== "undefined") {
		var velocity = player.block.GetLinearVelocity()
		var position = player.block.GetPosition();
		return new SnapshotPoint (id
			, player.movement
			, {x: position.x, y: position.y}
			, {x: velocity.x, y: velocity.y})
	} else { return null }
}

Game.prototype.makeSnapshot = function(ids) { 
	return ids.map(function(id) {
		return this.makeSnapshotPoint(id);
	}, this) 
}

Game.prototype.makeTotalSnapshot = function() {
	console.log("Players: " + this.players);
	return 
		this.players.map(function(player) {return this.makeSnapshotPoint(player.id)}, this)
}

Game.prototype.serialiseSnapshot = function(snapshot) {
	console.log("Serialize: " + snapshot);

	return JSON.stringify(snapshot);	
	// TODO: use glenn's utils to make this more efficent
	// in terms of space
}

Game.prototype.readSnapshot = function(str) {
	return JSON.parse(str);
}

// here 'emit' has the connotation of return something
// serialised, easily transmittable
// this functions returns a string
Game.prototype.emitTotalSnapshot = function() {
	var snap = this.makeTotalSnapshot();
	return this.serialiseSnapshot(typeof snap === "undefined" ? "{}" : snap);
}
/**** }}} snapshots ****/

/**** {{{ status ****/
Game.prototype.makeListing = function() {
	return this.player.map(
		function(player) {
			return { id: player.id, name: player.name
			, color: player.color, image: player.image}
		}
		, this)
}

Game.prototype.applyListing = function () {
	listing.forEach(
		function(entry) {
			this.addPlayer(
				entry.id, null, null, entry.name, entry.color, entry.image)	
		}
		, this)
}


Game.prototype.serialiseListing = function(listing) {
	return JSON.stringify(listing)
	// TODO: use glenn's utils to make this more efficent
	// in terms of space
}

Game.prototype.readListing = function(str) {
	return JSON.parse(str);
}

Game.prototype.emitListing = function() {
	return this.serialiseListing(this.makeListing())
}
/**** }}} listings ****/

/**** {{{ map ****/
Game.prototype.loadMap = function (map) {
	map.forEach(
		function(box) {
			var box = this.createBox(
				box.x, box.y, box.w, box.h, box.static, box.fields)		
			this.map.push(box);
		}, this)
}

var serialiseBlock = function(box) {
	return ';' + Utils.floatToChar(box.x)
		 + ',' + Utils.floatToChar(box.y)
		 + ',' + Utils.floatToChar(box.w)
		 + ',' + Utils.floatToChar(box.h)
		 + ',' + box.isStatic 
		 + ',' + JSON.stringify(box.fields).replace(/,/g, "\\:");
}

Game.prototype.serialiseMap = function(map) {
	var acc = function(acc, x) { return acc + x };
	return map.map(emitBox).reduce(acc, map.length)
}

Game.prototype.readMap = function(str) {
	var blobParts = data.split(";");
	var numBoxes = parseInt(blobParts[0]);
	var map = [];

	for (var i = 0; i < numBoxes; i ++) {
		var boxDetails = blobParts[i + 1].split(",");
		var boxX = Utils.charToFloat(boxDetails[0]);
		var boxY = Utils.charToFloat(boxDetails[1]);
		var boxW = Utils.charToFloat(boxDetails[2]);
		var boxH = Utils.charToFloat(boxDetails[3]);
		var boxStatic = boxDetails[4];
		var boxFields = JSON.parse(boxDetails[5].replace(/\\:/g, ","));

		var box = {x: boxX, y: boxY, w: boxW, h: boxH, isStatic: boxStatic, fields: boxFields};
		map.push(box);
	}
	return map;
}

Game.prototype.emitMap = function() {
	return this.serialiseMap(this.map)
}

/**** }}} listings ****/

if (typeof(module) !== "undefined") {
	module.exports.Game = Game;
}
