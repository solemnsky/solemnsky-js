//Some global variables for the DOM
var canvas = document.getElementById("c");
var ctx = canvas.getContext("2d");

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
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = "#bbffbb";
	ctx.strokeStyle = "#77ff77";

	//Render player
	renderBox(world.block, 30, 30);
} // render()

//Start up the game
init();
requestAnimFrame(update);

//Keyboard keys, just set movement variables
Mousetrap.bind('up',    function() { movement.forward  =  true; }, 'keydown');
Mousetrap.bind('up',    function() { movement.forward  = false; }, 'keyup');
Mousetrap.bind('down',  function() { movement.backward =  true; }, 'keydown');
Mousetrap.bind('down',  function() { movement.backward = false; }, 'keyup');
Mousetrap.bind('left',  function() { movement.left     =  true; }, 'keydown');
Mousetrap.bind('left',  function() { movement.left     = false; }, 'keyup');
Mousetrap.bind('right', function() { movement.right    =  true; }, 'keydown');
Mousetrap.bind('right', function() { movement.right    = false; }, 'keyup');

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
	document.getElementById("lastmessage").innerHTML = data;
}

connect("198.55.237.151", 50042, "/");
