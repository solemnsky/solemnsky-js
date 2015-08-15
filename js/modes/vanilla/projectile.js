/*                  ******** vanilla/projectile.js ********        //
\\ Projectile objective, with box2d interface and gameplay mechanics. \\
//                  ******** vanilla/projectile.js ********        */

module.exports = Projectile

// var utils = require('../../resources/util.js')
var gameplay = require('./gameplay.js')
var Box2D = require('../../../assets/box2d.min.js')

/**** {{{ box2d synonyms ****/
var b2Vec2         = Box2D.Common.Math.b2Vec2
// var b2BodyDef      = Box2D.Dynamics.b2BodyDef
// var b2Body         = Box2D.Dynamics.b2Body
// var b2FixtureDef   = Box2D.Dynamics.b2FixtureDef
// var b2Fixture      = Box2D.Dynamics.b2Fixture // var b2World        = Box2D.Dynamics.b2World
// var b2MassData     = Box2D.Collision.Shapes.b2MassData
// var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
// var b2CircleShape  = Box2D.Collision.Shapes.b2CircleShape
// var b2DebugDraw    = Box2D.Dynamics.b2DebugDraw;
/**** }}} box2d synonyms ****/

/**** {{{ Projectile() ****/
function Projectile(game, id, owner, pos) {
	// TODO: expand definition
	// this is just a placeholder, projectiles should be
	// freely parameterized and definable through outer modes

	this.game = game
	this.owner = owner

	this.position = pos
	this.dimensions = {w: 5, h: 5}

	this.shape = 
		game.createShape("rectangle" , {width: 5, height: 5})
	this.block = game.createBody( this.position, this.shape, 
		{
			isStatic: false
			, isPlayer: false
			, bodyType: "projectile"
			, bodyId: id
		}
	) 
}
/**** }}} Projectile() ****/

/**** {{{ box2d interface ****/
Projectile.prototype.writeToBlock = function() {
	this.block.SetPosition(new b2Vec2(
		this.position.x / gameplay.physicsScale
		, this.position.y / gameplay.physicsScale
	))
}

Projectile.prototype.readFromBlock = function() {
	var pos = this.block.GetPosition()

	this.position.x = pos.x * gameplay.physicsScale
	this.position.y = pos.y * gameplay.physicsScale
}
/**** }}} box2d interface ****/

Projectile.prototype.step = function(delta) {
	// for example, it could fade out
}
