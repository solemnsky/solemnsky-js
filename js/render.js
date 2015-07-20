/*                  ******** render.js ********                    //
\\ This file defines a render() method for clients.                \\
//                  ******** render.js ********                    */

var renderer = 
	PIXI.autoDetectRenderer(1600, 900, {backgroundColor : 0x1099bb});
document.body.appendChild(renderer.view);

function setMargins(mleft, mtop) {
	document.body.style.setProperty("margin-left", mleft + "px")
	document.body.style.setProperty("margin-top", mtop + "px")
}

function smartResize() {
	w = window.innerWidth; h = window.innerHeight;
	if ((w / h) > (16 / 9)) {
		renderer.resize(h * (16 / 9), h)
		setMargins((w - (h * (16 / 9))) / 2, 0)
	} else {
		renderer.resize(w, w * (9 / 16))
		setMargins(0, (h - (w * (9 / 16))) / 2)
	}
}

var stage = new PIXI.Container();

var texture = PIXI.Texture.fromImage('http://pixijs.github.io/examples/_assets/basics/bunny.png');
var bunny = new PIXI.Sprite(texture);

bunny.anchor.x = 0.5;
bunny.anchor.y = 0.5;
bunny.position.x = 200;
bunny.position.y = 150;

stage.addChild(bunny);

animate();

function animate() {
	requestAnimationFrame(animate);

	// just for fun, let's rotate mr rabbit a little
	bunny.rotation += 0.1;
	smartResize()

	// render the container
	renderer.render(stage);
}
