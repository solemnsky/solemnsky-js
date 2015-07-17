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

//Current keyboard keys pressed: up down left right
var kbdState = [false, false, false, false]

//Current window size
function updateWindowSize() {
	windowSize = {
		width: window.innerWidth || document.body.clientWidth,
		height: window.innerHeight || document.body.clientHeight
	}
}; updateWindowSize();

//List of boxes with which to initialize the world 
var boxes = [
	{x: canvas.width / 2, y: canvas.height, w: 600, h: 10, static: true, fields: {life: 1e300}},
	{x:  90, y:  30, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}},
	{x: 130, y: 110, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}},
	{x: 470, y: 230, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}},
	{x: 210, y: 130, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}},
	{x: 350, y:  30, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}},
	{x: 390, y: 140, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}},
	{x: 430, y: 270, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}},
	{x: 570, y: 300, w: 40, h: 40, static: true, fields: {restitution: 0.7, life: 10000}}
];

//http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function() {
    return window.requestAnimationFrame   || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function(callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 10);
        };
})();

//Current high score
var hiscore = 0;

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
	var playerX = body.GetPosition().x * world.scale;
	var playerY = body.GetPosition().y * world.scale;

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
	ctx.fillRect(0, 0, 100, 100);

	ctx.fillStyle = "#bbffbb";
	ctx.strokeStyle = "#77ff77";

	//Render player
	players.forEach(function each(player) {
		renderBox(player.block, 30, 30);
	});
} // render()

function update() {
	SolemnSky.update();
	render();
	requestAnimFrame(update);
} // update()
//Start up the game
SolemnSky = new Game();
SolemnSky.init();
// SolemnSky.addUpdateCallback(render);
requestAnimFrame(update);


//Keyboard keys, just set movement variables
Mousetrap.bind('up',    function() { kbdState[0] = true  }, 'keydown');
Mousetrap.bind('up',    function() { kbdState[0] = false }, 'keyup');
Mousetrap.bind('down',  function() { kbdState[1] = true  }, 'keydown');
Mousetrap.bind('down',  function() { kbdState[1] = false }, 'keyup');
Mousetrap.bind('left',  function() { kbdState[2] = true  }, 'keydown');
Mousetrap.bind('left',  function() { kbdState[2] = false }, 'keyup');
Mousetrap.bind('right', function() { kbdState[3] = true  }, 'keydown');
Mousetrap.bind('right', function() { kbdState[3] = false }, 'keyup');

function sendEvent() {
	sendData(makeMotionEvent.apply(kbdState).show) //makeMotionEvent(array).show gives you a nice string 
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
		socket.send(data);
	}
}

function parseData(data) {
	tick(data);
}

function tick(blob) {
    //Example tick blob:
    //numplayers;player;player;...

    var blobParts = blob.split(';');
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
        
        if (SolemnSky.findPlayerById(playerId) === -1) {
        	SolemnSky.addPlayer(playerId, playerX, playerY, playerName, "", "");
        }
        var player = players[SolemnSky.findPlayerById(playerId)];
        player.block.SetPosition(new b2Vec2(playerX, playerY));
        player.block.SetLinearVelocity(new b2Vec2(playerVX, playerVY));
    }

    document.getElementById("lastmessage").innerHTML = blob;
}

connect("198.55.237.151", 50042, "/");
