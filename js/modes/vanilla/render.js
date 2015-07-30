/*          ******** vanilla/render.js ********       //
\\ Client-sided renderer for the vanilla game mode.   \\
//          ******** vanilla/render.js ********       */

PIXI = require('../../../assets/pixi.min.js')

//Extend the original vanilla object to contain the renderer
exports.extend = function(Vanilla) {

/**** {{{ initRender() and stepRender() ****/
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

			var playerGraphics = new PIXI.Graphics()

			playerGraphics.clear()

			// at this point we have a pale matchstick with a red head

			// if it's not stalled, draw the throttle on a pale white body
			if (!player.stalled) {
				// pale white body
				playerGraphics.beginFill(0xFFFFFF , 0.2)
				playerGraphics.drawRect(-(gameplay.playerWidth / 2), -(gameplay.playerHeight / 2), gameplay.playerWidth, gameplay.playerHeight)

				// throttle view
				playerGraphics.beginFill(0xFFFFFF, player.afterburner? 1 : 0.5)
				playerGraphics.drawRect(-(gameplay.playerWidth / 2), -(gameplay.playerHeight / 2), (gameplay.playerWidth - 15) * player.throttle, gameplay.playerHeight)
				
			}

			// if it is, draw a pale blue body
			if (player.stalled) {
				if (!player.afterburner) {
					// pale blue body
					playerGraphics.beginFill(0x000030 , 1)
					playerGraphics.drawRect(-(gameplay.playerWidth / 2), -(gameplay.playerHeight / 2), gameplay.playerWidth, gameplay.playerHeight)
				} else {
					// pale blue body
					playerGraphics.beginFill(0x000050 , 1)
					playerGraphics.drawRect(-(gameplay.playerWidth / 2), -(gameplay.playerHeight / 2), gameplay.playerWidth, gameplay.playerHeight)
				}
			}

			// draw a red head on top
			playerGraphics.beginFill(0xFF0000, health)
			playerGraphics.drawRect(15, -(gameplay.playerHeight / 2), ((gameplay.playerWidth / 2) - 15), gameplay.playerHeight)
			
			playerGraphics.position = new PIXI.Point(pos.x, pos.y)
			playerGraphics.rotation = rot;
			
			players.addChild(playerGraphics)
		}
	)
}

Vanilla.prototype.initRender = function(stage) {
	stage.addChild(new PIXI.Container)
	stage.addChild(new PIXI.Container)
}

Vanilla.prototype.stepRender = function(stage, delta) {
	this.renderMap(stage.children[0])
	this.renderPlayers(stage.children[1])
}
/**** }}} initRender() and stepRender()  ****/

}
