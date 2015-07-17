function Game() {
    world = null;
    players = [];
};

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

var lastId = 0;

var fps = 60.0;
var tickTime = 1 / fps;

function Player(x, y, name, color, image) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.name = name;
    this.color = color;
    this.image = image;
    this.id = lastId ++;
    
    this.movement = {
        forward: false,
        backward: false,
        left: false,
        right: false
    };
}

function addPlayer(x, y, name, color, image) {
    var player = new Player(x, y, name, color, image);
    players.push(player);
    return player.id;
}

function findPlayerById(id) {
    for (var i = 0; i < players.length; i ++) {
        if (players[i].id == id)
            return i;
    }
    return -1; //Blow up here
}

function deletePlayer(id) {
    var player = players[id];
    players.splice(players.indexOf(id), 1);
}

function updatePlayer(id) {
    //TODO
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
function createBox(x, y, w, h, static, fields) {
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
function init() {
    //Default world gravity
    gravity = new b2Vec2(0, 10);

    //Create the world
    world = new b2World(
        gravity //gravity
        , true  //allow sleep
    );
    world.gravity = gravity;
    
    //Meters -> Pixels scale
    world.scale = 30;

    //Create the player (who is a block)
    world.block = createBox(canvas.width / 2, canvas.height / 2, 30, 30, false, {});
    //Don't sleep the player so we can move it all the time
    world.block.SetSleepingAllowed(false);

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
}; // init()

/**
 * Method that is called on every update 
 */
function update() {
    world.Step(
        1 / 60   //frame-rate
    ,   10       //velocity iterations
    ,   10       //position iterations
    );
    world.DrawDebugData();
    world.ClearForces();

    requestAnimFrame(update);

    render();

    //What position is our player at? Use this for the new projectiles
    var blockPos = new b2Vec2(world.block.GetPosition().x, world.block.GetPosition().y);
    blockPos.Multiply(world.scale);

    //Modify your velocity to fly around in midair
    var linearVelocity = world.block.GetLinearVelocity();
    if (movement.forward) {
        //Move our player
        linearVelocity.Add(b2Vec2.Make(0, -10.0 / world.scale));
        //Create a new box from our player
        var box = createBox(blockPos.x, blockPos.y + 10, 10, 10, false, {});
        //Add it to the list of projectiles
        projectiles.push(box);
        //Shoot it out from us
        box.SetLinearVelocity(new b2Vec2(0, 1000 / world.scale));
    }
    if (movement.backward) {
        //Move our player
        linearVelocity.Add(b2Vec2.Make(0, 10.0 / world.scale));
        //Create a new box from our player
        var box = createBox(blockPos.x, blockPos.y - 10, 10, 10, false, {});
        //Add it to the list of projectiles
        projectiles.push(box);
        //Shoot it out from us
        box.SetLinearVelocity(new b2Vec2(0, -1000 / world.scale));
    }
    if (movement.left) {
        //Move our player
        linearVelocity.Add(b2Vec2.Make(-10.0 / world.scale, 0));
        //Create a new box from our player
        var box = createBox(blockPos.x + 10, blockPos.y, 10, 10, false, {});
        //Add it to the list of projectiles
        projectiles.push(box);
        //Shoot it out from us
        box.SetLinearVelocity(new b2Vec2(1000 / world.scale, 0));
    }
    if (movement.right) {
        //Move our player
        linearVelocity.Add(b2Vec2.Make(10.0 / world.scale, 0));
        //Create a new box from our player
        var box = createBox(blockPos.x - 10, blockPos.y, 10, 10, false, {});
        //Add it to the list of projectiles
        projectiles.push(box);
        //Shoot it out from us
        box.SetLinearVelocity(new b2Vec2(-1000 / world.scale, 0));
    }
    world.block.SetLinearVelocity(linearVelocity);

    //Count score while garbage collecting
    var score = 0;
    //Garbage collector (backwards because faster and we can mutate it)
    for (var i = projectiles.length - 1; i >= 0; i--) {
        var projectile = projectiles[i];
        //Below the bottom of the screen? Delete it
        if (projectile.GetPosition().y * world.scale > canvas.height) {
            world.DestroyBody(projectile);
            projectiles.splice(i, 1);
            continue;
        }
        //Off the side of the screen? Delete it
        if (projectile.GetPosition().x * world.scale > canvas.width) {
            world.DestroyBody(projectile);
            projectiles.splice(i, 1);
            continue;
        }
        //Off the side of the screen? Delete it
        if (projectile.GetPosition().x * world.scale < 0) {
            world.DestroyBody(projectile);
            projectiles.splice(i, 1);
            continue;
        }
        //Off the top of the screen? Don't delete it
        if (projectile.GetPosition().y * world.scale < 0) {
            //Don't let us get points though
            continue;
        }
        //Points!
        score ++;
    }

    for (var i = blocks.length - 1; i >= 0; i--) {
        var box = blocks[i];
        if (box.life <= 0) {
            world.DestroyBody(box);
            blocks.splice(i, 1);
        }
    }
    
    //If we've fallen off the bottom of the screen
    if (world.block.GetPosition().y * world.scale > canvas.height) {
        //You lose!
        while (projectiles.length) {
            world.DestroyBody(projectiles.pop());
        }
        //Reset our position back to the center
        world.block.SetPosition(new b2Vec2(canvas.width / 2 / world.scale, canvas.height / 2 / world.scale));
        world.block.SetLinearVelocity(new b2Vec2(0, 0));
    }
}; // update()

if (typeof(module) !== "undefined")
    module.exports = Game;