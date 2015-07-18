/**** {{{ dependencies ****/
//Import Box2D library
Box2D = require("./assets/box2d.min.js");

//Number conversion utilities
Utils = require("./js/util.js");

//Socket server
WebSocketServer = require("ws").Server;

//Import common game engine code
Engine = require("./js/engine.js");
Game = Engine.Game;
readSnapshot = Engine.readSnapshot;
serialiseSnapshot = Engine.serialiseSnapshot;
/**** }}} dependencies ****/

/**** {{{ arbitrary box array (static game environment) ****/
var boxes = [
	{x: 320, y: 480, w: 600, h: 10, static: true, fields: {life: 1e300}},
	{x:  90, y:  30, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}},
	{x: 130, y: 110, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}},
	{x: 470, y: 230, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}},
	{x: 210, y: 130, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}},
	{x: 350, y:  30, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}},
	{x: 390, y: 140, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}},
	{x: 430, y: 270, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}},
	{x: 570, y: 300, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}}
];
/**** }}} arbitrary boxes array ****/

/**** {{{ broadcastSnap: constant snapshots ****/
Server.prototype.broadcast = function(text) {
	//Send all the clients a message
	wss.clients.forEach(function(client) {
		try {
			client.send(text);
		} catch (e) { /* They've disconnected */ }
	});
}

Server.prototype.broadcastSnap = function(tickNum) {
	setTimeout(function() {
		GameServer.broadcastSnap(tickNum + 1);
	}, SolemnSky.tickTimeMs);
	this.broadcast("SNAP " + SolemnSky.dumpTotalSnapshot);

	/*
	if (tickNum % 10 === 0) {
		this.broadcast("PROJECTILES " + this.emitProjectileBlob());
	}
	*/ // commented out for simplicity for now, probably will merge
		// into the snapshot infrastructure

	SolemnSky.update();
}
/**** }}} onTick: constant snapshots ****/

/**** {{{ loadmap, openSocket; getting ready to be a server ****/
function Server() {}

// loads the map into the game engine
Server.prototype.loadMap = function() {
	//Init the boxes into the world
	for (var i = 0; i < boxes.length; i ++) {
		var box = boxes[i];
		SolemnSky.map.push(
			SolemnSky.createBox(
				box.x , box.y, box.w , box.h, box.static, box.fields)
		);
	}
}

// opens the socket and sets response callbacks
Server.prototype.openSocket = function(port) {
	wss = new WebSocketServer({port: port});

	wss.on("connection", function connection(ws) {
		ws.on("message", function incoming(message) {
			console.log("Data from " + ws._socket.address().address + ":" + ws._socket.address().port + ": " + message);
			GameServer.tick(ws, message);
		});
		ws.on("close", function close() {
			console.log("Disconnect: " + ws._socket.address().address + ":" + ws._socket.address().port);
			SolemnSky.deletePlayer(ws.playerId);
		});

		console.log("Connection from " + ws._socket.address().address + ":" + ws._socket.address().port);

		ws.send("MAP " + GameServer.emitMapBlob());
		ws.send("SNAP " + SolemnSky.emitTotalSnapshot());
		ws.send("LIST " + SolemnSky.emitListing());
	});
}

// previously emitBoxBlob, now reflects that this will
// eventually before a form of distributing a more featureful map
Server.prototype.emitMapBlob = function() {
	var emitBox = function(box) {
		return ';' + Utils.floatToChar(box.x)
			 + ',' + Utils.floatToChar(box.y)
			 + ',' + Utils.floatToChar(box.w)
			 + ',' + Utils.floatToChar(box.h)
			 + ',' + box.static 
			 + ',' + JSON.stringify(box.fields).replace(/,/g, "\\:");
	}
	var acc = function(acc, x) { return acc + x };
	return boxes.map(emitBox).reduce(acc, boxes.length);
}
/**** }}} server initWorld and openSocket methods ****/

/**** {{{ tick: respond to data from the clients ****/
// responds to an incoming message 
var lastId = 0;
Server.prototype.tick = function(ws, data) {
	var split = data.split(" ");
	var command = split[0];
	split.splice(0, 1);
	data = split.join(" ");
	// console.log("Command: " + command + " data: " + data);
	switch (command) {
		case "NAME":
			ws.playerId = 
				SolemnSky.addPlayer(
					lastId++ , 320 / SolemnSky.scale
					, 240 / SolemnSky.scale, data, "#00ff00", "");
			ws.send("ID " + ws.playerId);
			this.broadcast("JOIN " + data);
			this.broadcast
			break;
		case "SNAP":
			var snapshot = readSnapshot(data);
			SolemnSky.applySnapshot(snapshot);
			break;
		case "CHAT":
			var message = data;
			this.broadcast("CHAT " + ws.playerId + " " + data);
	}
}
/**** }}} tick: respond to data from the clients ****/

/**** {{{ initialise and open sockets ****/
SolemnSky = new Game();
SolemnSky.setFPS(60);
SolemnSky.init();

GameServer = new Server();
GameServer.openSocket(50042);
GameServer.loadMap();

//Start the broadcastloop
GameServer.broadcastSnap(0);
/**** }}} initialise and open sockets ****/

/**** {{{ commented code ****/
/*
Server.prototype.emitProjectileBlob = function() {
	var now = Date.now();
	var emitProjectile = function(projectile) {
		var position = projectile.GetPosition();
		var velocity = projectile.GetLinearVelocity();
		var angle = projectile.GetAngle();
		var angular = projectile.GetAngularVelocity();
		return ';' + Utils.intToChar(now - projectile.GetUserData().creationDate)
			 + ',' + Utils.floatToChar(position.x)
			 + ',' + Utils.floatToChar(position.y)
			 + ',' + Utils.floatToChar(velocity.x)
			 + ',' + Utils.floatToChar(velocity.y)
			 + ',' + Utils.floatToChar(angle)
			 + ',' + Utils.floatToChar(angular);
	}
	var acc = function(acc, x) { return acc + x };
	return SolemnSky.projectiles.map(emitProjectile).reduce(acc, SolemnSky.projectiles.length);
}
*/ // commented for simplicity for now (should probably be merged into
	// the snapshot architecture
/**** }}} commented code ****/
