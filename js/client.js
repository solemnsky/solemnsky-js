/**** {{{ basic network functions / callbacks ****/
var socket = null;
var connected = false;

function sendSnapshot() {
	sendData("SNAP " + serialiseSnapshot([SolemnSky.makePlayerSnapshot(myid, 0))])
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
		tick(data.data);
	};
}

//Send data to the socket server
function sendData(data) {
	if (connected) {
		socket.send(data);
	}
}
/**** }}} basic network functions / callbacks ****/

/*** {{{ tick: respond to data from the server ****/
function tick(data) {
	var split = data.split(" ");
	var command = split[0];
	split.splice(0, 1);
	data = split.join(" ");

	switch (command) {
	case "SNAP":
		SolemnSky.applySnapshot(SolemnSky.readSnapshot(data)); break;
	case "LIST":
		SolemnSky.applyListing(SolemnSky.readListing(data)); break;
	case "MAP":
		SolemnSky.loadMap(SolemnSky.readMap(data)); break;
	case "ID":
		myid = parseInt(data[0])
		addChat("Joined Server"); break;
	case "JOIN":
		addChat(data + " joined server."); break;
	case "CHAT":
		var id = split[0];
		var message = split.slice(1).join(" ");
		var name = SolemnSky.players[SolemnSky.findIndexById(id)].name;
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

/**** {{{ commented code ****/
	// from tick, used to recieve projectiles from the server
	/* case "PROJECTILES":
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
	*/ // commented out for now, will probably reintegrate
		// with the snapshot infrastructure
/**** }}} commented code ****/
