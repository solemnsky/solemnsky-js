/*                  ******** vanilla/projectile.js ********        //
\\ Projectile objective, with box2d interface and gameplay mechanics. \\
//                  ******** vanilla/projectile.js ********        */

module.exports = Projectile

var Utils = require('../../resources/util.js')
var gameplay = require('./gameplay.js')
var Box2D = require('../../../assets/box2d.min.js')

/**** {{{ Projectile() ****/
function Projectile(game, id, x, y) {
	this.game = game
	this.id = id

	this.position = {x: x, y: y}
	this.block = 
}
/**** }}} Projectile() ****/
