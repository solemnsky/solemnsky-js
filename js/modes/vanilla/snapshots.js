var Util = require('../../resources/util.js')

function Snapshot(player, priority, defaultState, states) {
	if (typeof priority == "undefined") priority = 0
	if (typeof defaultState == "undefined") defaultState = true
	if (typeof states == "undefined") states = {}

	this.priority = priority;
	this.id = player.id;

	Object.keys(player).forEach(
		function(key) {
			if (["game", "block", "name", "anim"].indexOf(key) === -1)
				if (states[key] || defaultState)
					this[key] = Util.clone(player[key])
		}
	, this)
}

exports.makePlayerSnapshot = 
	function(world, id, priority, defaultState, states) {
		var player = world.findPlayerById(id);
		if (player !== null) 
			return [new Snapshot(player, priority, defaultState, states)]

		return null 
	}

exports.makeTotalSnapshot = function(world, priority) {
	return world.players.reduce(function(list, player) {
		return list.concat(exports.makePlayerSnapshot(world, player.id, priority, true, {}));
	}, []);
}

exports.applySnapshot = function(world, snapshot) {
	//Don't try to use invalid snapshots.
	if (typeof(snapshot) === "undefined" || snapshot === null)
		return;

	var compare = function(snapshot1, snapshot2) {
		snapshot1.priority - snapshot2.priority
	}
	snapshot.sort(compare).forEach(
		function(snapshot) {
			var player = world.findPlayerById(snapshot.id);
			if (player !== null) {
				Object.keys(snapshot).forEach(
					function(key) {
						if (key !== "priority")
							player[key] = Util.clone(snapshot[key])
					}	
				, this)
				player.writeToBlock();
			} 
		}, this)
}

var deflationRules =
	[ { key: "afterburner", shortKey: "a", deflation: Util.boolDeflation }
	, { key: "energy", shortKey: "e", deflation: Util.floatDeflation } 
	, { key: "health", shortKey: "h", deflation: Util.floatDeflation }
	, { key: "leftoverVel", shortKey: "l", deflation: Util.vecDeflation }
	, { key: "movement", shortKey: "m", deflation: Util.movementDeflation }
	, { key: "position", shortKey: "p", deflation: Util.vecDeflation }
  , { key: "priority", shortKey: "x", deflation: Util.noDeflation }
	, { key: "respawning", shortKey: "n", deflation: Util.boolDeflation }
	, { key: "rotation", shortKey: "r", deflation: Util.floatDeflation }
	, { key: "rotationVel", shortKey: "j", deflation: Util.floatDeflation }
	, { key: "spawnpoint", shortKey: "s", deflation: Util.vecDeflation }
	, { key: "stalled", shortKey: "f", deflation: Util.boolDeflation }
	, { key: "throttle", shortKey: "t", deflation: Util.floatDeflation }
	, { key: "velocity", shortKey: "v", deflation: Util.vecDeflation }
	, { key: "gravityCoast", shortKey: "g", deflation: Util.floatDeflation }
	]

function deflatePair(pair) {
	var matches = deflationRules.filter(
		function(rule) { return rule.key === pair.key	} 
	, pair)
	if (matches.length > 0) {
		var rule = matches[0]
		return {
			key: rule.shortKey
			, value: rule.deflation.deflate(pair.value)
		}
	} 
	return pair 
}

function inflatePair(pair) {
	var matches = deflationRules.filter(
		function(rule) { return rule.shortKey === pair.key	} 
		, pair
	)
	if (matches.length > 0) {
		var rule = matches[0]
		return {
			key: rule.key
			, value: rule.deflation.inflate(pair.value)
		}
	} 
	return pair 
}

exports.serialiseSnapshot = function(snap) {
	var result = []
	
	snap.forEach(
		function(inflated) {
			var deflated = {}
			Object.keys(inflated).forEach(
				function(key) {
					var pair = deflatePair({key: key, value: inflated[key]})
					deflated[pair.key] = pair.value	
				}
			, deflated)
			result.push(deflated)
		}
	, result)

	return JSON.stringify(result)
}

exports.readSnapshot = function(string) {
	try {
		var snap = JSON.parse(string)
		var result = []
		snap.forEach(
			function(deflated) {
				var inflated = {}
				Object.keys(deflated).forEach(
					function(key) {
						var pair = inflatePair({key: key, value: deflated[key]})
						inflated[pair.key] = pair.value
					}
				)
				result.push(inflated)
			}
		, result)
		return result
	} catch (e) {
		//Could not read snapshot; but don't let the Syntax Error break the loop
		return null
	}
}

exports.Snapshot = Snapshot
