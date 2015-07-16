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

function createBox(x, y, w, h) {
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;
 
	var bodyDef = new b2BodyDef;

	//create ground
	bodyDef.type = b2Body.b2_staticBody;
	 
	// positions the center of the object (not upper left!)
	bodyDef.position.x = x / world.scale;
	bodyDef.position.y = y / world.scale;
	 
	fixDef.shape = new b2PolygonShape;
	 
	// half width, half height. eg actual height here is 1 unit
	fixDef.shape.SetAsBox(w / world.scale, h / world.scale);
	box = world.CreateBody(bodyDef);
	box.CreateFixture(fixDef);
	return box;
}

function init() {
	world = new b2World(
		new b2Vec2(0, 10)    //gravity
		, true               //allow sleep
	);
	 
	world.scale = 30;
 
	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;
 
	var bodyDef = new b2BodyDef;

	//create some objects
	bodyDef.type = b2Body.b2_dynamicBody;
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(
			20 / world.scale
		,	10 / world.scale
	);

	bodyDef.position.x = canvas.width / 2 / world.scale;
	bodyDef.position.y = canvas.height / 2 / world.scale;
	world.block = world.CreateBody(bodyDef);
	world.block.CreateFixture(fixDef);
	world.block.SetSleepingAllowed(false);

	createBox(canvas.width / 2, canvas.height, 300, 5);
 
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

	var linearVelocity = world.block.GetLinearVelocity();
	if (movement.forward) {
		linearVelocity.Add(b2Vec2.Make(0, -10.0 / world.scale));
	}
	if (movement.forward) {
		linearVelocity.Add(b2Vec2.Make(0, 10.0 / world.scale));
	}
	if (movement.left) {
		linearVelocity.Add(b2Vec2.Make(-10.0 / world.scale, 0));
	}
	if (movement.right) {
		linearVelocity.Add(b2Vec2.Make(10.0 / world.scale, 0));
	}
	world.block.SetLinearVelocity(linearVelocity);
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

