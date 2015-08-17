var util = require('../../resources/util.js')

function mkPlayerSnapshot(player, priority, defaultState, states) {
	if (typeof priority == "undefined") priority = 0
	if (typeof defaultState == "undefined") defaultState = true
	if (typeof states == "undefined") states = {}

	var snap = {}

	snap.priority = priority
	snap.p = true // is player

	Object.keys(player).forEach(
		function(key) {
			if (["game", "block", "name", "anim"].indexOf(key) === -1)
				if (states[key] || defaultState)
					snap[key] = util.clone(player[key])
		}
	, this)

	return snap
}

function mkProjectileSnapshot(projectile, priority, defaultState, states) {
	if (typeof priority == "undefined") priority = 0
	if (typeof defaultState == "undefined") defaultState = true
	if (typeof states == "undefined") states = {}

	var snap = {}

	snap.priority = priority
	snap.p = false // is player

	Object.keys(projectile).forEach(
		function(key) {
			if (["game", "block", "anim"].indexOf(key) === -1)
				if (states[key] || defaultState)
					snap[key] = util.clone(projectile[key])
		}
	, this)

	return snap
}

// from this point down, a snapshot is an array of mkPlayerSnapshot or mkProjectileSnapshot

exports.makePlayerSnapshot = 
	function(world, id, priority, defaultState, states) {
		var player = world.findPlayerById(id)
		if (player !== null) 
			return [mkPlayerSnapshot(player, priority, defaultState, states)]

		return null 
	}

exports.makeProjectileShapshot =
	function(world, id, priority, defaultState, states) {
		var projectile = world.findProjectileById(id)
		if (projectile !== null)
			return [mkProjectileSnapshot(projectile, priority, defaultState, states)]
	}

exports.makeTotalSnapshot = function(world, priority) {
	return world.players.reduce(function(list, player) {
		return list.concat(exports.makePlayerSnapshot(world, player.id, priority, true, {}));
	}, []);
}

exports.applySnapshot = function(world, snapshots) {
	//Don't try to use invalid snapshots.
	if (typeof snapshot === "undefined" || snapshots === null)
		return;

	var compare = function(snapshot1, snapshot2) {
		return snapshot1.priority - snapshot2.priority
	}
	snapshots.sort(compare).forEach(
		function(snapshot) {
			if (snapshot.p) {
				var player = world.findPlayerById(snapshot.id);
				if (player !== null) {
					Object.keys(snapshot).forEach(
						function(key) {
							if (key !== "priority")
								player[key] = util.clone(snapshot[key])
						}	
					, this)
					player.writeToBlock()
				} 
			} else {
				var projectile = world.findProjectileById(snapshot.id)
				if (projectile !== null) {
					Object.keys(snapshot).forEach(
						function(key) {
							if (key !== "priority")
								projectile[key] = util.clone(snapshot[key])
						}
					, this)	
					projectile.writeToBlock()
				}
			}
		}, this)
}

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

var projectileDeflationRules = [
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
