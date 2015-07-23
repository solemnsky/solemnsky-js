/*                  ******** player.js ********                    //
\\ This file is an extension of engine.js, in which methods        \\
// (update methods and a base constructor) are defines for         // 
\\ players. The flight mechanics are defined here.                 \\
//                  ******** player.js ********                    */
function Player(id, x, y, name) {
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
	this.stalled = false;
	this.leftoverVel = {x: 0, y: 0}
	this.throttle = 1;
	this.health = 1;
	this.energy = 1;
	this.afterburner = false;
	this.position = {x: x, y: y};
	this.spawnpoint = {x: x, y: y};
	this.velocity = {x: 0, y: 0}
	this.rotation = 0;
	this.respawning = false;

	this.block = SolemnSky.createBox(x, y, gameplay.playerWidth, gameplay.playerHeight, false, {restitution: 0.1, friction: 0.1});
}

Player.prototype.update = function(game, delta) {
	/**** {{{ respawning ****/
	if (this.respawning) {
		this.block.SetPosition(new b2Vec2(this.spawnpoint.x / gameplay.physicsScale, this.spawnpoint.y / gameplay.physicsScale));
		this.block.SetLinearVelocity(new b2Vec2(5, 0));
		this.block.SetAngularVelocity(0);
		this.block.SetAngle(0)

		this.stalled = false;
		this.throttle = 1;
		this.health = 1;
		this.energy = 1;

		this.respawning = false;
		return;
	}
	/**** }}} respawning ****/

	/**** {{{ useful values ****/
	var blockPos = this.block.GetPosition()
	var angle = this.block.GetAngle()
	var angleVel = this.block.GetAngularVelocity()
	var vel = this.block.GetLinearVelocity()
	var velAngle = Utils.getAngle(vel)
		// angle of the velocity
	var velEffect = Math.cos(angle - velAngle)
	var forwardVel = vel.Length() * velEffect
	/**** }}} useful values ****/

	/**** {{{ stall singularities ****/
	// change stalled state in function of other values
	if (this.stalled) {
		if (forwardVel > gameplay.playerExitStallThreshold) {
			this.stalled = false
			this.leftoverVel = {x: vel.x, y: vel.y}
			this.throttle = 0
		}
	} else {
		if (forwardVel < gameplay.playerEnterStallThreshold)
			this.stalled = true
	}
	/**** }}} stall singularities ****/

	/**** {{{ set angular velocity ****/
	var maxRotation = (this.stalled) ? gameplay.playerMaxRotationStalled : gameplay.playerMaxRotation
	var targetAngleVel = 0
	if (this.movement.left)
		targetAngleVel = -maxRotation
	if (this.movement.right)
		targetAngleVel += maxRotation
	this.block.SetAngularVelocity(
		angleVel + ((targetAngleVel - angleVel) / (gameplay.playerAngularDamping ^ (delta / 1000)))
	)
	/**** }}} set angular velocity ****/

	this.afterburner = false;

	/**** {{{ motion when stalled ****/
	if (this.stalled) {
		// add basic thrust
		// afterburner
		if (this.movement.forward) {
			this.afterburner = true;
			this.block.SetLinearVelocity(
				new b2Vec2.Make(
					vel.x + (delta / 1000) * gameplay.playerAfterburnerStalled * Math.cos(angle)
					, vel.y + (delta / 1000) * gameplay.playerAfterburnerStalled * Math.sin(angle)
				)
			)
		}

		// apply damping when over playerMaxVelocityStalled
		var excessVel = vel.Length() - gameplay.playerMaxVelocityStalled 
		if (excessVel > 0)
			this.block.SetLinearVelocity(
				new b2Vec2.Make(
					vel.x * ((vel.Length() - excessVel) / vel.Length())
					, vel.y * ((vel.Length() - excessVel) / vel.Length())
				)
			)
	}
	/**** }}} motion when stalled ****/

	/**** {{{ motion when not stalled ****/
	else {
		// modify throttle
		if (this.movement.forward && this.throttle < 1)
			this.throttle += gameplay.playerThrottleSpeed * (delta / 1000)
		if (this.movement.backward && this.throttle > 0)
			this.throttle -= gameplay.playerThrottleSpeed * (delta / 1000)
		if (this.movement.forward && this.throttle === 1)
			this.afterburner = true;

		if (this.throttle > 1) this.throttle = 1
		if (this.throttle < 0) this.throttle = 0

		// pick away at leftover velocity
		var leftoverVelSign = 
			{x: Math.sign(this.leftoverVel.x)
			,y: Math.sign(this.leftoverVel.y)}
		this.leftoverVel.x = Math.abs(this.leftoverVel.x)
		this.leftoverVel.y = Math.abs(this.leftoverVel.y)

		if (this.leftoverVel.x > 0)
			this.leftoverVel.x = this.leftoverVel.x - (gameplay.playerLeftoverVelDeacceleration * (delta / 1000))
		if (this.leftoverVel.y > 0) 
			this.leftoverVel.y = this.leftoverVel.y - (gameplay.playerLeftoverVelDeacceleration * (delta / 1000))
		if (this.leftoverVel.x < 0) this.leftoverVel.x = 0
		if (this.leftoverVel.y < 0) this.leftoverVel.y = 0

		this.leftoverVel.x = this.leftoverVel.x * leftoverVelSign.x
		this.leftoverVel.y = this.leftoverVel.y * leftoverVelSign.y
		
		// make some gravity
		var gravityEffect = 
			{y: Math.abs(gameplay.playerGravityEffect * Math.sin(angle))
			,x: gameplay.playerGravityEffect * 0}

		// move in the direction of angle, taking in affect gravity and
		// leftover velocity from the last stall recovery 
		if (this.afterburner) {
			var targetSpeed = gameplay.playerAfterburner
		} else {
			var targetSpeed = this.throttle * gameplay.playerMaxVelocity
		}

		this.block.SetLinearVelocity(
			new b2Vec2.Make(
				this.leftoverVel.x + gravityEffect.x + targetSpeed * Math.cos(angle)
				, this.leftoverVel.y + gravityEffect.y + targetSpeed * Math.sin(angle)
			)
		)
	}
	/**** }}} motion when not stalled ****/
}

Player.prototype.onLoseHealth = function(amount) {
	//We lost health.
	if (this.health <= 0) {
		//Crashed and destroyed
		this.respawning = true;
	}
}

if (typeof(module) !== "undefined") {
	module.exports = Player;
}
