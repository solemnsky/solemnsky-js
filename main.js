/**** {{{ initialisation, constants, helper functions ****/
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

/**** }}} initialisation, constants, helper functions ****/

//Movement keys, if they're held down
var movement = {
	forward: false,
	backward: false,
	up: false,
	down: false
};

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

		var playerX = player.block.GetPosition().x * SolemnSky.scale;
		var playerY = player.block.GetPosition().y * SolemnSky.scale;

		ctx.resetTransform();
		ctx.fillStyle = "#000000";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(player.name, playerX, playerY);
	});
	SolemnSky.boxes.forEach(function each(box) {
		var data = box.GetUserData();

		ctx.fillStyle = 
      "#" + tinycolor("hsv(" + (100 * box.life / data.fields.life) + ", 30, 100)").toHex();
		ctx.strokeStyle = "#" + tinycolor("hsv(" + (100 * box.life / data.fields.life)+ ", 50, 100)").toHex();

		renderBox(box, data.w, data.h);
	});
} // render()

now = Date.now();
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
} // update()
//Start up the game
SolemnSky = new Game();
SolemnSky.setFPS(60);
SolemnSky.init();
requestAnimFrame(update);


//Keyboard keys, just set movement variables
Mousetrap.bind('up', 
  function() { movement.forward = true; }, 'keydown');
Mousetrap.bind('up', 
  function() { movement.forward = false; }, 'keyup');
Mousetrap.bind('down', 
  function() { movement.backward = true; }, 'keydown');
Mousetrap.bind('down', 
  function() { movement.backward = false; }, 'keyup');
Mousetrap.bind('left', 
  function() { movement.left = true; }, 'keydown');
Mousetrap.bind('left',
  function() { movement.left = false; }, 'keyup');
Mousetrap.bind('right', 
  function() { movement.right = true; }, 'keydown');
Mousetrap.bind('right', 
  function() { movement.right = false; }, 'keyup');

function sendEvent() {
	sendData(makeMotionEvent.apply(kbdState).show) //makeMotionEvent(array).show gives you a nice string 
	// deprecated, now using partial snapshots
}

var socket = null;
var connected = false;

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
		socket.send(data + "\n");
	}
}

function parseData(data) {
	tick(data);
}

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
			var playerId = parseInt(playerDetails[1]);
			var playerX  = parseFloat(playerDetails[2]);
			var playerY  = parseFloat(playerDetails[3]);
			var playerVX = parseFloat(playerDetails[4]);
			var playerVY = parseFloat(playerDetails[5]);
			var playerA  = parseFloat(playerDetails[6]);
			var playerAV = parseFloat(playerDetails[7]);
			
			if (SolemnSky.findPlayerById(playerId) === -1) {
				SolemnSky.addPlayer(playerId, playerX, playerY, playerName, "", "");
			}
			var player = SolemnSky.players[SolemnSky.findPlayerById(playerId)];
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
			var boxX = parseInt(boxDetails[0]);
			var boxY = parseInt(boxDetails[1]);
			var boxW = parseInt(boxDetails[2]);
			var boxH = parseInt(boxDetails[3]);
			var boxStatic = boxDetails[4];
			var boxFields = JSON.parse(boxDetails[5].replace(/\\:/g, ","));

			var box = SolemnSky.createBox(boxX, boxY, boxW, boxH, boxStatic, boxFields);
			box.SetUserData({x: boxX, y: boxY, w: boxW, h: boxH, static: boxStatic, fields: boxFields});
			SolemnSky.boxes.push(box);
		}

		break;
	}
}

connect("198.55.237.151", 50042, "/");
