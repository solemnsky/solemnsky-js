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
	map.clear()
	map.beginFill(0xFFFFFF, 1)
	
	this.map.forEach(
		function(block) {
			var data = block.GetUserData()
			map.drawRect(
				data.x - (data.w / 2)
				, data.y - (data.h / 2)
				, data.w, data.h
			)
		}
	)
}

Vanilla.prototype.renderPlayers = function(delta, id, players) {
	players.removeChildren()

	this.players.forEach(
		function(player) {
			var pos = player.position; var rot = player.rotation
			/**** {{{ initialise anim object ****/
			function setPlayerSprite(sprite) {
				sprite.scale = new PIXI.Point((gameplay.playerWidth / 400), (gameplay.playerHeight / 200))
			}
			
			if (typeof player.anim === "undefined")
				player.anim = {thrustLevel: 0} 
			if (typeof player.anim.thrustSprite === "undefined") {
				player.anim.thrustSprite = new PIXI.Sprite(this.textures.playerThrust)
				setPlayerSprite(player.anim.thrustSprite) }
			if (typeof player.anim.normalSprite === "undefined") {
				player.anim.normalSprite = new PIXI.Sprite(this.textures.player)
				setPlayerSprite(player.anim.normalSprite) }
			if (typeof player.anim.nameText === "undefined")
				player.anim.nameText = new PIXI.Text(player.name, {font: "15px arial", fill: 0x003060})
			if (typeof player.anim.barView === "undefined")
				player.anim.barView = new PIXI.Graphics()
			/**** }}} initialise anim object ****/
			
			/**** {{{ afterburner animation  ****/
			if (player.afterburner) {
				player.anim.thrustLevel += (delta / 1000) * gameplay.graphicsThrustFade
			} else {
				player.anim.thrustLevel -= (delta / 1000) * gameplay.graphicsThrustFade	
			}
			if (player.anim.thrustLevel < 0) player.anim.thrustLevel = 0
			if (player.anim.thrustLevel > 1) player.anim.thrustLevel = 1
			/**** }}} afterburner animation  ****/
			
			/**** {{{ position player graphics ****/
			function placePlayerSprite(sprite) {
				sprite.pivot = new PIXI.Point(sprite.width / 2, sprite.height / 2)
				sprite.position = new PIXI.Point(pos.x, pos.y) 
				sprite.rotation = rot
			}

			placePlayerSprite(player.anim.thrustSprite); placePlayerSprite(player.anim.normalSprite)
			player.anim.thrustSprite.alpha = player.anim.thrustLevel

			player.anim.nameText.position = new PIXI.Point(pos.x - (player.anim.nameText.width / 2), (pos.y + gameplay.graphicsNameClear))

			player.anim.barView.clear()
			player.anim.barView.beginFill(0xFFFFFF, 0.5)
			player.anim.barView.drawRect((pos.x - (gameplay.graphicsBarWidth / 2)), (pos.y - gameplay.graphicsBarClear), (gameplay.graphicsBarWidth * player.health), gameplay.graphicsBarHeight)
			/**** }}} position player graphics ****/

			/**** {{{ add to players container ****/
			if (id == player.id) 
				players.addChild(player.anim.barView)
			players.addChild(player.anim.normalSprite)
			players.addChild(player.anim.thrustSprite)
			players.addChild(player.anim.nameText)
			/**** }}} add to players container ****/
		}
	, this)
}
/**** }}} render map and players ****/

Vanilla.prototype.initRender = function(stage) {
	this.textures = {}
	this.textures.player = new PIXI.Texture.fromImage(urls.playerSprite)
	this.textures.playerThrust = new PIXI.Texture.fromImage(urls.playerThrustSprite)

	stage.addChild(new PIXI.Graphics)
	stage.addChild(new PIXI.Container)
}

Vanilla.prototype.stepRender = function(id, stage, delta) {
	this.renderMap(stage.children[0])
	this.renderPlayers(delta, id, stage.children[1])
}
}
