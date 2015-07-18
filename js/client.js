/**** {{{ constants, helper functions ****/
//Partial application yay
Function.prototype.partial = function() {
	var fn = this, args = arguments;
	return function() { 
		var filledArgs = Array.prototype.slice.call(args);
		for (var i=0, arg=0; arg < arguments.length; i++)
			if (filledArgs[i] === undefined)
				filledArgs[i] = arguments[arg++];
		return fn.apply(this, filledArgs);
	};
};

window.addEventListener('resize', function(event){
	updateWindowSize()
});

//Some global variables for the DOM
var canvas = document.getElementById("c");
var ctx = canvas.getContext("2d");

//Current window size
function updateWindowSize() {
	windowSize = {
		width: window.innerWidth || document.body.clientWidth,
		height: window.innerHeight || document.body.clientHeight
	}
	canvas.width = windowSize.width;
	canvas.height = windowSize.height;
}; updateWindowSize();

//http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame   || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame    || 
		window.oRequestAnimationFrame      || 
		window.msRequestAnimationFrame     || 
		function(callback, /* DOMElement */ element){
			window.setTimeout(callback, SolemnSky.tickTimeMs);
		};
})();
/**** }}} constants, helper functions ****/

/**** {{{ game state ****/
var myid = -1;

//Start up the game
SolemnSky = new Game();
SolemnSky.setFPS(60);
SolemnSky.init();
requestAnimFrame(update);
/**** }}} game state ****/

/**** {{{ rendering functions ****/
function renderBox(body, width, height) {
	//Reset the transform of the context
	ctx.resetTransform();

	//Box position
	var playerX = body.GetPosition().x * SolemnSky.scale;
	var playerY = body.GetPosition().y * SolemnSky.scale;

	//Transform the context to render this in position
	ctx.translate(playerX, playerY);
	ctx.rotate(body.GetAngle());
	
	//TODO: Use the shape's path
	ctx.fillRect(-width / 2, -height / 2, width, height);
	ctx.strokeRect(-width / 2, -height / 2, width, height);
}

function render() {
	//Clear the display before rendering
	ctx.resetTransform();
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, windowSize.width, windowSize.height);

	//Render player
	SolemnSky.players.forEach(function each(player) {
		ctx.fillStyle = "#bbffbb";
		ctx.strokeStyle = "#77ff77";

		renderBox(player.block, 30, 30);

		var playerX = player.block.GetPosition().x * this.scale;
		var playerY = player.block.GetPosition().y * this.scale;

		ctx.resetTransform();
		ctx.fillStyle = "#000000";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(player.name, playerX, playerY);
	}, SolemnSky);
	SolemnSky.boxes.forEach(function each(box) {
		var data = box.GetUserData();

		ctx.fillStyle = "#" + tinycolor("hsv(" + (100 * box.life / data.fields.life) + ", 30, 100)").toHex();
		ctx.strokeStyle = "#" + tinycolor("hsv(" + (100 * box.life / data.fields.life)+ ", 50, 100)").toHex();

		renderBox(box, data.w, data.h);
	}, SolemnSky);

	SolemnSky.projectiles.forEach(function each(projectile) {
		var data = projectile.GetUserData();
		var life = 1000 - (Date.now() - data.creationDate);
		if (life <= 0 || life > 1000)
			return;

		//If the S is in [0, 1] then tinycolor thinks it's a float from [0, 1]
		ctx.fillStyle = "#" + tinycolor("hsv(0, " + (Math.ceil(30 * (life / 1000)) + 1) + ", 100)").toHex();
		ctx.strokeStyle = "#" + tinycolor("hsv(0, " + (Math.ceil(50 * (life / 1000)) + 1) + ", 100)").toHex();

		renderBox(projectile, data.w, data.h);
	}, SolemnSky);
} // render()
/**** }}} rendering functions ****/

/**** {{{ safe update method ****/
then = Date.now();
function update() {
	now = Date.now();

	elapsed = now - then;
	// console.log(elapsed);
	requestAnimFrame(update);

	if (elapsed > SolemnSky.tickTimeMs) {
		then = now - (elapsed % SolemnSky.tickTimeMs);

		SolemnSky.update();
		render();
	}
} 
/**** }}} safe update method ****/

/**** {{{ key bindings ****/
Mousetrap.bind('up', 
	function() { SolemnSky.players[SolemnSky.findIndexById(myid)].movement.forward = true; sendSnapshot()}, 'keydown');
Mousetrap.bind('up', 
	function() { SolemnSky.players[SolemnSky.findIndexById(myid)].movement.forward = false; sendSnapshot()}, 'keyup');
Mousetrap.bind('down', 
	function() { SolemnSky.players[SolemnSky.findIndexById(myid)].movement.backward = true; sendSnapshot()}, 'keydown');
Mousetrap.bind('down', 
	function() { SolemnSky.players[SolemnSky.findIndexById(myid)].movement.backward = false; sendSnapshot()}, 'keyup');
Mousetrap.bind('left', 
	function() { SolemnSky.players[SolemnSky.findIndexById(myid)].movement.left = true; sendSnapshot()}, 'keydown');
Mousetrap.bind('left',
	function() { SolemnSky.players[SolemnSky.findIndexById(myid)].movement.left = false; sendSnapshot()}, 'keyup');
Mousetrap.bind('right', 
	function() { SolemnSky.players[SolemnSky.findIndexById(myid)].movement.right = true; sendSnapshot()}, 'keydown');
Mousetrap.bind('right', 
	function() { SolemnSky.players[SolemnSky.findIndexById(myid)].movement.right = false; sendSnapshot()}, 'keyup');
// ugh what an ugly hack
/**** }}} key bindings ****/

/**** {{{ basic network functions / callbacks ****/
var socket = null;
var connected = false;

function sendSnapshot() {
	sendData("SNAP " + serialiseSnapshot(SolemnSky.makeSnapshot([myid])))
} // this function needs to run a lot

//Connect to a server (client only)
function connect(address, port, path) {
	var name = prompt("Enter name");
	socket = new WebSocket("ws://" + address + ":" + port + path);
	
	socket.onopen = function() {
		//Connected
		connected = true;
		//Send a connect message
		sendData("CONNECT");
		sendData("NAME " + name);
	};
	socket.onclose = function() {
		//Disconnected
		connected = false;
		addChat("Disconnected");
	};
	socket.onerror = function() {
		alert("Do something here.");
		connected = false;
	};
	socket.onmessage = function(data) {
		parseData(data.data);
	};
}

//Send data to the socket server
function sendData(data) {
	if (connected) {
		socket.send(data);
	}
}

function parseData(data) {
	tick(data);
}
/**** }}} basic network functions / callbacks ****/

/*** {{{ tick: recieve data from the server ****/
function tick(data) {
	var split = data.split(" ");
	var command = split[0];
	split.splice(0, 1);
	data = split.join(" ");

	switch (command) {
	case "PLAYERS":
		//Example players blob:
		//numplayers;player;player;...
		var blobParts = data.split(';');
		var numPlayers = parseInt(blobParts[0]);
		
		for (var i = 0; i < numPlayers; i ++) {
			//playerid,x,y,vx,vy
			var playerDetails = blobParts[i+1].split(',');
			var playerName = playerDetails[0];
			var playerId = Utils.charToInt(playerDetails[1]);
			var playerX  = Utils.charToFloat(playerDetails[2]);
			var playerY  = Utils.charToFloat(playerDetails[3]);
			var playerVX = Utils.charToFloat(playerDetails[4]);
			var playerVY = Utils.charToFloat(playerDetails[5]);
			var playerA  = Utils.charToFloat(playerDetails[6]);
			var playerAV = Utils.charToFloat(playerDetails[7]);
			
			if (SolemnSky.findIndexById(playerId) === -1) {
				SolemnSky.addPlayer(playerId, playerX, playerY, playerName, "", "");
			}
			var player = SolemnSky.players[SolemnSky.findIndexById(playerId)];
			player.block.SetPosition(new b2Vec2(playerX, playerY));
			player.block.SetLinearVelocity(new b2Vec2(playerVX, playerVY));
			player.block.SetAngle(playerA);
			player.block.SetAngularVelocity(playerAV);
		}
		break;
	case "BOXES":
		var blobParts = data.split(";");
		var numBoxes = parseInt(blobParts[0]);

		for (var i = 0; i < numBoxes; i ++) {
			var boxDetails = blobParts[i + 1].split(",");
			var boxX = Utils.charToFloat(boxDetails[0]);
			var boxY = Utils.charToFloat(boxDetails[1]);
			var boxW = Utils.charToFloat(boxDetails[2]);
			var boxH = Utils.charToFloat(boxDetails[3]);
			var boxStatic = boxDetails[4];
			var boxFields = JSON.parse(boxDetails[5].replace(/\\:/g, ","));

			var box = SolemnSky.createBox(boxX, boxY, boxW, boxH, boxStatic, boxFields);
			SolemnSky.boxes.push(box);
		}
	case "PROJECTILES":
		var blobParts = data.split(';');
		var numProjectiles = parseInt(blobParts[0]);
		
		for (var i = 0; i < numProjectiles; i ++) {
			var projectileDetails = blobParts[i+1].split(',');
			var projectileLife = Utils.charToInt(projectileDetails[0]);
			var projectileX  = Utils.charToFloat(projectileDetails[1]);
			var projectileY  = Utils.charToFloat(projectileDetails[2]);
			var projectileVX = Utils.charToFloat(projectileDetails[3]);
			var projectileVY = Utils.charToFloat(projectileDetails[4]);
			var projectileA  = Utils.charToFloat(projectileDetails[5]);
			var projectileAV = Utils.charToFloat(projectileDetails[6]);

			var projectile = null;
			if (i < SolemnSky.projectiles.length) {
				projectile = SolemnSky.projectiles[i];
			} else {
				var projectile = SolemnSky.createBox(projectileX * SolemnSky.scale, projectileY * SolemnSky.scale, 10, 10, false, {});
				projectile.SetSleepingAllowed(false);
				SolemnSky.projectiles.push(projectile);
			}
			projectile.GetUserData().creationDate = Date.now() - projectileLife;
			projectile.SetPosition(new b2Vec2(projectileX, projectileY));
			projectile.SetLinearVelocity(new b2Vec2(projectileVX, projectileVY));
			projectile.SetAngle(projectileA);
			projectile.SetAngularVelocity(projectileAV);
		}

		//Delete any extras
		SolemnSky.projectiles.slice(numProjectiles).map(function(projectile) {
			this.world.DestroyBody(projectile);
		}, SolemnSky);
		SolemnSky.projectiles.splice(numProjectiles);
		break;
	case "SNAP":
		var snapshot = readSnapshot(data);
		break;
	case "ID":
		myid = parseInt(data[0]);

		addChat("Joined Server");
		break;
	case "JOIN":
		var name = data;
		addChat(name + " joined server.");
		break;
	case "CHAT":
		var id = split[0];
		var message = split.slice(1).join(" ");
		var name = SolemnSky.players[SolemnSky.findPlayerById(id)].name;
		addChat(name + ": " + message);
		break;
	}
}
/**** }}} tick: recieve data from the server ****/

/**** {{{ chat feature ****/
function htmlEscape(str) {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/  /g, ' &nbsp;')
}

function addChat(text) {
	document.getElementById("chatcontainer").innerHTML += "<div>" + htmlEscape(text) + "</div>";
}

function openChat() {
	document.getElementById("chatentry").style.display = "block";
	document.getElementById("chatentrybox").focus();
}

Mousetrap.bind('t', openChat, "keyup");
Mousetrap.bind('enter', openChat, "keyup");

document.getElementById("chatentrybox").onkeyup = function(e) {
	if (e.keyCode === 13) {
		var message = this.value;
		if (message !== "") sendData("CHAT " + message);

		document.getElementById("chatentry").style.display = "none";
		this.value = "";
	}
}
/**** }}} chat feature ****/

connect("198.55.237.151", 50042, "/");
