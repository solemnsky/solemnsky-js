/*          ******** vanilla/render.js ********       //
\\ Client-sided renderer for the vanilla game mode.   \\
//          ******** vanilla/render.js ********       */

PIXI = require('../../../assets/pixi.min.js')
urls = require('../../resources/urls.js')
gameplay = require('./gameplay.js')

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

Vanilla.prototype.renderPlayers = function(delta, id, players) {
	players.removeChildren()

	this.players.forEach(
		function(player) {
			if (typeof player.anim == "undefined")
				player.anim = {thrustLevel: 0} 

			var pos = player.position
			var rot = player.rotation
			
			// thrustLevel modification
			if (player.afterburner) {
				player.anim.thrustLevel += (delta / 1000) * gameplay.graphicsThrustFade
			} else {
				player.anim.thrustLevel -= (delta / 1000) * gameplay.graphicsThrustFade	
			}
			if (player.anim.thrustLevel < 0) player.anim.thrustLevel = 0
			if (player.anim.thrustLevel > 1) player.anim.thrustLevel = 1

			var thrustSprite = new PIXI.Sprite(this.textures.playerThrust)
			var normalSprite = new PIXI.Sprite(this.textures.player)
			
			function placeSprite(sprite) {
				sprite.pivot = new PIXI.Point(sprite.width / 2, sprite.height / 2)
				sprite.scale = new PIXI.Point((gameplay.playerWidth / 400), (gameplay.playerHeight / 200))
				sprite.position = new PIXI.Point(pos.x, pos.y) 
				sprite.rotation = rot;
			}

			placeSprite(thrustSprite); placeSprite(normalSprite)
			thrustSprite.alpha = player.anim.thrustLevel

			playerName = new PIXI.Text(player.name, {font: "15px arial", fill: 0x003060})
			playerName.position = new PIXI.Point(pos.x - (playerName.width / 2), (pos.y + gameplay.graphicsNameClear))

			if (id == player.id) {
				playerBars = new PIXI.Graphics()
				playerBars.beginFill(0xFFFFFF, 0.5)
				playerBars.drawRect((pos.x - (gameplay.graphicsBarWidth / 2)), (pos.y - gameplay.graphicsBarClear), gameplay.graphicsBarWidth, gameplay.graphicsBarHeight)

				players.addChild(playerBars)
			}

			players.addChild(normalSprite)
			players.addChild(thrustSprite)
			players.addChild(playerName)
		}
	, this)
}
/**** }}} render map and players ****/

Vanilla.prototype.initRender = function(stage) {
	this.textures = {}
	this.textures.player = new PIXI.Texture.fromImage(urls.playerSprite)
	this.textures.playerThrust = new PIXI.Texture.fromImage(urls.playerThrustSprite)

	stage.addChild(new PIXI.Container)
	stage.addChild(new PIXI.Container)
}

Vanilla.prototype.stepRender = function(id, stage, delta) {
	this.renderMap(stage.children[0])
	this.renderPlayers(delta, id, stage.children[1])
}
}
