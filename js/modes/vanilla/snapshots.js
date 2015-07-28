module.exports =
	{ Snapshot: Snapshot
	, makePlayerSnapshot: makePlayerSnapshot
	, makeTotalSnapshot: makeTotalSnapshot
	, applySnapshot: applySnapshot
	, serialiseSnapshot: serialiseSnapshot
	, readSnapshot: readSnapshot }

Utils = require('../../resources/util.js')

function Snapshot(player, priority, defaultState, states) {
	if (typeof priority == "undefined") priority = 0
	if (typeof defaultState == "undefined") defaultState = true
	if (typeof states == "undefined") states = {}

	this.priority = priority;
	this.id = player.id;

	Object.keys(player).forEach(
		function(key) {
			if (["world", "block", "name"].indexOf(key) === -1)
				if (states[key] || defaultState)
					this[key] = Utils.clone(player[key])
		}
	, this)
}

makePlayerSnapshot = 
	function(world, id, priority, defaultState, states) {
	var player = world.findPlayerById(id);
	if (player !== null) {
		return new Snapshot(player, priority, defaultState, states);
	} else { return null }
}

makeTotalSnapshot = function(world, priority) {
	return (function(game) {
		return game.players.reduce(function(list, player) {
			list.push(game.makePlayerSnapshot(player.id, priority, true, {}));
			return list;
		}, []);
	})(this);
}

applySnapshot = function(world, snapshot)
	var compare = function(snapshot1, snapshot2) {
		snapshot1.priority - snapshot2.priority
	}
	snapshot.sort(compare).forEach(
		function(snapshot) {
			var player = this.findPlayerById(snapshot.id);
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

serialiseSnapshot = function(snapshot) {
	return JSON.stringify(snapshot)
	// TODO make more space efficent 
}

readSnapshot = function(string) {
	return JSON.parse(string)
}
