/*          ******** vanilla/render.js ********       //
\\ Client-sided renderer for the vanilla game mode.   \\
//          ******** vanilla/render.js ********       */

var PIXI = require('../../../assets/pixi.min.js')
var urls = require('../../resources/urls.js')
var gameplay = require('./gameplay.js')

//Extend the original vanilla object to contain the renderer
module.exports = function(Vanilla) {

/**** {{{ renderMap ****/
	Vanilla.prototype.renderMap = function(pan, delta, id) {
		this.graphics.mapStage.removeChildren()
		this.map.forEach(
			function(block) {
				if (typeof block.anim == "undefined") {
					var mapGraphics = new PIXI.Graphics()
					mapGraphics.clear()
					mapGraphics.beginFill(0xFFFFFF, 1)
					mapGraphics.drawRect(
						block.x - (block.w / 2) 
						, block.y - (block.h / 2) 
						, block.w, block.h)
					block.anim = mapGraphics
				}
				block.anim.position.set(pan.x, pan.y)
				this.graphics.mapStage.addChild(block.anim)
			}	
		, this)
	}
/**** }}} renderMap ****/

/**** {{{ renderProjectiles ****/
	Vanilla.prototype.renderProjectiles = function(pan, delta, id) {
	}
/**** }}} renderProjectiles	

/**** {{{ renderPlayers ****/
	Vanilla.prototype.renderPlayers = function(pan, delta, id) {
		this.graphics.playerStage.removeChildren()

		this.players.forEach(
			function(player) {
				var pos = player.position; var rot = player.rotation
				/**** {{{ initialise anim object ****/
				function setPlayerSprite(sprite) {
					sprite.anchor.set(0.5, 0.5)
					sprite.scale = new PIXI.Point((gameplay.playerWidth / 400), (gameplay.playerHeight / 200))
				}
				
				if (typeof player.anim === "undefined")
					player.anim = {thrustLevel: 0} 
				if (typeof player.anim.speedSprite === "undefined") {
					player.anim.speedSprite = new PIXI.Sprite(this.textures.playerSpeed)
					setPlayerSprite(player.anim.speedSprite)
				}
				if (typeof player.anim.thrustSprite === "undefined") {
					player.anim.thrustSprite = new PIXI.Sprite(this.textures.playerThrust)
					setPlayerSprite(player.anim.thrustSprite) 
				}
				if (typeof player.anim.normalSprite === "undefined") {
					player.anim.normalSprite = new PIXI.Sprite(this.textures.player)
					setPlayerSprite(player.anim.normalSprite) 
				}
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
					sprite.position.set(pos.x + pan.x, pos.y + pan.y) 
					sprite.rotation = rot
				}

				placePlayerSprite(player.anim.thrustSprite); placePlayerSprite(player.anim.normalSprite); placePlayerSprite(player.anim.speedSprite)
				player.anim.thrustSprite.alpha = player.anim.thrustLevel
				player.anim.speedSprite.alpha = Math.pow(player.speed, 3)

				player.anim.nameText.position.set(pan.x + pos.x - (player.anim.nameText.width / 2), pan.y + pos.y + gameplay.graphicsNameClear)

				player.anim.barView.clear()
				player.anim.barView.beginFill(0xFFFFFF, 0.5)
				player.anim.barView.drawRect(pan.x + pos.x - (gameplay.graphicsBarWidth / 2), pan.y + pos.y - gameplay.graphicsBarClear, (gameplay.graphicsBarWidth * player.health), gameplay.graphicsBarHeight)
				if (!player.stalled) {
					player.anim.barView.beginFill(0xFF0000, 0.5)
					player.anim.barView.drawRect(pan.x + pos.x - (gameplay.graphicsBarWidth / 2), pan.y - gameplay.graphicsBarHeight + pos.y - gameplay.graphicsBarClear, (gameplay.graphicsBarWidth * player.throttle), gameplay.graphicsBarHeight)
					player.anim.barView.beginFill(0x00FF00, 0.5)
					player.anim.barView.drawRect(pan.x + pos.x - (gameplay.graphicsBarWidth / 2), pan.y - (2 * gameplay.graphicsBarHeight) + pos.y - gameplay.graphicsBarClear, (gameplay.graphicsBarWidth * player.speed), gameplay.graphicsBarHeight)
				}
				/**** }}} position player graphics ****/

				/**** {{{ add to players container ****/
				var wholePlayer = new PIXI.Container()
				
				wholePlayer.addChild(player.anim.normalSprite)
				wholePlayer.addChild(player.anim.thrustSprite)
				wholePlayer.addChild(player.anim.speedSprite)
				wholePlayer.addChild(player.anim.nameText)
				if (id === player.id) 
					wholePlayer.addChild(player.anim.barView)

				this.graphics.playerStage.addChild(wholePlayer)							
				/**** }}} add to players container ****/
			}
		, this)
	}
/**** }}} renderPlayers ****/

	Vanilla.prototype.initRender = function(stage) {
		this.textures = {}
		this.textures.player = new PIXI.Texture.fromImage(urls.playerSprite)
		this.textures.playerThrust = 
			new PIXI.Texture.fromImage(urls.playerThrustSprite)
		this.textures.playerSpeed = 
			new PIXI.Texture.fromImage(urls.playerSpeedSprite)
		
		this.graphics.mapStage = new PIXI.Container()
		this.graphics.projectileStage = new PIXI.Container()
		this.graphics.playerStage = new PIXI.Container()

		stage.addChild(this.graphics.mapStage)
		stage.addChild(this.graphics.projectileStage)
		stage.addChild(this.graphics.playerStage)
	}

	Vanilla.prototype.stepRender = function(id, stage, delta) {
		var player = this.findPlayerById(id)
		var pan = {x: 0, y: 0}

		if (player !== null) {
			var comOffset = {x: (1/6) * gameplay.playerWidth * Math.cos(player.rotation), y: (1/6) * gameplay.playerWidth * Math.sin(player.rotation)}
			pan = 
				{ x: comOffset.x + -(player.position.x) + 800 
				, y: comOffset.y + -(player.position.y) + 450}
		} 

		this.renderMap(pan, delta, id)
		this.renderProjectiles(pan, delta, id)	
		this.renderPlayers(pan, delta, id)
	}
}
