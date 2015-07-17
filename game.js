function Game() {
    world = null;
    players = [];
    updateCallbacks = [];
    this.fps = 60.0;
    this.tickTime = 1 / this.fps;
    this.tickTimeMs = 1000 / this.fps;
};

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
    players.push(player);
    player.block.SetSleepingAllowed(false);
    return player.id;
}

Game.prototype.findPlayerById = function(id) {
    for (var i = 0; i < players.length; i ++) {
        if (players[i].id == id)
            return i;
    }
    return -1; //Blow up here
}

Game.prototype.deletePlayer = function(id) {
    var player = players[id];
    players.splice(players.indexOf(id), 1);
}

Game.prototype.updatePlayer = function(id) {
    //TODO
}

Game.prototype.addUpdateCallback = function(callback) {
    updateCallbacks.push(callback);
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
    bodyDef.position.x = x / world.scale;
    bodyDef.position.y = y / world.scale;
    
    fixDef.shape = new b2PolygonShape;
    
    // half width, half height. eg actual height here is 1 unit
    fixDef.shape.SetAsBox(w / 2 / world.scale, h / 2 / world.scale);
    box = world.CreateBody(bodyDef);
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
    gravity = new b2Vec2(0, 0);

    //Create the world
    world = new b2World(
        gravity //gravity
        , true  //allow sleep
    );
    world.gravity = gravity;
    
    //Meters -> Pixels scale
    world.scale = 30;

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
    world.SetContactListener(listener);

    SolemnSky.createBox(windowSize.width / 2, windowSize.height, 600, 30, true, {});

}; // init()

/**
 * Method that is called on every update 
 */
Game.prototype.update = function() {
    world.Step(
        1 / 10   //frame-rate
    ,   10       //velocity iterations
    ,   10       //position iterations
    );
    players.forEach(function each(player) {
        player.update();
    });
    updateCallbacks.forEach(function each(callback) {
        callback();
    });
    world.ClearForces();
}; // update()

Player.prototype.update = function() {
    //What position is our player at? Use this for the new projectiles
    var blockPos = new b2Vec2(this.block.GetPosition().x, this.block.GetPosition().y);
    blockPos.Multiply(world.scale);

    //Modify your velocity to fly around in midair
    var linearVelocity = this.block.GetLinearVelocity();
    if (this.movement.forward) {
        //Move our player
        linearVelocity.Add(b2Vec2.Make(0, -10.0 / world.scale));
    }
    if (this.movement.backward) {
        //Move our player
        linearVelocity.Add(b2Vec2.Make(0, 10.0 / world.scale));
    }
    if (this.movement.left) {
        //Move our player
        linearVelocity.Add(b2Vec2.Make(-10.0 / world.scale, 0));
    }
    if (this.movement.right) {
        //Move our player
        linearVelocity.Add(b2Vec2.Make(10.0 / world.scale, 0));
    }
    this.block.SetLinearVelocity(linearVelocity);
}

if (typeof(module) !== "undefined")
    module.exports = Game;