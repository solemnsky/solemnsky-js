var 	 b2Vec2          = Box2D.Common.Math.b2Vec2
	, b2BodyDef      = Box2D.Dynamics.b2BodyDef
	, b2Body         = Box2D.Dynamics.b2Body
	, b2FixtureDef   = Box2D.Dynamics.b2FixtureDef
	, b2Fixture      = Box2D.Dynamics.b2Fixture
	, b2World        = Box2D.Dynamics.b2World
	, b2MassData     = Box2D.Collision.Shapes.b2MassData
	, b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
	, b2CircleShape  = Box2D.Collision.Shapes.b2CircleShape
	, b2DebugDraw    = Box2D.Dynamics.b2DebugDraw;
 
var boxes = [
	{x: 90,  y: 30, w: 40, h: 40, static: false, fields: {restitution: 0.7}},
	{x: 130, y: 30, w: 40, h: 40, static: false, fields: {restitution: 0.7}},
	{x: 170, y: 30, w: 40, h: 40, static: false, fields: {restitution: 0.7}},
	{x: 210, y: 30, w: 40, h: 40, static: false, fields: {restitution: 0.7}},
	{x: 250, y: 30, w: 40, h: 40, static: false, fields: {restitution: 0.7}},
	{x: 290, y: 30, w: 40, h: 40, static: false, fields: {restitution: 0.7}},
	{x: 330, y: 30, w: 40, h: 40, static: false, fields: {restitution: 0.7}},
	{x: 370, y: 30, w: 40, h: 40, static: false, fields: {restitution: 0.7}}
];

//http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame    || 
		window.oRequestAnimationFrame      || 
		window.msRequestAnimationFrame     || 
		function(callback, /* DOMElement */ element){
			window.setTimeout(callback, 1000 / 60);
		};
})();

var canvas = document.getElementById("c");
var ctx = canvas.getContext("2d");

var world;
var movement = {
	forward: false,
	backward: false,
	up: false,
	down: false
};
var projectiles = [];

function createBox(x, y, w, h, static, fields) {
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.6;

	if (typeof fields.density !== "undefined") fixDef.density = fields.density;
	if (typeof fields.friction !== "undefined") fixDef.friction = fields.friction;
	if (typeof fields.restitution !== "undefined") fixDef.restitution = fields.restitution;
 
	var bodyDef = new b2BodyDef;

	//create ground
	bodyDef.type = (static ? b2Body.b2_staticBody : b2Body.b2_dynamicBody);
	 
	// positions the center of the object (not upper left!)
	bodyDef.position.x = x / world.scale;
	bodyDef.position.y = y / world.scale;
	 
	fixDef.shape = new b2PolygonShape;
	 
	// half width, half height. eg actual height here is 1 unit
	fixDef.shape.SetAsBox(w / 2 / world.scale, h / 2 / world.scale);
	box = world.CreateBody(bodyDef);
	box.CreateFixture(fixDef);
	return box;
}

function init() {
	gravity = new b2Vec2(0, 10);
	world = new b2World(
		gravity //gravity
		, true  //allow sleep
	);
	world.gravity = gravity;
	 
	world.scale = 30;

	world.block = createBox(canvas.width / 2, canvas.height / 2, 30, 30, false, {});
	world.block.SetSleepingAllowed(false);

	for (var i = 0; i < boxes.length; i ++) {
		createBox(boxes[i].x, boxes[i].y, boxes[i].w, boxes[i].h, boxes[i].static, boxes[i].fields);
	}

	// world.hitme.SetGravityScale(0);

	createBox(canvas.width / 2, canvas.height, 600, 10, true, {});
 
	//setup debug draw
	var debugDraw = new b2DebugDraw();
	debugDraw.SetSprite(document.getElementById("c").getContext("2d"));
	debugDraw.SetDrawScale(world.scale);
	debugDraw.SetFillAlpha(0.3);
	debugDraw.SetLineThickness(1.0);
	debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
	world.SetDebugDraw(debugDraw);
}; // init()

function update() {
	world.Step(
		1 / 60   //frame-rate
	,	10       //velocity iterations
	,	10       //position iterations
	);
	world.DrawDebugData();
	world.ClearForces();
 
	requestAnimFrame(update);

	var blockPos = new b2Vec2(world.block.GetPosition().x, world.block.GetPosition().y);
	blockPos.Multiply(world.scale);

	var linearVelocity = world.block.GetLinearVelocity();
	if (movement.forward) {
		linearVelocity.Add(b2Vec2.Make(0, -10.0 / world.scale));
		var box = createBox(blockPos.x, blockPos.y + 10, 10, 10, false, {});
		projectiles.push(box);
		box.SetLinearVelocity(new b2Vec2(0, 1000 / world.scale));
	}
	if (movement.backward) {
		linearVelocity.Add(b2Vec2.Make(0, 10.0 / world.scale));
		var box = createBox(blockPos.x, blockPos.y - 10, 10, 10, false, {});
		projectiles.push(box);
		box.SetLinearVelocity(new b2Vec2(0, -1000 / world.scale));
	}
	if (movement.left) {
		linearVelocity.Add(b2Vec2.Make(-10.0 / world.scale, 0));
		var box = createBox(blockPos.x + 10, blockPos.y, 10, 10, false, {});
		projectiles.push(box);
		box.SetLinearVelocity(new b2Vec2(1000 / world.scale, 0));
	}
	if (movement.right) {
		linearVelocity.Add(b2Vec2.Make(10.0 / world.scale, 0));
		var box = createBox(blockPos.x - 10, blockPos.y, 10, 10, false, {});
		projectiles.push(box);
		box.SetLinearVelocity(new b2Vec2(-1000 / world.scale, 0));
	}
	world.block.SetLinearVelocity(linearVelocity);

	for (var i = projectiles.length - 1; i >= 0; i--) {
		if (projectiles[i].GetPosition().y * world.scale > canvas.height) {
			world.DestroyBody(projectiles[i]);
		}
	};
}; // update()

init();
requestAnimFrame(update);

Mousetrap.bind('up',    function() { movement.forward  =  true; }, 'keydown');
Mousetrap.bind('up',    function() { movement.forward  = false; }, 'keyup');
Mousetrap.bind('down',  function() { movement.backward =  true; }, 'keydown');
Mousetrap.bind('down',  function() { movement.backward = false; }, 'keyup');
Mousetrap.bind('left',  function() { movement.left     =  true; }, 'keydown');
Mousetrap.bind('left',  function() { movement.left     = false; }, 'keyup');
Mousetrap.bind('right', function() { movement.right    =  true; }, 'keydown');
Mousetrap.bind('right', function() { movement.right    = false; }, 'keyup');
Mousetrap.bind('space', function() {
});
