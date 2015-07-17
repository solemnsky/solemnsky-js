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

//Some global variables for the DOM
var canvas = document.getElementById("c");
var ctx = canvas.getContext("2d");

//List of boxes with which to initialize the world 
var boxes = [
	{x: canvas.width / 2, y: canvas.height, w: 600, h: 10, static: true, fields: {}},
	{x:  90, y:  30, w: 40, h: 40, static: true, fields: {restitution: 0.7}},
	{x: 130, y: 110, w: 40, h: 40, static: true, fields: {restitution: 0.7}},
	{x: 470, y: 230, w: 40, h: 40, static: true, fields: {restitution: 0.7}},
	{x: 210, y: 130, w: 40, h: 40, static: true, fields: {restitution: 0.7}},
	{x: 350, y:  30, w: 40, h: 40, static: true, fields: {restitution: 0.7}},
	{x: 390, y: 140, w: 40, h: 40, static: true, fields: {restitution: 0.7}},
	{x: 430, y: 270, w: 40, h: 40, static: true, fields: {restitution: 0.7}},
	{x: 570, y: 300, w: 40, h: 40, static: true, fields: {restitution: 0.7}}
];

//http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame   || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame    || 
		window.oRequestAnimationFrame      || 
		window.msRequestAnimationFrame     || 
		function(callback, /* DOMElement */ element){
			window.setTimeout(callback, 1000 / 60);
		};
})();

//The game world
var world;
//Current list of projectiles shot from the box
var projectiles = [];
var blocks = [];

//Current high score
var hiscore = 0;

//Movement keys, if they're held down
var movement = {
	forward: false,
	backward: false,
	up: false,
	down: false
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

	//Create all the boxes from the list above
	for (var i = 0; i < boxes.length; i ++) {
		blocks.push(createBox(boxes[i].x, boxes[i].y, boxes[i].w, boxes[i].h, boxes[i].static, boxes[i].fields));
	}

	var listener = new Box2D.Dynamics.b2ContactListener;
	listener.BeginContact = function(contact) {
		var bodyA = contact.GetFixtureA().GetBody();
		var bodyB = contact.GetFixtureB().GetBody();

		//TODO: Something with contacts	
	};
	world.SetContactListener(listener);
}; // init()

/**
 * Method that is called on every update 
 */
function update() {
	world.Step(
		1 / 60   //frame-rate
	,	10       //velocity iterations
	,	10       //position iterations
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
		//Below the bottom of the screen? Delete it
		if (projectiles[i].GetPosition().y * world.scale > canvas.height) {
			world.DestroyBody(projectiles[i]);
			projectiles.splice(i, 1);
			continue;
		}
		//Off the side of the screen? Delete it
		if (projectiles[i].GetPosition().x * world.scale > canvas.width) {
			world.DestroyBody(projectiles[i]);
			projectiles.splice(i, 1);
			continue;
		}
		//Off the side of the screen? Delete it
		if (projectiles[i].GetPosition().x * world.scale < 0) {
			world.DestroyBody(projectiles[i]);
			projectiles.splice(i, 1);
			continue;
		}
		//Off the top of the screen? Don't delete it
		if (projectiles[i].GetPosition().y * world.scale < 0) {
			//Don't let us get points though
			continue;
		}
		//Points!
		score ++;
	}

	//If this is our new high score, set it
	if (score > hiscore)
		hiscore = score;

	//Let us know about our high score
	document.getElementById("bodycount").innerHTML = world.GetBodyCount() + " bodies";
	document.getElementById("score").innerHTML = "Score: " + score + " High Score: " + hiscore;

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

function renderBox(body, width, height) {
	//Reset the transform of the context
	ctx.resetTransform();

	//Box position
	var playerX = body.GetPosition().x * world.scale;
	var playerY = body.GetPosition().y * world.scale;

	//Transform the context to render this in position
	ctx.translate(playerX, playerY);
	ctx.rotate(body.GetAngle());
	
	//TODO: Use the shape's path
	ctx.fillRect(-width / 2, -height / 2, width, height);
	ctx.strokeRect(-width / 2, -height / 2, width, height);
}

function render() {
	//Clear the display before rendering
	ctx.resetTransform();
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = "#bbffbb";
	ctx.strokeStyle = "#77ff77";

	//Render player
	renderBox(world.block, 30, 30);

	ctx.fillStyle = "#bbbbbb";
	ctx.strokeStyle = "#777777";

	//Render all the blocks
	for (var i = blocks.length - 1; i >= 0; i--) {
		renderBox(blocks[i], boxes[i].w, boxes[i].h);
	}

	ctx.fillStyle = "#ffbbbb";
	ctx.strokeStyle = "#ff7777";

	for (var i = projectiles.length - 1; i >= 0; i--) {
		renderBox(projectiles[i], 10, 10);
	}
} // render()

//Start up the game
init();
requestAnimFrame(update);

//Keyboard keys, just set movement variables
Mousetrap.bind('up',    function() { movement.forward  =  true; }, 'keydown');
Mousetrap.bind('up',    function() { movement.forward  = false; }, 'keyup');
Mousetrap.bind('down',  function() { movement.backward =  true; }, 'keydown');
Mousetrap.bind('down',  function() { movement.backward = false; }, 'keyup');
Mousetrap.bind('left',  function() { movement.left     =  true; }, 'keydown');
Mousetrap.bind('left',  function() { movement.left     = false; }, 'keyup');
Mousetrap.bind('right', function() { movement.right    =  true; }, 'keydown');
Mousetrap.bind('right', function() { movement.right    = false; }, 'keyup');
