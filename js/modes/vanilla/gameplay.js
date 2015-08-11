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

	// stalled
	, playerMaxRotationStalled: Math.PI * 1.5
	, playerMaxVelocityStalled: 250
	, playerAfterburnerStalled: 500 
	, playerExitStallThreshold: 130

	// not stalled
	, playerMaxRotation:  Math.PI * 1.2
	, playerMaxSpeed: 300
	, speedThrottleInfluence: 0.7 // max speed achievable with throttle
	, speedThrottleForce: 0.3
			// speed per second that throttle can influence
	, speedThrottleDeaccForce: 1.1
	, speedGravityForce: 0.5
			// speed per second that gravity can influence
	, speedAfterburnForce: 0.6
	, playerInitialThrottle: 0.6
	
	, playerEnterStallThreshold: 100

	// misc values and damping
	, playerAngularDamping: 1.05 
	, playerStallDamping: 1.5 
	, playerLeftoverVelDamping: 0.10
	, playerThrottleSpeed: 1.5 

	// contact
	, minimumContactDamage: 0.02
	, contactDamangeMultiplier: 0.01

	// graphics that look nice
	, graphicsThrustFade: 4
	, graphicsBarWidth: 50
	, graphicsBarHeight: 8
	, graphicsBarClear: 50
	, graphicsNameClear: 35
}
