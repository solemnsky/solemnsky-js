/**** {{{ helpful values****/
if (typeof(windowSize) === "undefined") {
	//Server, we need to init this stuff
	windowSize = {
		width: 1440,
		height: 778
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
	this.world = null;
	this.players = [];
	this.boxes = [];
	this.updateCallbacks = [];
	this.projectiles = [];
	this.fps = 60.0;
	this.tickTime = 1 / this.fps;
	this.tickTimeMs = 1000 / this.fps;
	this.scale = 30;
	this.simulating = true;
};
/**** }}} Game() ****/

/**** {{{ Player() ****/
function Player(id, x, y, name, color, image) {
	this.name = name;
	this.color = color;
	this.image = image;
	this.id = id;
	
	this.movement = {
		forward: false,
		backward: false,
		left: false,
		right: false
	};

	this.block = SolemnSky.createBox(x, y, 30, 30, false, {});
}
/**** }}} Player() ****/

/**** {{{ snapshots ****/
/* 
	a snapshot represents a sort of delta in the dynamic part
	of the game state; a player, alone, might send snapshots of
	itself to the server where they are simply merged, but in an 
	engagement, where one player kills another player, perhaps the
	snapshot from the killer that said his shot hit could override
	the snapshot from the victim who thought the shot had missed
	(these sort of decisions are inevitable if we don't want to 
	go back to the 'mile long keyboard')
*/
// a modification of a single player's state
// if movement is left null, movement is not influenced
// if another parameter is left null (pos, vel, angle, or angleVel), 
// none of those parameters are set
function SnapshotPoint(id, movement, pos, vel, angle, angleVel) {
	this.id = id;
	this.movement =  movement ;
	this.pos = pos;
	this.vel = vel;
	this.angle = angle;
	this.angleVel = angleVel;
}

// applies a snapshot point 
Game.prototype.applySnapshotPoint = function(snapshot) {
	var index = this.findIndexById(snapshot.id);
	var id = snapshot.id;
	var posProps = 
		[snapshot.pos, snapshot.vel, snapshot.angle, snapshot.angleVel]
	if (snapshot.movement != null) {
		this.players[index].movement = snapshot.movement
	}
	if (posProps.every(x => x != null)) {
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

// applies a snapshot, an array of snapshot points, possibly
// effecting multiple players
Game.prototype.applySnapshot = function(snapshot, id) {
	snapshot.forEach(function(i) {this.applySnapshotPoint(snapshot)}, this)
}

// makes a snapshot concerning one player
Game.prototype.makeSnapshotPoint = function(id) {
	var player = this.players[this.findIndexById(id)]
	var velocity = player.block.GetLinearVelocity()
	var position = player.block.GetPosition();
 	return new SnapshotPoint (id
		, player.movement
 		, {x: position.x, y: position.y}
		, {x: velocity.x, y: velocity.y})
}

// makes a snapshot concerning an array of player ids
Game.prototype.makeSnapshot = function(ids) { 
	return ids.map(function(id) {
		return this.makeSnapshotPoint(id);
	}, this) 
}

function serialiseSnapshot(snapshot) {
	return JSON.stringify(snapshot);	
}

function readSnapshot(str) {
	return JSON.parse(str);
}
/**** }}} snapshots ****/

/**** {{{ static prototype methods ****/
Game.prototype.addPlayer = function(id, x, y, name, color, image) {
	var player = new Player(id, x, y, name, color, image);
	this.players.push(player);
	player.block.SetSleepingAllowed(false);
	return player.id;
}

Game.prototype.findIndexById = function(id) {
	for (var i = 0; i < this.players.length; i ++) {
		if (this.players[i].id == id)
			return i; // why not just return the player?
	}
	return -1; //Blow up here
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

/**
 * Create a box in the world with the specified properties
 * @param x The box's x center position (in pixels)
 * @param y The box's y center position (in pixels)
 * @param w The box's width (in pixels)
 * @param h The box's height (in pixels)
 * @param static If the box should be static (true for dynamic)
 * @param fields An object containing fields for the box
 */
Game.prototype.createBox = function(x, y, w, h, static, fields) {
	//Create a fixture definition for the box
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.6;

	//Read from the fields, if they exist
	if (typeof fields !== "undefined") {
		if (typeof fields.density !== "undefined") fixDef.density = fields.density;
		if (typeof fields.friction !== "undefined") fixDef.friction = fields.friction;
		if (typeof fields.restitution !== "undefined") fixDef.restitution = fields.restitution;
	}

	//Create the body definition
	var bodyDef = new b2BodyDef;

	//Box type defined by the caller
	bodyDef.type = (static ? b2Body.b2_staticBody : b2Body.b2_dynamicBody);
	
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

	box.SetUserData({x: x, y: y, w: w, h: h, static: static, fields: fields});

	return box;
} 
/**** }}} Game.prototype, static methods ****/

/**** {{{ prototype methods for initialising and simulating ****/
// initialize the game world 
Game.prototype.init = function() {
	//Default world gravity
	this.gravity = new b2Vec2(0, 10);

	//Create the world
	this.world = new b2World(
		this.gravity //gravity
		, true  //allow sleep
	);
	this.world.gravity = this.gravity;

	var listener = new Box2D.Dynamics.b2ContactListener;
	listener.BeginContact = function(contact) {
		var bodyA = contact.GetFixtureA().GetBody();
		var bodyB = contact.GetFixtureB().GetBody();

		if (typeof bodyA.life !== "undefined") {
			bodyA.life --;
		}
		if (typeof bodyB.life !== "undefined") {
			bodyB.life --;
		}
	};
	this.world.SetContactListener(listener);
}; // init()

// method that is called on every update
var last = Date.now();
Game.prototype.update = function() {
	var diff = Date.now() - last;
	last = Date.now();
	if (this.simulating) {
		this.world.Step(
			this.tickTime   //frame-rate
		,   10       //velocity iterations
		,   10       //position iterations
		);
		this.world.ClearForces();

		this.players.forEach(function each(player) {
			player.update(this, diff);
		}, this);

/* 
		for (var i = this.projectiles.length - 1; i >= 0; i--) {
			if (this.projectiles[i].GetPosition().y * this.scale > windowSize.height ||
				this.projectiles[i].GetPosition().x * this.scale > windowSize.width ||
				this.projectiles[i].GetPosition().x < 0 ||
				(Date.now() - this.projectiles[i].GetUserData().creationDate) > 1000) {
				this.world.DestroyBody(this.projectiles[i]);
				this.projectiles.splice(i, 1);
			}
		}
	*/ // commented out for simplicity for now
	}
	this.updateCallbacks.forEach(function each(callback) {
		callback(diff);
	}, this);
}; // update()

Player.prototype.update = function(game, delta) {
	//What position is our player at? Use this for the new projectiles
	var blockPos = new
		b2Vec2(this.block.GetPosition().x, this.block.GetPosition().y);
	blockPos.Multiply(game.scale);

	var speed = 10 * (delta / 1000) * game.scale; //20 u/sec

	//Modify your velocity to fly around in midair
	var linearVelocity = this.block.GetLinearVelocity();
	if (this.movement.forward) {
		//Move our player
		linearVelocity.Add(b2Vec2.Make(0, 2 * -speed / game.scale));
		//Make a projectile
		var box = game.createBox(blockPos.x, blockPos.y + 30, 10, 10, false, {});
		box.SetLinearVelocity(new b2Vec2(0, 1000 / game.scale));
	}
	if (this.movement.backward) {
		//Move our player
		linearVelocity.Add(b2Vec2.Make(0, speed / game.scale));
		//Make a projectile
		var box = game.createBox(blockPos.x, blockPos.y - 30, 10, 10, false, {});
		box.SetLinearVelocity(new b2Vec2(0, -1000 / game.scale));
	}
	if (this.movement.left) {
		//Move our player
		linearVelocity.Add(b2Vec2.Make(-speed / game.scale, 0));
		//Make a projectile
		var box = game.createBox(blockPos.x + 30, blockPos.y, 10, 10, false, {});
		box.SetLinearVelocity(new b2Vec2(1000 / game.scale, 0));
	}
	if (this.movement.right) {
		//Move our player
		linearVelocity.Add(b2Vec2.Make(speed / game.scale, 0));
		//Make a projectile
		var box = game.createBox(blockPos.x - 30, blockPos.y, 10, 10, false, {});
		box.SetLinearVelocity(new b2Vec2(-1000 / game.scale, 0));
	}
	//Shoot the projectile we made
	/*
	box.GetUserData().creationDate = Date.now();
	game.projectiles.push(box);
	*/ // commented out for simplicity for now

	this.block.SetLinearVelocity(linearVelocity);
}
/**** }}} prototype methods for initialising and simulation ****/

if (typeof(module) !== "undefined") {
	module.exports.Game = Game;
	module.exports.readSnapshot = readSnapshot;
	module.exports.serialiseSnapshot = serialiseSnapshot;
}
