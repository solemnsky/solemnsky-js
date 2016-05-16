var util = require('../../resources/util.js')

/**** {{{ constructors ****/
exports.mkPlayerSnapshot = function(player, priority, defaultState, states) {
	if (player === null)
		return null

	if (typeof priority == "undefined") priority = 0
	if (typeof defaultState == "undefined") defaultState = true
	if (typeof states == "undefined") states = {}

	var snap = {}

	snap.priority = priority
	snap.p = true // is player

	Object.keys(player).forEach(
		function(key) {
			if (["game", "shape", "block", "name", "anim"].indexOf(key) === -1)
				if (states[key] || defaultState)
					snap[key] = util.clone(player[key])
		}
	, this)

	return [snap]
}

exports.mkProjectileSnapshot = function(projectile, priority, defaultState, states) {
	if (projectile === null)
		return null

	if (typeof priority == "undefined") priority = 0
	if (typeof defaultState == "undefined") defaultState = true
	if (typeof states == "undefined") states = {}

	var snap = {}

	snap.priority = priority
	snap.p = false // is not player

	Object.keys(projectile).forEach(
		function(key) {
			if (["game", "shape", "block", "anim"].indexOf(key) === -1)
				if (states[key] || defaultState)
					snap[key] = util.clone(projectile[key])
		}
	, this)

	return [snap]
}
/**** }}} constructors ****/

/**** {{{ application ****/
exports.applySnapshot = function(world, snapshot) {
	//Don't try to use invalid snapshots.
	function nullFilter(point) {
		return point !== null
	}

	var compare = function(snapshot1, snapshot2) {
		return snapshot1.priority - snapshot2.priority
	}
	snapshot.filter(nullFilter).sort(compare).forEach(
		function(point) {
			if (point.p) {
				var player = world.findPlayerById(point.id);
				if (player !== null) {
					Object.keys(point).forEach(
						function(key) {
							if (key !== "priority")
								player[key] = util.clone(point[key])
						}	
					, this)
					player.writeToBlock()
				} 
			} else {
				var projectile = world.findProjectileById(point.id)
				if (projectile !== null) {
					Object.keys(point).forEach(
						function(key) {
							if (key !== "priority")
								projectile[key] = util.clone(point[key])
						}
					, this)	
					projectile.writeToBlock()
				}
			}
		}, this)
}
/**** }}} application ****/

/**** {{{ deflation and inflation ****/
var playerDeflationRules =
	[ { key: "afterburner", shortKey: "a", deflation: util.boolDeflation }
	, { key: "energy", shortKey: "e", deflation: util.floatDeflation } 
	, { key: "health", shortKey: "h", deflation: util.floatDeflation }
	, { key: "leftoverVel", shortKey: "l", deflation: util.vecDeflation }
	, { key: "movement", shortKey: "m", deflation: util.movementDeflation }
	, { key: "position", shortKey: "p", deflation: util.vecDeflation }
  , { key: "priority", shortKey: "x", deflation: util.noDeflation }
	, { key: "respawning", shortKey: "n", deflation: util.boolDeflation }
	, { key: "rotation", shortKey: "r", deflation: util.floatDeflation }
	, { key: "rotationVel", shortKey: "j", deflation: util.floatDeflation }
	, { key: "spawnpoint", shortKey: "s", deflation: util.vecDeflation }
	, { key: "stalled", shortKey: "f", deflation: util.boolDeflation }
	, { key: "throttle", shortKey: "t", deflation: util.floatDeflation }
	, { key: "velocity", shortKey: "v", deflation: util.vecDeflation }
	, { key: "speed", shortKey: "g", deflation: util.floatDeflation }
	]

var projectileDeflationRules = 
	[ { key: "priority", shortKey: "x", deflation: util.noDeflation }
	, { key: "position", shortKey: "p", deflation: util.vecDeflation }
	, { key: "velocity", shortKey: "v", deflation: util.vecDeflation }
	, { key: "owner", shortKey: "o", deflation: util.noDeflation }
	, { key: "dimensions", shortKey: "d", deflation: util.noDeflation }
	]


exports.deflateSnapshot = function(snap) {
	return snap.map(
		function(asnap) {
			if (asnap.p)
				return util.deflateObject(playerDeflationRules, asnap)
			return util.deflateObject(projectileDeflationRules, asnap)
		}	
	, util)
}

exports.inflateSnapshot = function(snap) {
	return snap.map(
		function(asnap) {
			if (asnap.p)
				return util.deflateObject(playerDeflationRules, asnap)
			return util.deflateObject(projectileDeflationRules, asnap)
		}	
	, util)
}
/**** }}} deflation and inflation ****/
