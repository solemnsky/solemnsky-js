/*          ******** vanilla/render.js ********       //
\\ Client-sided renderer for the vanilla game mode.   \\
//          ******** vanilla/render.js ********       */

PIXI = require('../../../assets/pixi.min.js')
urls = require('../../resources/urls.js')

//Extend the original vanilla object to contain the renderer
module.exports = function(Vanilla) {

/**** {{{ render map and players ****/
Vanilla.prototype.renderMap = function(map) {
	map.removeChildren()

	var mapGraphics = new PIXI.Graphics()

	mapGraphics.clear
	mapGraphics.beginFill(0xFFFFFF, 1)
	
	this.map.forEach(
		function(block) {
			var data = block.GetUserData()
			mapGraphics.drawRect(
				data.x - (data.w / 2)
				, data.y - (data.h / 2)
				, data.w, data.h
			)
		}
	)
	
	map.addChild(mapGraphics)
}
Vanilla.prototype.renderPlayers = function(players) {
	players.removeChildren()

	this.players.forEach(
		function(player) {
			var pos = player.position
			var rot = player.rotation
			var stalled = player.stalled
			var throttle = player.throttle
			var health = player.health

			var playerGraphics = new PIXI.Sprite.fromImage(urls.playerSprite)
			playerGraphics.scale = new PIXI.Point((gameplay.playerWidth / 400), (gameplay.playerWidth / 400))
		
			playerGraphics.position = new PIXI.Point(pos.x, pos.y)
			playerGraphics.rotation = rot;
			
			players.addChild(playerGraphics)
		}
	)
}
/**** }}} render map and players ****/

Vanilla.prototype.initRender = function(stage) {
	stage.addChild(new PIXI.Container)
	stage.addChild(new PIXI.Container)
}

Vanilla.prototype.stepRender = function(stage, delta) {
	this.renderMap(stage.children[0])
	this.renderPlayers(stage.children[1])
}
}
