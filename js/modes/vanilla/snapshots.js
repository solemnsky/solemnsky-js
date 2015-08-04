Utils = require('../../resources/util.js')

function Snapshot(player, priority, defaultState, states) {
	if (typeof priority == "undefined") priority = 0
	if (typeof defaultState == "undefined") defaultState = true
	if (typeof states == "undefined") states = {}

	this.priority = priority;
	this.id = player.id;

	Object.keys(player).forEach(
		function(key) {
			if (["game", "block", "name"].indexOf(key) === -1)
				if (states[key] || defaultState)
					this[key] = Utils.clone(player[key])
		}
	, this)
}

exports.makePlayerSnapshot = 
	function(world, id, priority, defaultState, states) {
	var player = world.findPlayerById(id);
	if (player !== null) {
		return [new Snapshot(player, priority, defaultState, states)];
	} else { return null }
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
						player[key] = Utils.clone(snapshot[key])
					}	
				, this)
				player.writeToBlock();
			} 
		}, this)
}

exports.serialiseSnapshot = function(snapshot) {
	return JSON.stringify(snapshot)
	// TODO make more space efficent 
}

exports.readSnapshot = function(string) {
	try {
		return JSON.parse(string)
	} catch (e) {
		//Could not read snapshot; but don't let the Syntax Error break the loop
		return null;
	}
}

exports.Snapshot = Snapshot
