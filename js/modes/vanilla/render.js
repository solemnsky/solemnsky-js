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
Vanilla.prototype.renderPlayers = function(id, players) {
	players.removeChildren()

	this.players.forEach(
		function(player) {
			var pos = player.position
			var rot = player.rotation
			var stalled = player.stalled
			var throttle = player.throttle
			var health = player.health

			var playerGraphics = new PIXI.Sprite(this.graphics.playerTexture)
			playerGraphics.scale = new PIXI.Point((gameplay.playerWidth / 400), (gameplay.playerHeight / 200))
			playerGraphics.pivot = new PIXI.Point((gameplay.playerWidth / 2) / (gameplay.playerWidth / 400), (gameplay.playerHeight / 2) / (gameplay.playerHeight / 200))
		
			playerGraphics.position = new PIXI.Point(pos.x, pos.y) 
			playerGraphics.rotation = rot;

			playerName = new PIXI.Text(player.name, {font: "12px", fill: 0x003060})
			playerName.position = new PIXI.Point(pos.x - (playerName.width / 2), (pos.y + 35))

			if (id == player.id) {
				playerBars = new PIXI.Graphics()
				playerBars.beginFill(0xFFFFFF, 1)
				playerBars.drawCircle(pos.x, (pos.y - 40), 5)

				players.addChild(playerBars)
			}

			players.addChild(playerGraphics)
			players.addChild(playerName)
		}
	, this)
}
/**** }}} render map and players ****/

Vanilla.prototype.initRender = function(stage) {
	this.graphics = {}
	this.graphics.playerTexture = new PIXI.Texture.fromImage(urls.playerSprite)

	stage.addChild(new PIXI.Container)
	stage.addChild(new PIXI.Container)
}

Vanilla.prototype.stepRender = function(id, stage, delta) {
	this.renderMap(stage.children[0])
	this.renderPlayers(id, stage.children[1])
}
}
