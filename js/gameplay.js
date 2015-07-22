/*                  ******** gameplay.js ********                  //
\\ This file defines various magic values used in the engine,      \\ 
// relating to the general feel of the game. A description is      //
\\ given in each case.                                             \\
//                  ******** gameplay.js ********                  */
gameplay = {
	// the number of pixels that box2d thinks is one meter
	// high numbers = bad accuracy
	// low numbers = bad performance (?)
	physicsScale:  50

	// dimensions of the simple player rectangle
	, playerWidth:  60
	, playerHeight: 7

	// acceleration of gravity 
	, gravity: 3 

	// the maximum rotation velocity depends on 
	// whether the player is stalled
	, playerMaxRotation:  Math.PI * 1.2
	, playerMaxRotationStalled: Math.PI * 1.5

	// the maximum linear velocity also does
	, playerMaxVelocity: 6
	, playerMaxVelocityStalled: 5 

	// the acceleration that a player can use when in a stall
	, playerAccelerationStalled: 6

	// the proportion with which target angular velocity is approached
	// (1 is instantaneous)
	, playerAngularDamping: 3

	// the proportion with which excess velocity is dissapted in a stall
	, playerLinearDampingStall: 2

	// the amount of throttle that a player can change in a second
	, playerThrottleSpeed: 1.5 

	// velocity thresholds to enter and exit stalls
	, playerEnterStallThreshold: 2
	, playerExitStallThreshold: 3
	
}
