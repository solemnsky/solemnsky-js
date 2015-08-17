/*                  ******** vanilla/player.js ********            //
\\ Player object, with box2d interface and gameplay mechanics.     \\
//                  ******** vanilla/player.js ********            */

module.exports = Player

var util = require('../../resources/util.js')
var gameplay = require('./gameplay.js')
var Box2D = require('../../../assets/box2d.min.js')

/**** {{{ box2d synonyms ****/
var b2Vec2         = Box2D.Common.Math.b2Vec2
// var b2BodyDef      = Box2D.Dynamics.b2BodyDef
// var b2Body         = Box2D.Dynamics.b2Body
// var b2FixtureDef   = Box2D.Dynamics.b2FixtureDef
// var b2Fixture      = Box2D.Dynamics.b2Fixture
// var b2World        = Box2D.Dynamics.b2World
// var b2MassData     = Box2D.Collision.Shapes.b2MassData
// var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
// var b2CircleShape  = Box2D.Collision.Shapes.b2CircleShape
// var b2DebugDraw    = Box2D.Dynamics.b2DebugDraw;
/**** }}} box2d synonyms ****/

/**** {{{ Player() ****/
function Player(game, id, pos, name) {
	this.game = game;

	this.name = name;
	this.id = id;
	
	// client accessible
	this.movement = {
		forward: false,
		backward: false,
		left: false,
		right: false
	};

	// read-only for clients
	// basic physical values
	this.position = pos
	this.velocity = {x: 0, y: 0}
	this.rotation = 0;
	this.rotationVel = 0;

	// flight mechanics
	this.stalled = false;
	this.leftoverVel = {x: 0, y: 0}
	this.speed = 1
	this.throttle = 1
	this.afterburner = false;

	// game mechanics
	this.health = 1;
	this.energy = 1;
	
	// spawn mechanics
	this.spawnpoint = pos
	this.respawning = false;

	// this value should *never* be accessed; instead, access
	// the position, velocity, rotation, and rotationVel values above
	this.block = 
		this.game.createBody(
			this.position
			, this.game.createShape("triangle", 
					{width: gameplay.playerWidth, height: gameplay.playerHeight}
				)
			, {isStatic: false, doesCollide: true, bodyType: "player", bodyId: id} 
		)
}
/**** }}} Player() ****/

/**** {{{ box2d interface ****/
Player.prototype.writeToBlock = function() {
	this.block.SetPosition(new b2Vec2(
		  this.position.x / gameplay.physicsScale
		, this.position.y / gameplay.physicsScale))	
	this.block.SetLinearVelocity(new b2Vec2(
		  this.velocity.x / gameplay.physicsScale
		, this.velocity.y / gameplay.physicsScale))
	this.block.SetAngle(this.rotation)
	this.block.SetAngularVelocity(this.rotationVel)
}

Player.prototype.readFromBlock = function() {
	var vel = this.block.GetLinearVelocity()
	var pos = this.block.GetPosition()

	this.velocity.x = vel.x * gameplay.physicsScale; 
	this.velocity.y = vel.y * gameplay.physicsScale;
	this.position.x = pos.x * gameplay.physicsScale; 
	this.position.y = pos.y * gameplay.physicsScale;
	this.rotation = this.block.GetAngle()
	this.rotationVel = this.block.GetAngularVelocity()
}
/**** }}} box2d interface ****/

Player.prototype.step = function(delta) {
	/**** {{{ synonyms ****/
	var forwardVelocity = 
		util.getLength(this.velocity) * Math.cos(this.rotation - util.getAngle(this.velocity))
	var vel = this.velocity
	var speed = util.getLength(vel)
	/**** }}} synonyms ****/

	/**** {{{ rotation ****/
	var maxRotation = 
		this.stalled ? gameplay.playerMaxRotationStalled 
			: gameplay.playerMaxRotation
	var targetRotVel = 0
	if (this.movement.left) targetRotVel = -maxRotation
	if (this.movement.right) targetRotVel += maxRotation
	
	this.rotationVel += 
		(targetRotVel - this.rotationVel) / Math.pow(gameplay.playerAngularDamping, delta)
	/**** }}} rotation ****/

	this.afterburner = false;

	/**** {{{ motion when stalled ****/
	if (this.stalled) {
		// add basic thrust

		if (this.movement.forward) {
			this.afterburner = true;
			this.velocity = 
				{x: vel.x + delta / 1000 * gameplay.playerAfterburnerStalled * Math.cos(this.rotation)
				,y: vel.y + delta / 1000 * gameplay.playerAfterburnerStalled * Math.sin(this.rotation)}
		}

		// apply damping when over playerMaxVelocityStalled
		var excessVel = speed - gameplay.playerMaxVelocityStalled 
		var dampingFactor = gameplay.playerMaxVelocityStalled / speed
		if (excessVel > 0)
			this.velocity.y = 
				vel.y * dampingFactor 
					* Math.pow(gameplay.playerStallDamping, delta / 1000)
	}
	/**** }}} motion when stalled ****/

	/**** {{{ motion when not stalled ****/
	else {
		// modify throttle and afterburner according to controls
		if (this.movement.forward && this.throttle < 1) 
			this.throttle += gameplay.playerThrottleSpeed * (delta / 1000)
		if (this.movement.backward && this.throttle > 0)
			this.throttle -= gameplay.playerThrottleSpeed * (delta / 1000)
		this.throttle = Math.min(this.throttle, 1)
		this.throttle = Math.max(this.throttle, 0)
		this.afterburner = this.movement.forward && this.throttle === 1 

		// pick away at leftover velocity
		this.leftoverVel.x = this.leftoverVel.x * Math.pow(gameplay.playerLeftoverVelDamping, delta / 1000)
		this.leftoverVel.y = this.leftoverVel.y * Math.pow(gameplay.playerLeftoverVelDamping, delta / 1000)

		// speed modifiers
		if (this.speed > this.throttle * gameplay.speedThrottleInfluence) {
			if (this.throttle < gameplay.speedThrottleInfluence) {
				this.speed -= gameplay.speedThrottleDeaccForce * (delta / 1000)
			} else {
				this.speed -= gameplay.speedThrottleForce * (delta / 1000)
			}
		} else {
			this.speed += gameplay.speedThrottleForce * (delta / 1000)
		}
		this.speed += 
			Math.sin(this.rotation) * gameplay.speedGravityForce * (delta / 1000)
		if (this.afterburner) 
			this.speed += gameplay.speedAfterburnForce * (delta / 1000)
		this.speed = Math.min(this.speed, 1)
		this.speed = Math.max(this.speed, 0)

		var targetSpeed = this.speed * gameplay.playerMaxSpeed

		// set velocity, according to target speed, rotation, and leftoverVel
		this.velocity = 
			{x: this.leftoverVel.x + Math.cos(this.rotation) * targetSpeed
			,y: this.leftoverVel.y + Math.sin(this.rotation) * targetSpeed}
	}
	/**** }}} motion when not stalled ****/

	/**** {{{ stall singularities ****/
	// change stalled state in function of other values
	if (this.stalled) {
		if (forwardVelocity > gameplay.playerExitStallThreshold) {
			this.stalled = false
			this.leftoverVel = {x: this.velocity.x - forwardVelocity * Math.cos(this.rotation), y: this.velocity.y - forwardVelocity * Math.sin(this.rotation)}
			this.speed = 
				forwardVelocity / gameplay.playerMaxSpeed
			this.throttle = this.speed / gameplay.speedThrottleInfluence
		}
	} else {
		if (forwardVelocity < gameplay.playerEnterStallThreshold) {
			this.stalled = true
			this.throttle = 1;
			this.speed = 0
		}
	}
	/**** }}} stall singularities ****/

	/**** {{{ respawning ****/
	if (this.health <= 0)
		this.respawning = true;

	if (this.respawning) {
		this.position = util.jsonClone(this.spawnpoint)
		this.velocity = {x: 50, y: 0}
		this.rotation = 0;	
		this.rotationVel = 0;

		this.stalled = true;
		this.throttle = 1;
		this.health = 1;
		this.energy = 1;

		this.respawning = false;
		this.writeToBlock();
		return;
	}
	/**** }}} respawning ****/
}
