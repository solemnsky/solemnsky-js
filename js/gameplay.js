gameplay = {
	// the number of pixels that box2d thinks is one meter
	// high numbers = bad accuracy
	// low numbers = bad performance (?)
	physicsScale:  50


	// dimensions of the simple player rectangle
	, playerWidth:  60
	, playerHeight:  5

	// force of gravity 
	, gravity: 10 

	// the force of the engine (I don't understand why this is so low)
	, playerEngine:  2 
	// the force of the player's torque
	, playerTorque:  30

	// the maximum rotation velocity
	, playerMaxRotation:  Math.PI * 1.2
	// maximum player speed out of a stall
	, playerMaxVelocity: 5

	// the control that the player has over these values (higher is worse)
	, playerAngularControl:  2
	, playerLinearControl:  7

}
