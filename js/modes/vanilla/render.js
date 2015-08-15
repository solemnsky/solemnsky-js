/*					******** vanilla/render.js ********				//
\\ Client-sided renderer for the vanilla game mode.		\\
//					******** vanilla/render.js ********				*/

var PIXI = require('../../../assets/pixi.min.js')
var urls = require('../../resources/urls.js')
var gameplay = require('./gameplay.js')

//Extend the original vanilla object to contain the renderer
module.exports = function(Vanilla) {

/**** {{{ renderMap ****/
	Vanilla.prototype.renderMap = function(pan, delta, id) {
		// clear mapStage
		this.graphics.mapStage.removeChildren()

		// add anim elements back to mapStage
		this.map.forEach(
			function(block) {
				var pos = block.position
				var dim = block.dimensions

				// initialise anim object once
				if (typeof block.anim == "undefined") {
					var mapGraphics = new PIXI.Graphics()
					mapGraphics.clear()
					mapGraphics.beginFill(0xFFFFFF, 1)
					mapGraphics.drawRect(
						pos.x - dim.w / 2 
						, pos.y - dim.h / 2 
						, dim.w, dim.h)
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
		// clear projectileStage
		this.graphics.projectileStage.removeChildren()

		// add anim elements back to projectileStage		
		this.projectiles.forEach(
			function(elem) {
				var pos = elem.position
				var dim = elem.dimensions
				
				// initialise anim object once
				if (typeof elem.anim == "undefined" ) {
					elem.anim = new PIXI.Graphics()
					elem.anim.clear()
					elem.anim.beginFill(0xFFFFFF, 1)
					elem.anim.drawRect(-dim.w / 2 , -dim.h / 2 , dim.w, dim.h)
				}
				elem.anim.position.set(pan.x + pos.x, pan.y + pos.y)
				this.graphics.mapStage.addChild(elem.anim)
			}	
		, this)
	}
/**** }}} renderProjectiles	

/**** {{{ renderPlayers ****/
	Vanilla.prototype.renderPlayers = function(pan, delta, id) {
		// clear playerStage
		this.graphics.playerStage.removeChildren()

		// add anim elements back to playerStage		
		this.players.forEach(
			function(player) {
				var pos = player.position; var rot = player.rotation
				/**** {{{ initialise anim object ****/
				function setPlayerSprite(sprite) {
					sprite.anchor.set(0.5, 0.5)
					sprite.scale = new PIXI.Point(gameplay.playerWidth / 400, gameplay.playerHeight / 200)
				}
				
				if (typeof player.anim === "undefined") {
					player.anim = {thrustLevel: 0} 
					player.anim.speedSprite = 
						new PIXI.Sprite(this.textures.playerSpeed)
					player.anim.thrustSprite = 
						new PIXI.Sprite(this.textures.playerThrust)
					player.anim.normalSprite = 
						new PIXI.Sprite(this.textures.player)
					player.anim.nameText = 
						new PIXI.Text(player.name
								, {font: "15px arial", fill: 0x003060})
					player.anim.barView = new PIXI.Graphics()

					setPlayerSprite(player.anim.normalSprite) 
					setPlayerSprite(player.anim.thrustSprite) 
					setPlayerSprite(player.anim.speedSprite)
				}
				/**** }}} initialise anim object ****/
				
				/**** {{{ afterburner animation  ****/
				if (player.afterburner) {
					player.anim.thrustLevel += delta / 1000 * gameplay.graphicsThrustFade
				} else {
					player.anim.thrustLevel -= delta / 1000 * gameplay.graphicsThrustFade	
				}
				if (player.anim.thrustLevel < 0) player.anim.thrustLevel = 0
				if (player.anim.thrustLevel > 1) player.anim.thrustLevel = 1
				/**** }}} afterburner animation  ****/
				
				/**** {{{ refresh ****/
				function placePlayerSprite(sprite) {
					sprite.position.set(pos.x + pan.x, pos.y + pan.y) 
					sprite.rotation = rot
				}

				// place player sprites
				placePlayerSprite(player.anim.thrustSprite) 
				placePlayerSprite(player.anim.normalSprite)
				placePlayerSprite(player.anim.speedSprite)

				// adjust alphas
				player.anim.thrustSprite.alpha = player.anim.thrustLevel
				player.anim.speedSprite.alpha = Math.pow(player.speed, 3)

				// place player label
				player.anim.nameText.position.set(pan.x + pos.x - player.anim.nameText.width / 2, pan.y + pos.y + gameplay.graphicsNameClear)

				function drawBar(i, v) {
					player.anim.barView.drawRect(
						pan.x + pos.x - gameplay.graphicsBarWidth / 2
						, pan.y + pos.y - gameplay.graphicsBarClear
								 - i * gameplay.graphicsBarHeight
						, gameplay.graphicsBarWidth * v
						, gameplay.graphicsBarHeight)
				}

				// draw bar
				if (id === player.id) {
					player.anim.barView.clear()
					player.anim.barView.beginFill(0xFFFFFF, 0.5)
					drawBar(0, player.health)
					if (!player.stalled) {
						player.anim.barView.beginFill(0xFF0000, 0.5)
						drawBar(1, player.throttle)
						player.anim.barView.beginFill(0x00FF00, 0.5)
						drawBar(2, player.speed)
					}
				}

				/**** }}} refresh ****/

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

	Vanilla.prototype.loadAssets = function(key, onProgress) {
		this.textures = {}
		var loadPairs =
			[ {name: "player", url: urls.playerSprite}
			, {name: "playerThrust", url: urls.playerThrustSprite}
			, {name: "playerSpeed", url: urls.playerSpeedSprite} ]
		loadPairs.forEach(
			function(pair, index) {
				this.textures[pair.name] = new PIXI.Texture.fromImage(pair.url)
				onProgress(index / loadPairs.length)
			} , this)
	}

	Vanilla.prototype.initRender = function(stage) {
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
			var comOffset = {x: 1/6 * gameplay.playerWidth * Math.cos(player.rotation), y: 1/6 * gameplay.playerWidth * Math.sin(player.rotation)}
			pan = 
				{ x: comOffset.x + -player.position.x + 800 
				, y: comOffset.y + -player.position.y + 450}
		} 

		this.renderMap(pan, delta, id)
		this.renderProjectiles(pan, delta, id)	
		this.renderPlayers(pan, delta, id)
	}
}
