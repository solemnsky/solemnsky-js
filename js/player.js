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
	this.throttle = 1;
	this.health = 1;
	this.energy = 1;
	this.afterburner = false;
	this.position = {x: x, y: y}
	this.velocity = {x: 0, y: 0}
	this.rotation = 0;

	this.block = SolemnSky.createBox(x, y, gameplay.playerWidth, gameplay.playerHeight, false, {restitution: 0.1, friction: 0.1});
}

Player.prototype.update = function(game, delta) {
	var blockPos = this.block.GetPosition()
	var angle = this.block.GetAngle()

	var angleVel = this.block.GetAngularVelocity()
	var vel = this.block.GetLinearVelocity()

	// do not confuse with angleVel =P
	var velAngle = Utils.getAngle(vel)
	var velEffect = Math.cos(angle - velAngle)

	var forwardVel = vel.Length() * velEffect

	// change stalled state in function of other values
	if (this.stalled) {
		if (forwardVel > gameplay.playerExitStallThreshold) {
			this.stalled = false
			this.throttle = vel.Length() / gameplay.playerMaxVelocity
		}
	} else {
		if (forwardVel < gameplay.playerEnterStallThreshold)
			this.stalled = true
	}

	// set angular velocity
	var maxRotation = (this.stalled) ? gameplay.playerMaxRotationStalled : gameplay.playerMaxRotation
	var targetAngleVel = 0
	if (this.movement.left)
		targetAngleVel = -maxRotation
	if (this.movement.right)
		targetAngleVel += maxRotation
	this.block.SetAngularVelocity(
		angleVel + ((targetAngleVel - angleVel) / gameplay.playerAngularDamping)
	)

	this.afterburner = false;
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
	} else {
		// modify throttle
		if (this.movement.forward && this.throttle < 1)
			this.throttle += gameplay.playerThrottleSpeed * (delta / 1000)
		if (this.movement.backward && this.throttle > 0)
			this.throttle -= gameplay.playerThrottleSpeed * (delta / 1000)
		if (this.movement.forward && this.throttle === 1)
			this.afterburner = true;

		if (this.throttle > 1) this.throttle = 1
		if (this.throttle < 0) this.throttle = 0

		// move in the direction of angle, taking in affect gravity
		if (!this.afterburner) {
			this.block.SetLinearVelocity(
				new b2Vec2.Make(
					this.throttle * gameplay.playerMaxVelocity * Math.cos(angle)
					, this.throttle * gameplay.playerMaxVelocity * Math.sin(angle)
				)
			)
		} else {
			this.block.SetLinearVelocity(
				new b2Vec2.Make(
					gameplay.playerAfterburner * Math.cos(angle)
					, gameplay.playerAfterburner * Math.sin(angle)
				)
			)
		}
	}
}


if (typeof(module) !== "undefined") {
	module.exports = Player;
}
