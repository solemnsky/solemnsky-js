function Game() {
	this.world = null;
	this.players = [];
	this.boxes = [];
	this.updateCallbacks = [];
	this.fps = 60.0;
	this.tickTime = 1 / this.fps;
	this.tickTimeMs = 1000 / this.fps;
	this.scale = 30;
	this.simulating = true;
};

/**** {{{ snapshots ****/
// a modification of a single player's dynamic state (pos, vel)
// if any of the parameters is null, that parameter
// will not influence the target player's state
function SnapshotPoint(id, movement, vel) {
	this.id = id; this.movement =  movement 
	this.pos = null;
		if (pos != null) 
			{ this.pos = 
					new b2Vec2.make(vel.x, vel.y)}
}

Game.prototype.applySnapshotPoint = function(snapshot) {
	if (snapshot.movement	!= null) {
		this.players[id].movement = snapshot.movement
	}
	if (snapshot.pos != null) {
		this.players[id].block.SetPosition(snapshot.vel)
	}
}

Game.prototype.applySnapshot = function(snapshot) {
	snapshot.forEach(function(i) {this.applySnapshotPoint(i)}, this)
}

// makes a snapshot concerning one player
Game.prototype.makeSnapshotPoint = function(id) {
	var player = this.findPlayerByID(id)
	var velocity = player.block.GetLinearVelocity
 	return SnapshotPoint (id
		, movement = player.movement
		, vel = {x: velocity.x, y: velocity.y})
}

// makes a snapshot concerning an array of players
Game.prototype.makeSnapshot = function(ids) { 
	return ids.map(function(id) {
		return this.makeSnapshotPoint(id);
	}, this) 
}

function serialiseSnapshot(snapshot) {
	JSON.stringify(snapshot);	
}

function readSnapshot(str) {
	JSON.parse(str);
}
/**** }}} snapshots ****/

if (typeof(windowSize) === "undefined") {
	//Server, we need to init this stuff
	windowSize = function() {
		width = 640;
		height = 480;
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

Game.prototype.addPlayer = function(id, x, y, name, color, image) {
	var player = new Player(id, x, y, name, color, image);
	this.players.push(player);
	player.block.SetSleepingAllowed(false);
	return player.id;
}

Game.prototype.findPlayerById = function(id) {
	for (var i = 0; i < this.players.length; i ++) {
		if (this.players[i].id == id)
			return i;
	}
	return -1; //Blow up here
}

Game.prototype.deletePlayer = function(id) {
	var index = this.findPlayerById(id);
	var player = this.players[index];
	var block = player.block;
	this.world.DestroyBody(block);
	this.players.splice(index, 1);
}

Game.prototype.updatePlayer = function(id) {
	//TODO
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

	return box;
} // createBox()


/**
 * Initialize the game world 
 */
Game.prototype.init = function() {
	//Default world gravity
	this.gravity = new b2Vec2(0, 0);

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

/**
 * Method that is called on every update 
 */
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

		var game = this;
		this.players.forEach(function each(player) {
			player.update(game, diff);
		});
	}
	this.updateCallbacks.forEach(function each(callback) {
		callback(diff);
	});
}; // update()

Player.prototype.update = function(game, delta) {
	//What position is our player at? Use this for the new projectiles
	// var blockPos = new b2Vec2(this.block.GetPosition().x, this.block.GetPosition().y);
	// blockPos.Multiply(this.scale);

	var speed = 10 * (delta / 1000) * game.scale; //20 u/sec

	//Modify your velocity to fly around in midair
	var linearVelocity = this.block.GetLinearVelocity();
	if (this.movement.forward) {
		//Move our player
		linearVelocity.Add(b2Vec2.Make(0, -speed / game.scale));
	}
	if (this.movement.backward) {
		//Move our player
		linearVelocity.Add(b2Vec2.Make(0, speed / game.scale));
	}
	if (this.movement.left) {
		//Move our player
		linearVelocity.Add(b2Vec2.Make(-speed / game.scale, 0));
	}
	if (this.movement.right) {
		//Move our player
		linearVelocity.Add(b2Vec2.Make(speed / game.scale, 0));
	}
	this.block.SetLinearVelocity(linearVelocity);
}

if (typeof(module) !== "undefined")
	module.exports = Game;
