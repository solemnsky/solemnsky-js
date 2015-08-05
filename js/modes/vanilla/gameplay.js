/*                  ******** vanilla/gameplay.js ********          //
\\ Magic gameplay values.                                          \\
//                  ******** vanilla/gameplay.js ********          */

module.exports = {
	// the number of pixels that box2d thinks is one meter
	// high numbers = bad accuracy
	// low numbers = bad performance (?)
	physicsScale:  50

	// dimensions of the simple player rectangle
	, playerWidth:  60
	, playerHeight: 30

	// acceleration of gravity 
	, gravity: 3 

	// the maximum rotation velocity depends on 
	// whether the player is stalled
	, playerMaxRotation:  Math.PI * 1.2
	, playerMaxRotationStalled: Math.PI * 1.5

	// the maximum linear velocity also does
	, playerMaxVelocity: 300
	, playerMaxVelocityStalled: 250
	, playerAfterburner: 330 // speed with afterburner
	, playerAfterburnerStalled: 500 // acceleration of afterburner in a stall

	// a lot of values in the game engine are 'damped out'
	, playerAngularDamping: 1.05 
	, playerStallDamping: 1.5 
	, playerLeftoverVelDamping: 0.10

	// the amount of throttle that a player can change in a second
	, playerThrottleSpeed: 1.5 

	// velocity thresholds to enter and exit stalls
	, playerEnterStallThreshold: 100
	, playerExitStallThreshold: 150
	, playerLeftoverVelDeacceleration: 5
			// the acceleration with which the leftover velocity
			// a stall ends with is deaccelerated
	, playerGravityEffect: 1
			// the acceleration that gravity has on our player
			// when not stalled

	, minimumContactDamage: 0.02
	, contactDamangeMultiplier: 0.01

	// graphics that look nice
	, graphicsThrustFade: 4
	, graphicsBarWidth: 50
	, graphicsBarHeight: 8
	, graphicsBarClear: 50
	, graphicsNameClear: 35
}
