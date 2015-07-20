/*                  ******** render.js ********                    //
\\ This file defines a render() method for clients.                \\
//                  ******** render.js ********                    */

var renderer = 
	PIXI.autoDetectRenderer(1600, 900, {backgroundColor : 0x1099bb});
document.body.appendChild(renderer.view);

var stage = new PIXI.Container();

/**** {{{ smartResize() ****/
function setMargins(mleft, mtop) {
	document.body.style.setProperty("margin-left", mleft + "px")
	document.body.style.setProperty("margin-top", mtop + "px")
}

function smartResize() {
	w = window.innerWidth; h = window.innerHeight;
	if ((w / h) > (16 / 9)) {
		nw = h * (16 / 9); nh = h
		renderer.resize(nw, nh)
		setMargins((w - nw) / 2, 0)
	} else {
		nh = w * (9 / 16); nw = w
		renderer.resize(nw, nh)
		setMargins(0, (h - nh) / 2)
	}

	stage.scale = new PIXI.Point(nw / 1600, nh / 900)
}
/**** }}} smartResize() ****/

var texture = PIXI.Texture.fromImage('http://pixijs.github.io/examples/_assets/basics/bunny.png');
var bunny = new PIXI.Sprite(texture);

bunny.anchor.x = 0.5;
bunny.anchor.y = 0.5;
bunny.position.x = 800;
bunny.position.y = 450;
bunny.scale = new PIXI.Point(4, 4)

stage.addChild(bunny);

animate();

function animate() {
	bunny.rotation += 0.1;
	smartResize()

	renderer.render(stage);

	requestAnimationFrame(animate);
}
